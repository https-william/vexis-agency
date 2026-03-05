"""
Vexis Agency — FastAPI Gateway (v2 — Real Agent Brain)

The central API gateway that routes requests to LangGraph or CrewAI agents,
manages WebSocket connections for the dashboard, and handles Groq key rotation.

Phase 2 upgrade: stubs replaced with real LangGraph/CrewAI engines,
persistent memory via Redis, task orchestrator for routing, and
agent profiles for personality/guardrails.

Endpoints:
    GET  /                          → Health check
    GET  /api/agents                → List all agents with status
    GET  /api/agents/{name}         → Get detailed agent info
    POST /api/agents/{name}/chat    → Send message to a specific agent
    GET  /api/rate-limiter/status   → Groq key rotation status
    GET  /api/memory/stats          → Memory usage per agent
    POST /api/orchestrate           → Auto-route a message to the best agent
    WS   /ws/chat                   → WebSocket for real-time agent chat
"""

import asyncio
import json
import logging
import sys
import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

import redis.asyncio as aioredis
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import settings
from rate_limiter import GroqKeyRotator

# Add the project root to sys.path so we can import agents
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.profiles import PROFILES, get_profile, build_system_prompt
from agents.orchestrator import TaskOrchestrator
from agents.memory import AgentMemory
from agents.langgraph_engine import LangGraphEngine
from agents.crewai_engine import CrewAIEngine, SCOUT_RESEARCH_CHAIN, ECHO_OUTREACH_CHAIN
from scraping.lead_pipeline import LeadPipeline
from scraping.prospect_research import ProspectResearcher

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("vexis.gateway")

# ---------------------------------------------------------------------------
# Build AGENTS registry from profiles (single source of truth)
# ---------------------------------------------------------------------------
AGENTS = {}
for agent_id, profile in PROFILES.items():
    AGENTS[agent_id] = {
        "name": profile["name"],
        "title": profile["title"],
        "icon": profile["icon"],
        "engine": profile["engine"],
        "status": "online",
        "personality": profile["personality"],
        "features": profile["features"],
        "guardrails": profile["guardrails"],
        "proactive_triggers": profile["proactive_triggers"],
    }


# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------
class ChatMessage(BaseModel):
    message: str
    context: Optional[dict] = None


class OrchestrateRequest(BaseModel):
    message: str
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    agent: str
    agent_title: str
    agent_icon: str
    message: str
    timestamp: str
    metadata: Optional[dict] = None


class AgentStatus(BaseModel):
    name: str
    title: str
    icon: str
    engine: str
    status: str
    features: list[str]


# ---------------------------------------------------------------------------
# Global instances
# ---------------------------------------------------------------------------
redis_client: Optional[aioredis.Redis] = None
key_rotator: Optional[GroqKeyRotator] = None
agent_memory: AgentMemory = AgentMemory()
orchestrator: TaskOrchestrator = TaskOrchestrator()
langgraph_engine: LangGraphEngine = LangGraphEngine()
crewai_engine: CrewAIEngine = CrewAIEngine()

# Per-agent conversation history (in-memory for now, Redis-backed later)
conversation_histories: dict[str, list[dict]] = {}


# ---------------------------------------------------------------------------
# App Lifecycle
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    global redis_client, key_rotator

    # Connect Redis
    logger.info(f"Connecting to Redis at {settings.redis_url}")
    redis_client = aioredis.from_url(settings.redis_url, decode_responses=False)
    await redis_client.ping()
    logger.info("Redis connected ✓")

    # Initialize rate limiter
    api_keys = settings.groq_api_keys
    if api_keys:
        key_rotator = GroqKeyRotator(api_keys)
        await key_rotator.initialize(redis_client)
        logger.info(f"Groq key rotator initialized with {len(api_keys)} keys ✓")
    else:
        logger.warning("No Groq API keys configured — agents will not function")

    # Initialize memory
    await agent_memory.initialize(redis_client)
    logger.info("Agent memory system initialized ✓")

    logger.info(f"Loaded {len(AGENTS)} agent profiles ✓")
    for aid, a in AGENTS.items():
        logger.info(f"  {a['icon']} {a['name']} ({a['title']}) — {a['engine']}")

    logger.info("🚀 Vexis Agency Gateway v2 is live!")
    yield

    # Shutdown
    if redis_client:
        await redis_client.close()
    logger.info("Gateway shutdown complete")


# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Vexis Agency Gateway",
    description="Multi-Agent System API Gateway — routes to LangGraph/CrewAI agents with memory and orchestration",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Core Agent Execution
# ---------------------------------------------------------------------------
async def execute_agent(agent_id: str, message: str, context: dict = None) -> dict:
    """
    Execute an agent using the appropriate engine (LangGraph or CrewAI).
    
    This is the core function shared by REST and WebSocket endpoints.
    Handles: profile loading, memory retrieval, engine routing, memory storage,
    token tracking, and handoff detection.
    
    Returns:
        dict with: response, agent_name, agent_title, agent_icon, metadata
    """
    profile = get_profile(agent_id)
    if not profile:
        raise ValueError(f"Unknown agent: {agent_id}")

    if not key_rotator:
        raise RuntimeError("No Groq API keys configured")

    # 1. Get an available API key
    api_key = await key_rotator.get_available_key()

    # 2. Retrieve relevant memories
    memory_context = await agent_memory.get_context_string(agent_id, message)

    # 3. Build system prompt with personality + memory
    system_prompt = build_system_prompt(profile, memory_context)

    # 4. Get conversation history
    history = conversation_histories.get(agent_id, [])

    # 5. Route to the correct engine
    model = settings.default_model

    if profile["engine"] == "langgraph":
        result = await langgraph_engine.run(
            agent_id=agent_id,
            agent_name=profile["name"],
            agent_title=profile["title"],
            message=message,
            system_prompt=system_prompt,
            api_key=api_key,
            model=model,
            memory_context=memory_context,
            conversation_history=history,
        )
    else:  # crewai
        # Detect if we should use a chain
        subtasks = _detect_subtasks(agent_id, message)
        result = await crewai_engine.run(
            agent_id=agent_id,
            agent_name=profile["name"],
            agent_title=profile["title"],
            message=message,
            system_prompt=system_prompt,
            api_key=api_key,
            model=model,
            memory_context=memory_context,
            conversation_history=history,
            subtasks=subtasks,
        )

    # 6. Record usage
    tokens = result.get("metadata", {}).get("tokens_used", 200)
    await key_rotator.record_usage(api_key, tokens_used=tokens)

    # 7. Store memory of this interaction
    await agent_memory.add(
        agent_id,
        f"User asked: '{message[:100]}'. I responded about: {result['response'][:100]}",
        metadata={"type": "conversation", "tokens": tokens},
    )

    # 8. Update conversation history
    if agent_id not in conversation_histories:
        conversation_histories[agent_id] = []
    conversation_histories[agent_id].append({"role": "user", "content": message})
    conversation_histories[agent_id].append({"role": "assistant", "content": result["response"]})
    # Keep only last 20 messages
    conversation_histories[agent_id] = conversation_histories[agent_id][-20:]

    # 9. Handle handoffs
    if result.get("handoff"):
        handoff_target = result["handoff"]
        logger.info(f"🔄 Handoff: {profile['name']} → {handoff_target}")
        # Store in metadata for the frontend to show
        if "metadata" not in result:
            result["metadata"] = {}
        result["metadata"]["handoff_suggested"] = handoff_target

    return {
        "response": result["response"],
        "agent_name": profile["name"],
        "agent_title": profile["title"],
        "agent_icon": profile["icon"],
        "metadata": result.get("metadata", {}),
    }


def _detect_subtasks(agent_id: str, message: str) -> list[str] | None:
    """Detect if a CrewAI agent should use a multi-step chain for this request."""
    message_lower = message.lower()

    if agent_id == "scout":
        research_signals = ["research", "deep dive", "analyze", "brief", "look into", "tell me about"]
        if any(s in message_lower for s in research_signals):
            return SCOUT_RESEARCH_CHAIN

    if agent_id == "echo":
        outreach_signals = ["draft email", "outreach email", "write email", "cold email"]
        if any(s in message_lower for s in outreach_signals):
            return ECHO_OUTREACH_CHAIN

    return None


# ---------------------------------------------------------------------------
# REST Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
async def health_check():
    """Health check for monitoring."""
    return {
        "status": "operational",
        "service": "vexis-agency-gateway",
        "version": "0.2.0",
        "agents_online": sum(1 for a in AGENTS.values() if a["status"] == "online"),
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/agents", response_model=list[AgentStatus])
async def list_agents():
    """List all agents with their current status."""
    return [
        AgentStatus(
            name=a["name"],
            title=a["title"],
            icon=a["icon"],
            engine=a["engine"],
            status=a["status"],
            features=a["features"],
        )
        for a in AGENTS.values()
    ]


@app.get("/api/agents/{agent_name}")
async def get_agent(agent_name: str):
    """Get detailed info about a specific agent."""
    agent = AGENTS.get(agent_name.lower())
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
    return agent


@app.post("/api/agents/{agent_name}/chat", response_model=ChatResponse)
async def chat_with_agent(agent_name: str, msg: ChatMessage):
    """Send a message to a specific agent and get a response."""
    agent_id = agent_name.lower()
    if agent_id not in AGENTS:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")

    try:
        result = await execute_agent(agent_id, msg.message, msg.context)

        return ChatResponse(
            agent=result["agent_name"],
            agent_title=result["agent_title"],
            agent_icon=result["agent_icon"],
            message=result["response"],
            timestamp=datetime.utcnow().isoformat(),
            metadata=result.get("metadata"),
        )

    except RuntimeError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        logger.error(f"Error chatting with {agent_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


@app.post("/api/orchestrate")
async def orchestrate_message(req: OrchestrateRequest):
    """
    Auto-route a message to the best agent based on content analysis.
    
    Useful for the dashboard's global input or slash commands.
    """
    routing = orchestrator.route(req.message, context=req.context)

    result = await execute_agent(routing["agent"], req.message, req.context)

    return {
        "routing": routing,
        "response": ChatResponse(
            agent=result["agent_name"],
            agent_title=result["agent_title"],
            agent_icon=result["agent_icon"],
            message=result["response"],
            timestamp=datetime.utcnow().isoformat(),
            metadata=result.get("metadata"),
        ),
    }


@app.get("/api/rate-limiter/status")
async def rate_limiter_status():
    """Get Groq API key rotation status (for Sentinel monitoring)."""
    if not key_rotator:
        return {"status": "no_keys_configured"}
    return await key_rotator.get_status()


@app.get("/api/memory/stats")
async def memory_stats():
    """Get memory usage stats for all agents."""
    return await agent_memory.get_stats()


# ---------------------------------------------------------------------------
# Scraping & Lead Endpoints
# ---------------------------------------------------------------------------
lead_pipeline = LeadPipeline()
researcher = ProspectResearcher()


class LeadSearchRequest(BaseModel):
    niche: str
    location: str
    max_leads: int = 20
    analyze_websites: bool = False  # Off by default for speed


class ResearchRequest(BaseModel):
    company_name: str
    context: str = ""


@app.post("/api/leads/search")
async def search_leads(req: LeadSearchRequest):
    """
    Run the full lead extraction pipeline.
    Returns scored leads with gap analysis and summary.
    This is Archer's primary action.
    """
    try:
        result = await lead_pipeline.run(
            niche=req.niche,
            location=req.location,
            max_leads=req.max_leads,
            analyze_websites=req.analyze_websites,
        )

        # Store in Archer's memory
        await agent_memory.add(
            "archer",
            f"Searched for {req.niche} in {req.location}. "
            f"Found {result.total_found} leads, {result.high_score_count} high-score.",
            metadata={"type": "lead_search", "niche": req.niche, "location": req.location},
        )

        return {
            "summary": result.summary,
            "total_found": result.total_found,
            "high_score_count": result.high_score_count,
            "leads": [l.to_dict() for l in result.leads],
            "csv": result.csv,
            "duration_seconds": result.duration_seconds,
            "for_nova": lead_pipeline.export_for_nova(result),
        }

    except Exception as e:
        logger.error(f"Lead search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/research")
async def research_prospect(req: ResearchRequest):
    """
    Run deep-dive research on a company.
    This is Scout's primary action.
    """
    try:
        brief = await researcher.research(req.company_name, req.context)

        # Store in Scout's memory
        await agent_memory.add(
            "scout",
            f"Researched {req.company_name}. Industry: {brief.industry}. "
            f"Confidence: {brief.confidence}.",
            metadata={"type": "research", "company": req.company_name},
        )

        return {
            "brief": brief.to_dict(),
            "markdown": brief.to_markdown(),
            "confidence": brief.confidence,
        }

    except Exception as e:
        logger.error(f"Research failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/memory/{agent_name}")
async def get_agent_memories(agent_name: str):
    """Get all memories for a specific agent."""
    memories = await agent_memory.get_all(agent_name.lower())
    return {"agent": agent_name, "memories": memories, "count": len(memories)}


# ---------------------------------------------------------------------------
# WebSocket — Real-time Agent Chat
# ---------------------------------------------------------------------------
connected_clients: list[WebSocket] = []


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """
    WebSocket endpoint for real-time agent chat.
    
    Messages from client: {"agent": "archer", "message": "Find leads in Lagos"}
    Messages to client:   {"agent": "Archer", "title": "Lead Hunter", 
                           "icon": "🎯", "message": "...", "type": "message"}
    """
    await websocket.accept()
    connected_clients.append(websocket)
    logger.info(f"WebSocket client connected. Total: {len(connected_clients)}")

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)

            agent_name = payload.get("agent", "").lower()
            message = payload.get("message", "")

            if not agent_name or not message:
                await websocket.send_json({
                    "type": "error",
                    "message": "Provide 'agent' and 'message' fields",
                })
                continue

            if agent_name not in AGENTS:
                await websocket.send_json({
                    "type": "error",
                    "message": f"Unknown agent: {agent_name}",
                })
                continue

            agent = AGENTS[agent_name]

            # Send typing indicator
            await websocket.send_json({
                "type": "typing",
                "agent": agent["name"],
                "agent_title": agent["title"],
                "agent_icon": agent["icon"],
            })

            try:
                result = await execute_agent(agent_name, message)

                await websocket.send_json({
                    "type": "message",
                    "agent": result["agent_name"],
                    "agent_title": result["agent_title"],
                    "agent_icon": result["agent_icon"],
                    "message": result["response"],
                    "timestamp": datetime.utcnow().isoformat(),
                    "metadata": result.get("metadata", {}),
                })

                # If a handoff was suggested, notify the frontend
                if result.get("metadata", {}).get("handoff_suggested"):
                    target = result["metadata"]["handoff_suggested"]
                    target_agent = AGENTS.get(target, {})
                    await websocket.send_json({
                        "type": "handoff",
                        "from_agent": result["agent_name"],
                        "to_agent": target_agent.get("name", target),
                        "to_agent_icon": target_agent.get("icon", "🔄"),
                        "message": f"{result['agent_name']} suggests handing this off to {target_agent.get('name', target)}.",
                    })

            except RuntimeError as e:
                await websocket.send_json({
                    "type": "rate_limited",
                    "message": str(e),
                })

    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        logger.info(f"WebSocket client disconnected. Total: {len(connected_clients)}")


# ---------------------------------------------------------------------------
# Broadcast — Proactive agent messages to all connected clients
# ---------------------------------------------------------------------------
async def broadcast_agent_message(agent_name: str, message: str, metadata: dict = None):
    """
    Called by proactive triggers (cron, webhooks, events) to push
    unsolicited agent messages to the dashboard.
    """
    agent = AGENTS.get(agent_name.lower())
    if not agent:
        return

    payload = {
        "type": "proactive",
        "agent": agent["name"],
        "agent_title": agent["title"],
        "agent_icon": agent["icon"],
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
        "metadata": metadata or {},
    }

    disconnected = []
    for ws in connected_clients:
        try:
            await ws.send_json(payload)
        except Exception:
            disconnected.append(ws)

    for ws in disconnected:
        connected_clients.remove(ws)
