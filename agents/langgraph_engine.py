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
import re
import json
from typing import TypedDict, Annotated, Optional, Any, Dict, List
from datetime import datetime

from groq import AsyncGroq
from agents.agent_tools import TOOLS_SCHEMA, TOOLS_MAP
from agents.utils import summarize_context

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

        # system_prompt already contains memory_context via build_system_prompt()
        # so we don't need to append it again here.

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

        # Tool execution loop
        while state["iteration"] < state["max_iterations"]:
            try:
                # 1. Call LLM with tools
                response = await self._client.chat.completions.create(
                    model=model,
                    messages=messages,
                    tools=TOOLS_SCHEMA,
                    tool_choice="auto",
                    temperature=0.7,
                    max_tokens=450,
                )
                
                msg = response.choices[0].message
                
                # Check for tool calls
                if msg.tool_calls:
                    messages.append(msg)
                    
                    for tool_call in msg.tool_calls:
                        tool_name = tool_call.function.name
                        tool_args = json.loads(tool_call.function.arguments)
                        
                        logger.info(f"{state['agent_name']} calling tool: {tool_name}({tool_args})")
                        
                        # Execute tool
                        tool_func = TOOLS_MAP.get(tool_name)
                        if tool_func:
                            # Update metadata for transparency
                            if "tool_calls" not in state["metadata"]:
                                state["metadata"]["tool_calls"] = []
                            state["metadata"]["tool_calls"].append({"name": tool_name, "args": tool_args})
                            
                            result = await tool_func(**tool_args)
                            
                            # Add tool result to conversation history for next LLM turn
                            messages.append({
                                "role": "tool",
                                "tool_call_id": tool_call.id,
                                "name": tool_name,
                                "content": str(result),
                            })
                        else:
                            messages.append({
                                "role": "tool",
                                "tool_call_id": tool_call.id,
                                "name": tool_name,
                                "content": f"Error: Tool '{tool_name}' not found.",
                            })
                    
                    # --- Mid-loop TPM Guard (Llama logic) ---
                    # If messages list grows too large (est > 6000 tokens), summarize the trail
                    total_chars = sum(len(str(m.get("content", "") if isinstance(m, dict) else getattr(m, "content", ""))) for m in messages)
                    if total_chars > 24000: # ~6000 tokens
                        logger.info(f"{state['agent_name']}: Internal context threshold reached. Summarizing trail.")
                        # Summarize everything EXCEPT the system prompt (messages[0])
                        # Keep the system prompt at [0]
                        internal_summary = await summarize_context(messages[1:], api_key=self._client.api_key)
                        if internal_summary:
                            messages = [
                                messages[0], # System prompt
                                {"role": "system", "content": f"[CONTINUATION CONTEXT]\n{internal_summary}"}
                            ]
                    
                    # Continue loop to let LLM process tool results
                    continue
                
                # No more tool calls — capture final response
                state["response"] = msg.content
                state["metadata"]["tokens_used"] = response.usage.total_tokens if response.usage else 0
                break
                
            except Exception as e:
                logger.error(f"Act step failed for {state['agent_name']}: {e}")
                state["response"] = (
                    f"I encountered an error processing your request. "
                    f"Error: {str(e)}. Please try again or contact Sentinel for system status."
                )
                break

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

        # Check for handoff triggers using standardized tag: :::handoff [agent_id]:::
        handoff_match = re.search(r':::handoff\s+\[?(\w+)\]?:::', state["response"], re.IGNORECASE)
        if handoff_match:
            state["handoff_triggered"] = handoff_match.group(1).lower()
            # Clean the response to remove the tag
            state["response"] = re.sub(r':::handoff\s+\[?(\w+)\]?:::.*$', '', state["response"], flags=re.IGNORECASE | re.DOTALL).strip()
        else:
            # Fallback to simple keyword check for safety
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
