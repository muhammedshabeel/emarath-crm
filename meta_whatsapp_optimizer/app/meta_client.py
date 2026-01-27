"""Meta Marketing API connector."""
from __future__ import annotations

from typing import Any, Dict
import requests

from .config import get_settings


class MetaAPIError(RuntimeError):
    """Raised when Meta API returns an error."""


class MetaClient:
    """Thin client for Meta Marketing API requests."""

    def __init__(self, access_token: str) -> None:
        self.access_token = access_token
        settings = get_settings()
        self.base_url = f"{settings.meta_base_url}/{settings.meta_api_version}"
        self.timeout_s = settings.request_timeout_s

    def get(self, path: str, params: Dict[str, Any]) -> Dict[str, Any]:
        params = dict(params)
        params["access_token"] = self.access_token
        url = f"{self.base_url}/{path.lstrip('/')}"
        response = requests.get(url, params=params, timeout=self.timeout_s)
        if not response.ok:
            raise MetaAPIError(
                f"Meta API error {response.status_code}: {response.text}"
            )
        payload = response.json()
        if "error" in payload:
            raise MetaAPIError(str(payload["error"]))
        return payload
