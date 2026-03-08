"""
Vexis Agency — Application Configuration

Loads and validates all environment variables via Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    """Central configuration loaded from .env file."""

    # ---------- Groq API Keys ----------
    groq_api_key_1: str = ""
    groq_api_key_2: str = ""
    groq_api_key_3: str = ""
    groq_api_key_4: str = ""
    groq_api_key_5: str = ""

    # ---------- Database ----------
    database_url: str = "postgresql://vexis:vexis_dev@localhost:5432/vexis_agency"

    # ---------- Redis ----------
    redis_url: str = "redis://localhost:6379/0"

    # ---------- Gateway ----------
    gateway_host: str = "0.0.0.0"
    gateway_port: int = 8000
    secret_key: str = "change-this-to-a-random-secret"
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # ---------- AI Models ----------
    default_model: str = "llama-3.3-70b-versatile"
    fallback_model: str = "mixtral-8x7b-32768"
    max_agent_retries: int = 3

    # ---------- n8n ----------
    n8n_port: int = 5678
    n8n_webhook_url: str = "http://n8n:5678"

    # ---------- gpt4free ----------
    gpt4free_enabled: bool = False
    gpt4free_provider: str = "auto"

    @property
    def groq_api_keys(self) -> list[str]:
        """Return all configured Groq API keys as a list."""
        keys = [
            self.groq_api_key_1,
            self.groq_api_key_2,
            self.groq_api_key_3,
            self.groq_api_key_4,
            self.groq_api_key_5,
        ]
        return [k for k in keys if k and k.startswith("gsk_")]

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }


# Singleton
settings = Settings()
