"""Validation and guardrails for data integrity."""
from __future__ import annotations

from typing import Iterable

from .models import MetricBase, CountryPerformance


class ValidationError(ValueError):
    """Raised when hard validation fails."""


def validate_metric(metric: MetricBase) -> None:
    """Apply hard validation rules for a metric entity."""
    if metric.impressions == 0:
        raise ValidationError(f"Impressions missing for {metric.name}.")

    total_events = (
        metric.whatsapp_events.messaging_conversation_started
        + metric.whatsapp_events.onsite_conversion_messaging_conversation_started
    )
    if metric.spend > 0 and total_events == 0:
        raise ValidationError(
            f"Spend recorded but WhatsApp events missing for {metric.name}."
        )


def validate_country_data(country_rows: Iterable[CountryPerformance]) -> None:
    """Ensure country-level analysis is present and complete."""
    rows = list(country_rows)
    if not rows:
        raise ValidationError("Country data missing.")
    for row in rows:
        if row.impressions == 0:
            raise ValidationError(f"Country {row.country} has zero impressions.")
