"""
Vexis Agency — Task Orchestrator

The brain's dispatcher. Analyzes incoming tasks/messages and decides:
1. Which agent should handle it
2. Whether to use LangGraph (complex/branching) or CrewAI (linear/sequential)
3. Whether to involve multiple agents (handoffs)

Design:
    - Simple keyword + intent classification (no ML overhead)
    - Falls back to the explicitly requested agent
    - Detects cross-agent handoff triggers
"""

import logging
from typing import Optional

logger = logging.getLogger("vexis.orchestrator")

# ---------------------------------------------------------------------------
# Agent routing rules
# ---------------------------------------------------------------------------
AGENT_KEYWORDS = {
    "archer": [
        "find leads", "scrape", "search for", "look for businesses",
        "google maps", "prospect", "find companies", "lead gen",
        "gap analysis", "missing website", "bad reviews", "no seo",
    ],
    "nova": [
        "outreach", "email them", "follow up", "send message",
        "close deal", "sales", "draft email", "whatsapp",
        "objection", "reply", "negotiate", "pitch",
    ],
    "scout": [
        "research", "deep dive", "analyze company", "competitor",
        "tech stack", "decision maker", "who runs", "background on",
        "linkedin", "company info", "brief on",
    ],
    "echo": [
        "write", "draft", "content", "copy", "template",
        "email template", "case study", "blog", "social media",
        "rewrite", "script", "cold dm",
    ],
    "atlas": [
        "prioritize", "strategy", "what should i", "delegate",
        "prep for call", "task queue", "fulfillment", "plan",
        "complexity", "schedule", "what needs attention",
    ],
    "sentinel": [
        "status", "health check", "system", "rate limit",
        "how are agents", "report", "daily brief", "uptime",
        "errors", "monitoring",
    ],
}

# Handoff triggers — patterns that cause one agent to pass work to another
HANDOFF_RULES = {
    # When Archer finds high-score leads → auto-trigger Scout research
    ("archer", "high_score_lead"): {
        "target": "scout",
        "action": "Research these high-priority leads",
        "auto": True,
    },
    # When Scout finishes research → auto-trigger Echo to draft content
    ("scout", "research_complete"): {
        "target": "echo",
        "action": "Draft outreach email based on this research brief",
        "auto": True,
    },
    # When Nova gets "let's do it" → hand off to Atlas for fulfillment
    ("nova", "deal_closed"): {
        "target": "atlas",
        "action": "Create fulfillment task and prep onboarding",
        "auto": True,
    },
    # When Nova needs personalized content → trigger Echo
    ("nova", "needs_content"): {
        "target": "echo",
        "action": "Draft personalized email for this prospect",
        "auto": True,
    },
    # When Atlas creates a task → notify Sentinel
    ("atlas", "task_created"): {
        "target": "sentinel",
        "action": "Log new task and update status report",
        "auto": True,
    },
}


class TaskOrchestrator:
    """
    Routes tasks to the appropriate agent and engine.
    
    Usage:
        orchestrator = TaskOrchestrator()
        result = orchestrator.route("Find law firms in Lagos with bad reviews")
        # result = {"agent": "archer", "engine": "langgraph", "confidence": 0.85}
    """

    # Agent → Engine mapping
    ENGINE_MAP = {
        "archer": "langgraph",
        "nova": "langgraph",
        "atlas": "langgraph",
        "scout": "crewai",
        "echo": "crewai",
        "sentinel": "crewai",
    }

    def route(
        self,
        message: str,
        explicit_agent: Optional[str] = None,
        context: dict = None,
    ) -> dict:
        """
        Determine which agent and engine should handle a message.
        
        Args:
            message: The user's message or task description
            explicit_agent: If the user explicitly chose an agent in the UI
            context: Optional context (current conversation agent, etc.)
            
        Returns:
            dict with: agent, engine, confidence, reasoning
        """
        # If user explicitly picked an agent, respect that
        if explicit_agent and explicit_agent in self.ENGINE_MAP:
            return {
                "agent": explicit_agent,
                "engine": self.ENGINE_MAP[explicit_agent],
                "confidence": 1.0,
                "reasoning": f"User explicitly selected {explicit_agent}",
            }

        # Score each agent by keyword matches
        message_lower = message.lower()
        scores = {}

        for agent_id, keywords in AGENT_KEYWORDS.items():
            score = 0
            matched_keywords = []
            for kw in keywords:
                if kw in message_lower:
                    score += len(kw.split())  # Longer phrases score higher
                    matched_keywords.append(kw)
            if score > 0:
                scores[agent_id] = {
                    "score": score,
                    "matches": matched_keywords,
                }

        if not scores:
            # No keyword match — use context or default to atlas
            fallback = (context or {}).get("current_agent", "atlas")
            return {
                "agent": fallback,
                "engine": self.ENGINE_MAP.get(fallback, "langgraph"),
                "confidence": 0.3,
                "reasoning": f"No keyword match. Falling back to {fallback}.",
            }

        # Pick the highest-scoring agent
        best_agent = max(scores, key=lambda a: scores[a]["score"])
        best_score = scores[best_agent]["score"]
        max_possible = max(len(kw.split()) for kw in AGENT_KEYWORDS[best_agent]) * 3
        confidence = min(1.0, best_score / max(max_possible, 1))

        result = {
            "agent": best_agent,
            "engine": self.ENGINE_MAP[best_agent],
            "confidence": round(confidence, 2),
            "reasoning": (
                f"Matched keywords: {scores[best_agent]['matches']}. "
                f"Score: {best_score}."
            ),
        }

        logger.info(
            f"Routed to {result['agent']} ({result['engine']}) "
            f"with confidence {result['confidence']}: {result['reasoning']}"
        )

        return result

    def check_handoff(self, source_agent: str, event: str) -> Optional[dict]:
        """
        Check if an agent event should trigger a handoff to another agent.
        
        Args:
            source_agent: The agent that triggered the event
            event: The event name (e.g., "high_score_lead", "deal_closed")
            
        Returns:
            Handoff config dict if a handoff should occur, None otherwise
        """
        key = (source_agent, event)
        rule = HANDOFF_RULES.get(key)

        if rule:
            logger.info(
                f"Handoff triggered: {source_agent} → {rule['target']} "
                f"(event: {event}, action: {rule['action']})"
            )

        return rule

    def get_complexity(self, message: str) -> str:
        """
        Estimate task complexity for the Kanban board.
        
        Returns: "quick" | "medium" | "complex"
        """
        message_lower = message.lower()

        complex_signals = [
            "build", "create system", "full", "integrate",
            "custom", "automate", "multi-step", "workflow",
        ]
        medium_signals = [
            "setup", "configure", "connect", "draft",
            "analyze", "report", "template",
        ]

        complex_count = sum(1 for s in complex_signals if s in message_lower)
        medium_count = sum(1 for s in medium_signals if s in message_lower)

        if complex_count >= 2:
            return "complex"
        elif complex_count >= 1 or medium_count >= 2:
            return "medium"
        else:
            return "quick"
