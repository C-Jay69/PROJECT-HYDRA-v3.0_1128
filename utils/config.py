from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment or .env file.

    This centralizes configuration for analyzers and API. Values are optional to
    avoid runtime crashes when not needed (e.g., LLM keys). Sensible defaults are
    provided so the app runs locally without extra setup.
    """

    # LLM providers (optional)
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None

    # Analyzer parameters
    model_name: str = "gpt-4o-mini"
    max_pages: int = 20

    # API options
    api_title: str = "Project Hydra API"
    api_version: str = "0.1.0"
    enable_cors: bool = True
    cors_allow_origins: list[str] = ["*"]
    cors_allow_methods: list[str] = ["*"]
    cors_allow_headers: list[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local", ".env.example"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()  # type: ignore[call-arg]


# Eagerly evaluate for convenience import: from utils.config import settings
settings = get_settings()
