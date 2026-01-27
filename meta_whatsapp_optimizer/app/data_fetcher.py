"""Data fetching for Meta Marketing API."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from .meta_client import MetaClient
from .models import (
    AccountMetrics,
    AdMetrics,
    AdSetMetrics,
    CampaignMetrics,
    WhatsAppEvents,
)
from .processors import compute_cpr


WHATSAPP_ACTIONS = {
    "messaging_conversation_started",
    "onsite_conversion.messaging_conversation_started",
}


def _extract_actions(actions: List[Dict[str, Any]]) -> Dict[str, int]:
    normalized: Dict[str, int] = {}
    for action in actions or []:
        action_type = action.get("action_type")
        if not action_type:
            continue
        value = int(float(action.get("value", 0)))
        normalized[action_type] = value
    return normalized


def _extract_costs(costs: List[Dict[str, Any]]) -> Dict[str, float]:
    normalized: Dict[str, float] = {}
    for cost in costs or []:
        action_type = cost.get("action_type")
        if not action_type:
            continue
        value = float(cost.get("value", 0))
        normalized[action_type] = value
    return normalized


def _build_whatsapp_events(actions: Dict[str, int]) -> WhatsAppEvents:
    return WhatsAppEvents(
        messaging_conversation_started=actions.get(
            "messaging_conversation_started", 0
        ),
        onsite_conversion_messaging_conversation_started=actions.get(
            "onsite_conversion.messaging_conversation_started", 0
        ),
    )


def fetch_account_metrics(
    client: MetaClient, ad_account_id: str
) -> AccountMetrics:
    params = {
        "fields": "spend,impressions,clicks,reach,actions,cost_per_action_type",
        "level": "account",
        "time_range": {"since": "2024-01-01", "until": "today"},
    }
    data = client.get(f"{ad_account_id}/insights", params).get("data", [])
    if not data:
        raise ValueError("No account insights returned.")
    row = data[0]
    actions = _extract_actions(row.get("actions", []))
    costs = _extract_costs(row.get("cost_per_action_type", []))
    events = _build_whatsapp_events(actions)
    return AccountMetrics(
        name="account",
        account_id=ad_account_id,
        spend=float(row.get("spend", 0)),
        impressions=int(row.get("impressions", 0)),
        clicks=int(row.get("clicks", 0)),
        reach=int(row.get("reach", 0)) if row.get("reach") else None,
        actions=actions,
        cost_per_action=costs,
        whatsapp_events=events,
    )


def fetch_campaign_metrics(
    client: MetaClient, campaign_id: str
) -> CampaignMetrics:
    params = {
        "fields": "campaign_id,objective,spend,impressions,clicks,actions,cost_per_action_type",
        "level": "campaign",
        "filtering": [{"field": "campaign.id", "operator": "EQUAL", "value": campaign_id}],
    }
    data = client.get("insights", params).get("data", [])
    if not data:
        raise ValueError(f"No campaign insights for {campaign_id}.")
    row = data[0]
    actions = _extract_actions(row.get("actions", []))
    costs = _extract_costs(row.get("cost_per_action_type", []))
    events = _build_whatsapp_events(actions)
    return CampaignMetrics(
        name=f"campaign:{campaign_id}",
        campaign_id=campaign_id,
        objective=row.get("objective"),
        spend=float(row.get("spend", 0)),
        impressions=int(row.get("impressions", 0)),
        clicks=int(row.get("clicks", 0)),
        actions=actions,
        cost_per_action=costs,
        whatsapp_events=events,
    )


def fetch_adset_metrics(client: MetaClient, adset_id: str) -> AdSetMetrics:
    params = {
        "fields": "adset_id,spend,impressions,clicks,actions,cost_per_action_type",
        "level": "adset",
        "filtering": [{"field": "adset.id", "operator": "EQUAL", "value": adset_id}],
    }
    data = client.get("insights", params).get("data", [])
    if not data:
        raise ValueError(f"No ad set insights for {adset_id}.")
    row = data[0]
    adset_details = client.get(
        adset_id,
        {
            "fields": "campaign_id,daily_budget,bid_strategy,targeting",
        },
    )
    actions = _extract_actions(row.get("actions", []))
    costs = _extract_costs(row.get("cost_per_action_type", []))
    events = _build_whatsapp_events(actions)
    return AdSetMetrics(
        name=f"adset:{adset_id}",
        adset_id=adset_id,
        campaign_id=adset_details.get("campaign_id"),
        daily_budget=float(adset_details.get("daily_budget", 0)) / 100
        if adset_details.get("daily_budget")
        else None,
        bid_strategy=adset_details.get("bid_strategy"),
        targeting={
            "optimization_goal": adset_details.get("optimization_goal", ""),
            "billing_event": adset_details.get("billing_event", ""),
        },
        spend=float(row.get("spend", 0)),
        impressions=int(row.get("impressions", 0)),
        clicks=int(row.get("clicks", 0)),
        actions=actions,
        cost_per_action=costs,
        whatsapp_events=events,
    )


def fetch_ad_metrics(client: MetaClient, ad_id: str) -> AdMetrics:
    params = {
        "fields": "ad_id,adset_id,campaign_id,spend,impressions,clicks,actions,cost_per_action_type",
        "level": "ad",
        "filtering": [{"field": "ad.id", "operator": "EQUAL", "value": ad_id}],
    }
    data = client.get("insights", params).get("data", [])
    if not data:
        raise ValueError(f"No ad insights for {ad_id}.")
    row = data[0]
    ad_details = client.get(ad_id, {"fields": "creative"})
    creative_id = None
    cta_type = None
    deep_link = None
    if ad_details.get("creative"):
        creative_id = ad_details["creative"].get("id")
        if creative_id:
            creative = client.get(
                creative_id,
                {"fields": "call_to_action_type,object_story_spec"},
            )
            cta_type = creative.get("call_to_action_type")
            story = creative.get("object_story_spec", {})
            link_data = story.get("link_data", {})
            deep_link = link_data.get("link")

    actions = _extract_actions(row.get("actions", []))
    costs = _extract_costs(row.get("cost_per_action_type", []))
    events = _build_whatsapp_events(actions)
    return AdMetrics(
        name=f"ad:{ad_id}",
        ad_id=ad_id,
        adset_id=row.get("adset_id"),
        campaign_id=row.get("campaign_id"),
        creative_id=creative_id,
        cta_type=cta_type,
        whatsapp_deep_link=deep_link,
        spend=float(row.get("spend", 0)),
        impressions=int(row.get("impressions", 0)),
        clicks=int(row.get("clicks", 0)),
        actions=actions,
        cost_per_action=costs,
        whatsapp_events=events,
    )


def fetch_country_breakdown(
    client: MetaClient, ad_account_id: str, ad_ids: Optional[List[str]]
) -> List[Dict[str, Any]]:
    filters = []
    if ad_ids:
        filters.append({"field": "ad.id", "operator": "IN", "value": ad_ids})

    params = {
        "fields": "country,spend,impressions,clicks,actions",
        "breakdowns": "country",
        "level": "ad",
        "filtering": filters,
    }
    data = client.get(f"{ad_account_id}/insights", params).get("data", [])
    rows: List[Dict[str, Any]] = []
    for row in data:
        actions = _extract_actions(row.get("actions", []))
        rows.append(
            {
                "country": row.get("country"),
                "spend": row.get("spend", 0),
                "impressions": row.get("impressions", 0),
                "clicks": row.get("clicks", 0),
                "messaging_conversation_started": actions.get(
                    "messaging_conversation_started", 0
                ),
                "onsite_conversion.messaging_conversation_started": actions.get(
                    "onsite_conversion.messaging_conversation_started", 0
                ),
            }
        )
    return rows


def attach_cpr(metric: AdMetrics) -> float:
    return compute_cpr(metric.spend, metric.whatsapp_events)
