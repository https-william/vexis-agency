"""
Vexis Agency — Groq API Key Rotator & Rate Limiter

Rotates across multiple Groq API keys from separate accounts to maximize
free-tier throughput. Tracks per-key usage and automatically switches keys
when approaching rate limits.

Design:
- Each key gets ~30 RPM / ~40k TPM on free tier
- With 5 keys = ~150 RPM burst capacity
- Redis-backed for persistence across restarts
- Keys are selected by least-recently-used + most-remaining-capacity
"""

import time
import asyncio
import logging
from dataclasses import dataclass, field
from typing import Optional

import redis.asyncio as aioredis

logger = logging.getLogger("vexis.rate_limiter")


@dataclass
class KeyUsage:
    """Tracks usage metrics for a single API key."""
    key: str
    key_id: str  # Short identifier (last 6 chars)
    requests_this_minute: int = 0
    tokens_this_minute: int = 0
    last_request_time: float = 0.0
    last_reset_time: float = field(default_factory=time.time)
    consecutive_errors: int = 0
    is_rate_limited: bool = False
    rate_limit_until: float = 0.0


class GroqKeyRotator:
    """
    Manages multiple Groq API keys with intelligent rotation.
    
    Usage:
        rotator = GroqKeyRotator(["gsk_key1", "gsk_key2", "gsk_key3"])
        await rotator.initialize(redis_client)
        
        key = await rotator.get_available_key()
        # ... use key for API call ...
        await rotator.record_usage(key, tokens_used=150)
    """

    # Groq free tier limits (conservative estimates)
    MAX_RPM = 28         # Stay under 30 RPM per key
    MAX_TPM = 35_000     # Stay under 40k TPM per key
    COOLDOWN_SECONDS = 65  # How long to wait after hitting a rate limit
    RESET_WINDOW = 60    # Reset counters every 60 seconds

    def __init__(self, api_keys: list[str]):
        if not api_keys:
            raise ValueError("At least one Groq API key is required")
        
        self.keys: dict[str, KeyUsage] = {}
        for key in api_keys:
            if key and key.startswith("gsk_"):
                key_id = key[-6:]
                self.keys[key] = KeyUsage(key=key, key_id=key_id)
        
        if not self.keys:
            raise ValueError("No valid Groq API keys found (must start with 'gsk_')")
        
        self._redis: Optional[aioredis.Redis] = None
        self._lock = asyncio.Lock()
        
        logger.info(f"GroqKeyRotator initialized with {len(self.keys)} keys")

    async def initialize(self, redis_client: Optional[aioredis.Redis] = None):
        """Connect to Redis for persistent usage tracking."""
        self._redis = redis_client
        if not self._redis:
            logger.warning("No Redis client provided to rate limiter. Usage will be kept in memory only.")
            return

        # Load any saved state
        for key, usage in self.keys.items():
            saved = await self._redis.hgetall(f"groq:key:{usage.key_id}")
            if saved:
                usage.requests_this_minute = int(saved.get(b"rpm", 0))
                usage.tokens_this_minute = int(saved.get(b"tpm", 0))
                usage.consecutive_errors = int(saved.get(b"errors", 0))
        logger.info("Rate limiter state loaded from Redis")

    def _reset_if_needed(self, usage: KeyUsage) -> None:
        """Reset counters if the 60-second window has elapsed."""
        now = time.time()
        if now - usage.last_reset_time >= self.RESET_WINDOW:
            usage.requests_this_minute = 0
            usage.tokens_this_minute = 0
            usage.last_reset_time = now
            # Clear rate limit if cooldown has passed
            if usage.is_rate_limited and now >= usage.rate_limit_until:
                usage.is_rate_limited = False
                usage.consecutive_errors = 0
                logger.info(f"Key ...{usage.key_id} cooldown cleared")

    def _get_key_score(self, usage: KeyUsage) -> float:
        """
        Score a key for selection. Lower score = better choice.
        Factors: remaining capacity, time since last use, error state.
        """
        if usage.is_rate_limited:
            return float("inf")  # Never pick rate-limited keys
        
        # Remaining capacity (0-1, where 1 = fully available)
        rpm_remaining = max(0, 1 - usage.requests_this_minute / self.MAX_RPM)
        tpm_remaining = max(0, 1 - usage.tokens_this_minute / self.MAX_TPM)
        capacity = min(rpm_remaining, tpm_remaining)
        
        # Time since last use (prefer keys not recently used)
        time_idle = time.time() - usage.last_request_time
        idle_bonus = min(1.0, time_idle / 30)  # Max bonus at 30s idle
        
        # Error penalty
        error_penalty = usage.consecutive_errors * 0.3
        
        # Lower = better
        return -capacity - idle_bonus + error_penalty

    async def get_available_key(self) -> str:
        """
        Get the best available API key.
        
        Returns the key with the most remaining capacity.
        Raises RuntimeError if all keys are rate-limited.
        """
        async with self._lock:
            # Reset expired windows
            for usage in self.keys.values():
                self._reset_if_needed(usage)
            
            # Score and sort keys
            candidates = [
                (self._get_key_score(usage), key, usage)
                for key, usage in self.keys.items()
                if not usage.is_rate_limited
            ]
            
            if not candidates:
                # All keys rate-limited — find the one that unlocks soonest
                soonest = min(
                    self.keys.values(),
                    key=lambda u: u.rate_limit_until
                )
                wait_time = max(0, soonest.rate_limit_until - time.time())
                raise RuntimeError(
                    f"All Groq keys rate-limited. Nearest unlock in {wait_time:.0f}s. "
                    f"Key ...{soonest.key_id} unlocks first."
                )
            
            # Pick the best scoring key
            candidates.sort(key=lambda x: x[0])
            _, best_key, best_usage = candidates[0]
            
            logger.debug(
                f"Selected key ...{best_usage.key_id} "
                f"(RPM: {best_usage.requests_this_minute}/{self.MAX_RPM}, "
                f"TPM: {best_usage.tokens_this_minute}/{self.MAX_TPM})"
            )
            
            return best_key

    async def record_usage(
        self, key: str, tokens_used: int = 0, error: bool = False
    ) -> None:
        """Record usage after an API call."""
        async with self._lock:
            usage = self.keys.get(key)
            if not usage:
                return
            
            self._reset_if_needed(usage)
            
            if error:
                usage.consecutive_errors += 1
                if usage.consecutive_errors >= 3:
                    # Likely rate-limited, cool down
                    usage.is_rate_limited = True
                    usage.rate_limit_until = time.time() + self.COOLDOWN_SECONDS
                    logger.warning(
                        f"Key ...{usage.key_id} rate-limited after {usage.consecutive_errors} "
                        f"errors. Cooldown until {self.COOLDOWN_SECONDS}s."
                    )
            else:
                usage.consecutive_errors = 0
                usage.requests_this_minute += 1
                usage.tokens_this_minute += tokens_used
                usage.last_request_time = time.time()
                
                # Check if we're approaching limits
                if (usage.requests_this_minute >= self.MAX_RPM or
                        usage.tokens_this_minute >= self.MAX_TPM):
                    usage.is_rate_limited = True
                    usage.rate_limit_until = time.time() + self.COOLDOWN_SECONDS
                    logger.info(
                        f"Key ...{usage.key_id} preemptively rate-limited "
                        f"(RPM: {usage.requests_this_minute}, TPM: {usage.tokens_this_minute})"
                    )
            
            # Persist to Redis
            if self._redis:
                await self._redis.hset(
                    f"groq:key:{usage.key_id}",
                    mapping={
                        "rpm": str(usage.requests_this_minute),
                        "tpm": str(usage.tokens_this_minute),
                        "errors": str(usage.consecutive_errors),
                    },
                )

    async def get_status(self) -> dict:
        """Get the current status of all keys (for Sentinel monitoring)."""
        status = {
            "total_keys": len(self.keys),
            "available_keys": 0,
            "rate_limited_keys": 0,
            "keys": [],
        }
        
        for usage in self.keys.values():
            self._reset_if_needed(usage)
            key_info = {
                "key_id": f"...{usage.key_id}",
                "rpm": usage.requests_this_minute,
                "tpm": usage.tokens_this_minute,
                "is_rate_limited": usage.is_rate_limited,
                "errors": usage.consecutive_errors,
            }
            if usage.is_rate_limited:
                key_info["unlocks_in"] = max(
                    0, int(usage.rate_limit_until - time.time())
                )
                status["rate_limited_keys"] += 1
            else:
                status["available_keys"] += 1
            
            status["keys"].append(key_info)
        
        total_rpm = sum(u.requests_this_minute for u in self.keys.values())
        total_tpm = sum(u.tokens_this_minute for u in self.keys.values())
        max_rpm = self.MAX_RPM * len(self.keys)
        max_tpm = self.MAX_TPM * len(self.keys)
        
        status["total_rpm_used"] = total_rpm
        status["total_rpm_capacity"] = max_rpm
        status["utilization_pct"] = round(total_rpm / max_rpm * 100, 1) if max_rpm else 0
        
        return status
