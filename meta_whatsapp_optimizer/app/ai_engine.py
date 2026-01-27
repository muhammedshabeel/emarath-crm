"""LLM prompt execution layer (pluggable)."""
from __future__ import annotations

from typing import Any, Dict, Optional
import json
import requests

from .config import get_settings
from .prompts import WHATSAPP_OPTIMIZATION_PROMPT


class AIEngineError(RuntimeError):
    """Raised when the AI engine fails."""


class AIEngine:
    """Executes the prompt against a configured LLM endpoint."""

    def __init__(self) -> None:
        settings = get_settings()
        self.provider = settings.llm_provider
        self.endpoint = settings.llm_endpoint
        self.api_key = settings.llm_api_key

    def analyze(self, payload: Dict[str, Any]) -> Optional[str]:
        """Return AI analysis or None if disabled."""
        if self.provider == "disabled":
            return None
        if not self.endpoint:
            raise AIEngineError("LLM_ENDPOINT is required when LLM_PROVIDER is enabled.")

        request_body = {
            "prompt": WHATSAPP_OPTIMIZATION_PROMPT,
            "data": payload,
        }
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        response = requests.post(
            self.endpoint,
            headers=headers,
            data=json.dumps(request_body),
            timeout=30,
        )
        if not response.ok:
            raise AIEngineError(
                f"LLM request failed {response.status_code}: {response.text}"
            )
        return response.text
