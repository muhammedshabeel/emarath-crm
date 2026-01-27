"""Pydantic models for validated data."""
from __future__ import annotations

from typing import Dict, List, Optional
from pydantic import BaseModel, Field, StrictFloat, StrictInt, StrictStr


class WhatsAppEvents(BaseModel):
    messaging_conversation_started: StrictInt = Field(0, ge=0)
    onsite_conversion_messaging_conversation_started: StrictInt = Field(0, ge=0)

    class Config:
        extra = "forbid"


class MetricBase(BaseModel):
    name: StrictStr
    spend: StrictFloat = Field(..., ge=0)
    impressions: StrictInt = Field(..., ge=0)
    clicks: StrictInt = Field(..., ge=0)
    reach: Optional[StrictInt] = Field(None, ge=0)
    actions: Dict[str, StrictInt] = Field(default_factory=dict)
    cost_per_action: Dict[str, StrictFloat] = Field(default_factory=dict)
    whatsapp_events: WhatsAppEvents

    class Config:
        extra = "forbid"


class AccountMetrics(MetricBase):
    account_id: StrictStr


class CampaignMetrics(MetricBase):
    campaign_id: StrictStr
    objective: Optional[StrictStr] = None


class AdSetMetrics(MetricBase):
    adset_id: StrictStr
    campaign_id: StrictStr
    daily_budget: Optional[StrictFloat] = Field(None, ge=0)
    bid_strategy: Optional[StrictStr] = None
    targeting: Dict[str, StrictStr] = Field(default_factory=dict)


class AdMetrics(MetricBase):
    ad_id: StrictStr
    adset_id: StrictStr
    campaign_id: StrictStr
    creative_id: Optional[StrictStr] = None
    cta_type: Optional[StrictStr] = None
    whatsapp_deep_link: Optional[StrictStr] = None


class CountryPerformance(BaseModel):
    country: StrictStr
    impressions: StrictInt = Field(..., ge=0)
    clicks: StrictInt = Field(..., ge=0)
    spend: StrictFloat = Field(..., ge=0)
    whatsapp_events: WhatsAppEvents
    cpr: Optional[StrictFloat] = Field(None, ge=0)
    ctr: Optional[StrictFloat] = Field(None, ge=0)
    conv_rate: Optional[StrictFloat] = Field(None, ge=0)

    class Config:
        extra = "forbid"


class OptimizationDecision(BaseModel):
    decision: StrictStr
    justification: StrictStr
    risk_level: StrictStr
    expected_cpr_change_pct: StrictFloat
    learning_reset_risk: StrictStr

    class Config:
        extra = "forbid"


class OptimizationResponse(BaseModel):
    status: StrictStr
    account: AccountMetrics
    ads: List[AdMetrics]
    country_analysis: List[CountryPerformance]
    decisions: List[OptimizationDecision]
    ai_analysis: Optional[StrictStr] = None

    class Config:
        extra = "forbid"
