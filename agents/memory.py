"""
Vexis Agency — Agent Memory Layer

Integrates mem0 for persistent agent memory. Each agent has its own memory
namespace so memories don't bleed across agents.

Usage:
    memory = AgentMemory(redis_url="redis://localhost:6379")
    
    # Store a memory
    await memory.add("archer", "Already scraped Lagos law firms on March 4th")
    
    # Recall relevant memories
    memories = await memory.search("archer", "law firms in Lagos")
    
    # Get all memories for an agent
    all_memories = await memory.get_all("nova")
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Optional

import redis.asyncio as aioredis

logger = logging.getLogger("vexis.memory")


class AgentMemory:
    """
    Persistent memory for Vexis agents.
    
    Uses Redis as a lightweight store. Each agent has its own key namespace.
    Memories are stored with timestamps and can be searched by relevance.
    
    In production, this can be swapped for full mem0ai integration, but
    Redis-based memory works perfectly for the current scale and avoids
    the mem0 dependency on OpenAI embeddings (we use Groq instead).
    """

    def __init__(self, redis_client: Optional[aioredis.Redis] = None):
        self._redis = redis_client
        self._max_memories_per_agent = 200  # Keep memory bounded

    async def initialize(self, redis_client: aioredis.Redis):
        """Set the Redis connection."""
        self._redis = redis_client
        logger.info("Agent memory system initialized ✓")

    def _key(self, agent_id: str) -> str:
        """Redis key for an agent's memory list."""
        return f"vexis:memory:{agent_id}"

    async def add(self, agent_id: str, content: str, metadata: dict = None) -> dict:
        """
        Store a new memory for an agent.
        
        Args:
            agent_id: Agent identifier (e.g., "archer", "nova")
            content: The memory text to store
            metadata: Optional metadata (source, confidence, etc.)
        
        Returns:
            The stored memory object
        """
        if not self._redis:
            logger.warning("Memory system not initialized — skipping add")
            return {}

        memory = {
            "id": f"{agent_id}_{int(datetime.utcnow().timestamp() * 1000)}",
            "agent_id": agent_id,
            "content": content,
            "metadata": metadata or {},
            "created_at": datetime.utcnow().isoformat(),
        }

        key = self._key(agent_id)
        await self._redis.lpush(key, json.dumps(memory))

        # Trim to max size
        await self._redis.ltrim(key, 0, self._max_memories_per_agent - 1)

        logger.info(f"Memory added for {agent_id}: {content[:80]}...")
        return memory

    async def search(self, agent_id: str, query: str, limit: int = 5) -> list[dict]:
        """
        Search memories for an agent by keyword relevance.
        
        This is a simple keyword search. For production, swap in
        vector embeddings + cosine similarity via mem0ai.
        
        Args:
            agent_id: Agent identifier
            query: Search query
            limit: Maximum results to return
        
        Returns:
            List of matching memory objects, most relevant first
        """
        if not self._redis:
            return []

        all_memories = await self.get_all(agent_id)
        query_lower = query.lower()
        query_words = set(query_lower.split())

        # Score by keyword overlap
        scored = []
        for mem in all_memories:
            content_lower = mem["content"].lower()
            content_words = set(content_lower.split())

            # Calculate relevance score
            word_overlap = len(query_words & content_words)
            substring_match = 1 if query_lower in content_lower else 0
            score = word_overlap * 2 + substring_match * 5

            if score > 0:
                scored.append((score, mem))

        # Sort by score descending
        scored.sort(key=lambda x: x[0], reverse=True)
        return [mem for _, mem in scored[:limit]]

    async def get_all(self, agent_id: str) -> list[dict]:
        """Get all memories for an agent."""
        if not self._redis:
            return []

        key = self._key(agent_id)
        raw_memories = await self._redis.lrange(key, 0, -1)
        return [json.loads(m) for m in raw_memories]

    async def get_context_string(self, agent_id: str, query: str, limit: int = 5) -> str:
        """
        Get a formatted string of relevant memories to inject into agent prompts.
        
        Args:
            agent_id: Agent identifier
            query: The user's current message / task context
            limit: Max memories to include
            
        Returns:
            Formatted string ready to inject into a system prompt
        """
        memories = await self.search(agent_id, query, limit)

        if not memories:
            return ""

        lines = ["[RELEVANT MEMORIES]"]
        for mem in memories:
            date = mem.get("created_at", "unknown")[:10]
            lines.append(f"- ({date}) {mem['content']}")
        lines.append("[END MEMORIES]")

        return "\n".join(lines)

    async def clear(self, agent_id: str) -> int:
        """Clear all memories for an agent. Returns count deleted."""
        if not self._redis:
            return 0
        key = self._key(agent_id)
        count = await self._redis.llen(key)
        await self._redis.delete(key)
        logger.info(f"Cleared {count} memories for {agent_id}")
        return count

    async def get_stats(self) -> dict:
        """Get memory stats for all agents (for Sentinel monitoring)."""
        if not self._redis:
            return {"error": "not_initialized"}

        agent_ids = ["archer", "nova", "scout", "echo", "atlas", "sentinel"]
        stats = {}
        for agent_id in agent_ids:
            key = self._key(agent_id)
            count = await self._redis.llen(key)
            stats[agent_id] = {"memory_count": count}

        return stats
