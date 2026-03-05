"""
Vexis Agency — LangGraph Agent Engine

Executes complex agents (Archer, Nova, Atlas) using LangGraph's StateGraph.
These agents handle branching logic, loops, and multi-step workflows.

Architecture:
    User message → Build state → Run graph → Extract response
    
    The graph has nodes for:
    1. think: Analyze the task and decide approach
    2. act: Execute the task using tools/LLM
    3. reflect: Check output quality and guardrails
    4. respond: Format final response
    
    Edges allow looping back from reflect → act if quality is insufficient.
"""

import logging
from typing import TypedDict, Annotated, Optional
from datetime import datetime

from groq import AsyncGroq

logger = logging.getLogger("vexis.langgraph_engine")


class AgentState(TypedDict):
    """State that flows through the LangGraph graph."""
    agent_id: str
    agent_name: str
    agent_title: str
    user_message: str
    system_prompt: str
    memory_context: str
    conversation_history: list[dict]
    current_thought: str
    response: str
    tool_calls: list[dict]
    iteration: int
    max_iterations: int
    quality_ok: bool
    guardrail_violations: list[str]
    handoff_triggered: Optional[str]
    metadata: dict


class LangGraphEngine:
    """
    Executes LangGraph-based agents (Archer, Nova, Atlas).
    
    Uses a think → act → reflect → respond loop with guardrail checking.
    
    Usage:
        engine = LangGraphEngine()
        response = await engine.run(
            agent_id="archer",
            message="Find law firms in Lagos",
            system_prompt="You are Archer...",
            api_key="gsk_xxx",
            model="llama-3.3-70b-versatile",
            memory_context="[MEMORIES]...",
            conversation_history=[...]
        )
    """

    def __init__(self):
        self._client: Optional[AsyncGroq] = None

    async def run(
        self,
        agent_id: str,
        agent_name: str,
        agent_title: str,
        message: str,
        system_prompt: str,
        api_key: str,
        model: str = "llama-3.3-70b-versatile",
        memory_context: str = "",
        conversation_history: list[dict] = None,
    ) -> dict:
        """
        Execute a LangGraph agent with the think-act-reflect loop.
        
        Returns:
            dict with: response, metadata, handoff (if triggered)
        """
        self._client = AsyncGroq(api_key=api_key)

        state: AgentState = {
            "agent_id": agent_id,
            "agent_name": agent_name,
            "agent_title": agent_title,
            "user_message": message,
            "system_prompt": system_prompt,
            "memory_context": memory_context,
            "conversation_history": conversation_history or [],
            "current_thought": "",
            "response": "",
            "tool_calls": [],
            "iteration": 0,
            "max_iterations": 3,
            "quality_ok": False,
            "guardrail_violations": [],
            "handoff_triggered": None,
            "metadata": {},
        }

        # Execute the graph: think → act → (reflect → act if needed) → respond
        state = await self._think(state, model)
        state = await self._act(state, model)
        state = await self._reflect(state, model)

        # If reflection says quality is insufficient, retry once
        if not state["quality_ok"] and state["iteration"] < state["max_iterations"]:
            state["iteration"] += 1
            logger.info(f"{agent_name}: Quality check failed, retrying (iteration {state['iteration']})")
            state = await self._act(state, model)
            state = await self._reflect(state, model)

        return {
            "response": state["response"],
            "metadata": {
                "iterations": state["iteration"] + 1,
                "guardrail_violations": state["guardrail_violations"],
                "thought_process": state["current_thought"],
            },
            "handoff": state["handoff_triggered"],
        }

    async def _think(self, state: AgentState, model: str) -> AgentState:
        """Analyze the task and plan the approach."""
        think_prompt = (
            f"You are the internal reasoning module for {state['agent_name']}. "
            f"Analyze this task and plan your approach in 2-3 sentences. "
            f"Consider: What does the user want? What tools/data do you need? "
            f"Should you recommend a handoff to another agent?\n\n"
            f"User message: {state['user_message']}"
        )

        try:
            response = await self._client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": think_prompt},
                    {"role": "user", "content": state["user_message"]},
                ],
                temperature=0.3,
                max_tokens=256,
            )
            state["current_thought"] = response.choices[0].message.content
            logger.debug(f"{state['agent_name']} thought: {state['current_thought'][:100]}...")
        except Exception as e:
            logger.error(f"Think step failed for {state['agent_name']}: {e}")
            state["current_thought"] = "Proceeding with direct response."

        return state

    async def _act(self, state: AgentState, model: str) -> AgentState:
        """Execute the main task using the LLM."""
        # Build messages
        messages = [{"role": "system", "content": state["system_prompt"]}]

        # Add memory context if available
        if state["memory_context"]:
            messages.append({
                "role": "system",
                "content": state["memory_context"],
            })

        # Add conversation history (last 10 messages for context window)
        for msg in state["conversation_history"][-10:]:
            messages.append(msg)

        # Add internal reasoning as context
        if state["current_thought"]:
            messages.append({
                "role": "system",
                "content": f"[INTERNAL REASONING] {state['current_thought']}",
            })

        # Add the actual user message
        messages.append({"role": "user", "content": state["user_message"]})

        # If this is a retry, add reflection feedback
        if state["iteration"] > 0 and state["guardrail_violations"]:
            violations_text = "\n".join(f"- {v}" for v in state["guardrail_violations"])
            messages.append({
                "role": "system",
                "content": (
                    f"[QUALITY CHECK FAILED] Your previous response had issues:\n"
                    f"{violations_text}\n"
                    f"Please revise your response to address these issues."
                ),
            })

        try:
            response = await self._client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=2048,
            )
            state["response"] = response.choices[0].message.content
            state["metadata"]["tokens_used"] = response.usage.total_tokens if response.usage else 0
        except Exception as e:
            logger.error(f"Act step failed for {state['agent_name']}: {e}")
            state["response"] = (
                f"I encountered an error processing your request. "
                f"Error: {str(e)}. Please try again or contact Sentinel for system status."
            )

        return state

    async def _reflect(self, state: AgentState, model: str) -> AgentState:
        """Check response quality and guardrails."""
        state["guardrail_violations"] = []
        response_lower = state["response"].lower()

        # Check for empty/too-short responses
        if len(state["response"].strip()) < 20:
            state["guardrail_violations"].append("Response is too short or empty")

        # Check for generic responses
        generic_phrases = [
            "i'm just an ai",
            "i cannot help",
            "as a language model",
            "i don't have access",
        ]
        for phrase in generic_phrases:
            if phrase in response_lower:
                state["guardrail_violations"].append(
                    f"Response contains generic AI disclaimer: '{phrase}'"
                )

        # Agent-specific guardrail checks
        agent_id = state["agent_id"]

        if agent_id == "nova":
            # Nova should never promise pricing
            price_patterns = ["$", "cost", "price", "pay"]
            if any(p in response_lower for p in price_patterns):
                # Only flag if it looks like Nova is committing to a price
                commit_words = ["will cost", "the price is", "we charge", "our rate"]
                if any(cw in response_lower for cw in commit_words):
                    state["guardrail_violations"].append(
                        "Nova must not commit to pricing without Atlas approval"
                    )

        if agent_id == "archer":
            # Check if Archer is claiming email verification without actually doing it
            if "verified email" in response_lower and "example.com" in response_lower:
                state["guardrail_violations"].append(
                    "Archer reported verified emails that appear to be placeholders"
                )

        # Check for handoff triggers
        handoff_patterns = {
            "let atlas handle": "atlas",
            "hand off to atlas": "atlas",
            "scout should research": "scout",
            "echo can draft": "echo",
            "sentinel should check": "sentinel",
            "archer should find": "archer",
            "nova should follow up": "nova",
        }
        for pattern, target in handoff_patterns.items():
            if pattern in response_lower:
                state["handoff_triggered"] = target
                break

        state["quality_ok"] = len(state["guardrail_violations"]) == 0
        
        if not state["quality_ok"]:
            logger.warning(
                f"{state['agent_name']} guardrail violations: {state['guardrail_violations']}"
            )

        return state
