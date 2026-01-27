"""Country-wise behavior analysis."""
from __future__ import annotations

from typing import List
import pandas as pd

from .models import CountryPerformance, WhatsAppEvents
from .processors import compute_cpr, compute_ctr, compute_conversion_rate


def build_country_performance(rows: List[dict]) -> List[CountryPerformance]:
    """Normalize and compute country-level metrics."""
    if not rows:
        return []

    frame = pd.DataFrame(rows)
    results: List[CountryPerformance] = []
    for _, row in frame.iterrows():
        events = WhatsAppEvents(
            messaging_conversation_started=int(
                row.get("messaging_conversation_started", 0)
            ),
            onsite_conversion_messaging_conversation_started=int(
                row.get("onsite_conversion.messaging_conversation_started", 0)
            ),
        )
        impressions = int(row.get("impressions", 0))
        clicks = int(row.get("clicks", 0))
        spend = float(row.get("spend", 0))
        results.append(
            CountryPerformance(
                country=str(row.get("country", "UNKNOWN")),
                impressions=impressions,
                clicks=clicks,
                spend=spend,
                whatsapp_events=events,
                cpr=compute_cpr(spend, events),
                ctr=compute_ctr(clicks, impressions),
                conv_rate=compute_conversion_rate(clicks, events),
            )
        )
    return results
