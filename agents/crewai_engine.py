"""
Vexis Agency — CrewAI Agent Engine

Executes simpler agents (Scout, Echo, Sentinel) using a sequential pipeline.
These agents handle linear, step-by-step tasks without branching logic.

Architecture:
    User message → Build prompt → Execute → Format response
    
    Simpler than LangGraph — no think/reflect loop needed for these agents.
    They run tasks in a straight line: research → summarize, draft → review, etc.
"""

import logging
from typing import Optional
from datetime import datetime

from groq import AsyncGroq

logger = logging.getLogger("vexis.crewai_engine")


class CrewAIEngine:
    """
    Executes CrewAI-style agents (Scout, Echo, Sentinel).
    
    These agents run simpler, linear tasks. The engine supports chaining
    multiple sub-tasks sequentially (like a CrewAI crew).
    
    Usage:
        engine = CrewAIEngine()
        response = await engine.run(
            agent_id="scout",
            message="Research TechCorp Inc.",
            system_prompt="You are Scout...",
            api_key="gsk_xxx",
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
        subtasks: list[str] = None,
    ) -> dict:
        """
        Execute a CrewAI-style agent.
        
        If subtasks are provided, each is executed sequentially and the
        outputs are combined into the final response.
        
        Returns:
            dict with: response, metadata
        """
        self._client = AsyncGroq(api_key=api_key)

        # If the agent has defined subtasks for this type of request, chain them
        if subtasks:
            return await self._run_chain(
                agent_id, agent_name, agent_title,
                message, system_prompt, api_key, model,
                memory_context, conversation_history, subtasks,
            )

        # Otherwise, single-step execution
        return await self._run_single(
            agent_id, agent_name, agent_title,
            message, system_prompt, api_key, model,
            memory_context, conversation_history,
        )

    async def _run_single(
        self,
        agent_id: str,
        agent_name: str,
        agent_title: str,
        message: str,
        system_prompt: str,
        api_key: str,
        model: str,
        memory_context: str,
        conversation_history: list[dict] = None,
    ) -> dict:
        """Single-step agent execution."""
        messages = [{"role": "system", "content": system_prompt}]

        if memory_context:
            messages.append({"role": "system", "content": memory_context})

        # Add conversation history
        for msg in (conversation_history or [])[-10:]:
            messages.append(msg)

        messages.append({"role": "user", "content": message})

        try:
            response = await self._client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=2048,
            )

            content = response.choices[0].message.content
            tokens = response.usage.total_tokens if response.usage else 0

            # Agent-specific post-processing
            content = self._post_process(agent_id, content)

            return {
                "response": content,
                "metadata": {
                    "tokens_used": tokens,
                    "engine": "crewai",
                    "steps": 1,
                },
                "handoff": None,
            }

        except Exception as e:
            logger.error(f"CrewAI execution failed for {agent_name}: {e}")
            return {
                "response": (
                    f"I ran into an issue completing this task. "
                    f"Error: {str(e)}. Let Sentinel know if this keeps happening."
                ),
                "metadata": {"error": str(e)},
                "handoff": None,
            }

    async def _run_chain(
        self,
        agent_id: str,
        agent_name: str,
        agent_title: str,
        message: str,
        system_prompt: str,
        api_key: str,
        model: str,
        memory_context: str,
        conversation_history: list[dict],
        subtasks: list[str],
    ) -> dict:
        """
        Chain multiple subtasks sequentially, passing each output as
        context to the next step.
        
        Example for Scout researching a company:
        1. "Find basic company info for TechCorp"
        2. "Identify the decision makers based on: {step1_output}"
        3. "Summarize findings into a research brief based on: {step2_output}"
        """
        accumulated_context = f"Original request: {message}"
        all_outputs = []
        total_tokens = 0

        for i, subtask in enumerate(subtasks):
            step_prompt = (
                f"{subtask}\n\n"
                f"Context from previous steps:\n{accumulated_context}"
            )

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": step_prompt},
            ]

            if memory_context:
                messages.insert(1, {"role": "system", "content": memory_context})

            try:
                response = await self._client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1024,
                )

                step_output = response.choices[0].message.content
                total_tokens += response.usage.total_tokens if response.usage else 0
                all_outputs.append(f"**Step {i + 1}**: {step_output}")
                accumulated_context += f"\n\nStep {i + 1} output: {step_output}"

                logger.info(f"{agent_name} completed chain step {i + 1}/{len(subtasks)}")

            except Exception as e:
                logger.error(f"Chain step {i + 1} failed for {agent_name}: {e}")
                all_outputs.append(f"**Step {i + 1}**: ⚠️ Failed — {str(e)}")
                break

        final_response = "\n\n".join(all_outputs)
        final_response = self._post_process(agent_id, final_response)

        return {
            "response": final_response,
            "metadata": {
                "tokens_used": total_tokens,
                "engine": "crewai",
                "steps": len(subtasks),
                "completed_steps": len(all_outputs),
            },
            "handoff": None,
        }

    def _post_process(self, agent_id: str, content: str) -> str:
        """Agent-specific output formatting."""

        if agent_id == "scout":
            # Ensure research briefs have structure
            if "overview" not in content.lower() and len(content) > 200:
                content = (
                    "## Research Brief\n\n"
                    f"{content}\n\n"
                    "---\n"
                    f"*Generated by Scout — Research Analyst*"
                )

        elif agent_id == "echo":
            # Add variation suggestion if not already present
            if "variation" not in content.lower() and "alternative" not in content.lower():
                content += (
                    "\n\n---\n"
                    "💡 *Want me to create an alternative version with a different tone? "
                    "Just say 'more formal' or 'more casual'.*"
                )

        elif agent_id == "sentinel":
            # Structure status reports
            if any(kw in content.lower() for kw in ["status", "report", "health"]):
                timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
                content = f"**System Status Report — {timestamp}**\n\n{content}"

        return content


# Agent-specific subtask chains for common request types
SCOUT_RESEARCH_CHAIN = [
    "Find basic company information: what they do, industry, size, location, website.",
    "Identify key decision makers: founders, CEO, CTO, marketing lead. Check LinkedIn.",
    "Analyze their tech stack and online presence: what platforms do they use?",
    "Compile a structured research brief with: Overview, Key People, Tech Stack, Opportunities, Risks.",
]

ECHO_OUTREACH_CHAIN = [
    "Analyze the prospect's profile and identify the best angle for outreach.",
    "Draft a personalized outreach email with a clear, non-pushy CTA.",
    "Create an alternative version with a different tone (formal vs casual).",
]
