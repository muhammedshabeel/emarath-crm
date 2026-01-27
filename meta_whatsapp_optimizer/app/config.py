"""Configuration and environment settings."""
from __future__ import annotations

from functools import lru_cache
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    meta_api_version: str = Field("v19.0", env="META_API_VERSION")
    meta_base_url: str = Field("https://graph.facebook.com", env="META_BASE_URL")
    request_timeout_s: int = Field(30, env="REQUEST_TIMEOUT_S")

    # Optional LLM configuration for AI layer
    llm_provider: str = Field("disabled", env="LLM_PROVIDER")
    llm_endpoint: str | None = Field(None, env="LLM_ENDPOINT")
    llm_api_key: str | None = Field(None, env="LLM_API_KEY")

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
