"""Metric normalization and CPR logic."""
from __future__ import annotations

from typing import Dict

from .models import WhatsAppEvents


def total_whatsapp_events(events: WhatsAppEvents) -> int:
    return (
        events.messaging_conversation_started
        + events.onsite_conversion_messaging_conversation_started
    )


def compute_cpr(spend: float, events: WhatsAppEvents) -> float:
    event_count = total_whatsapp_events(events)
    if event_count == 0:
        return 0.0
    return spend / event_count


def compute_ctr(clicks: int, impressions: int) -> float:
    if impressions == 0:
        return 0.0
    return clicks / impressions


def compute_conversion_rate(clicks: int, events: WhatsAppEvents) -> float:
    if clicks == 0:
        return 0.0
    return total_whatsapp_events(events) / clicks


def decompose_cpr(
    spend: float,
    impressions: int,
    clicks: int,
    events: WhatsAppEvents,
) -> Dict[str, float]:
    """
    Decompose CPR into interpretable components.

    Returns:
        Auction pressure: spend per 1000 impressions (CPM).
        Signal quality: click-through rate.
        Conversion probability: events per click.
        Delivery efficiency: impressions per reach (proxy) is omitted due to missing reach.
    """
    cpm = (spend / impressions * 1000) if impressions else 0.0
    ctr = compute_ctr(clicks, impressions)
    conv_rate = compute_conversion_rate(clicks, events)
    return {
        "auction_pressure_cpm": round(cpm, 4),
        "signal_quality_ctr": round(ctr, 6),
        "conversion_probability": round(conv_rate, 6),
    }
