"""Utility helpers."""
from __future__ import annotations

from typing import Dict


def safe_divide(numerator: float, denominator: float) -> float:
    if denominator == 0:
        return 0.0
    return numerator / denominator


def summarize_missing_signals(flags: Dict[str, bool]) -> str:
    missing = [name for name, missing in flags.items() if missing]
    if not missing:
        return ""
    return "Missing signals: " + ", ".join(missing)
