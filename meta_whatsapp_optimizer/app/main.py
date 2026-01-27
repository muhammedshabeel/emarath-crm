"""FastAPI entry point for optimization system."""
from __future__ import annotations

from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, StrictStr

from .ai_engine import AIEngine, AIEngineError
from .country_analysis import build_country_performance
from .data_fetcher import (
    fetch_account_metrics,
    fetch_ad_metrics,
    fetch_country_breakdown,
)
from .decision_engine import make_decisions
from .processors import compute_cpr, compute_ctr, compute_conversion_rate
from .validators import ValidationError, validate_country_data, validate_metric
from .meta_client import MetaClient, MetaAPIError
from .models import OptimizationResponse


class OptimizationRequest(BaseModel):
    access_token: StrictStr = Field(..., description="Meta access token")
    ad_account_id: StrictStr = Field(..., description="Meta ad account id, e.g. act_123")
    ad_ids: Optional[List[StrictStr]] = Field(None, description="List of ad IDs")

    class Config:
        extra = "forbid"


app = FastAPI(title="Meta WhatsApp Conversation Optimizer")


@app.post("/optimize", response_model=OptimizationResponse)
def optimize(request: OptimizationRequest) -> OptimizationResponse:
    try:
        client = MetaClient(request.access_token)
        account = fetch_account_metrics(client, request.ad_account_id)
        validate_metric(account)

        ad_ids = request.ad_ids or []
        ads = [fetch_ad_metrics(client, ad_id) for ad_id in ad_ids]
        for ad in ads:
            validate_metric(ad)

        country_rows = fetch_country_breakdown(
            client, request.ad_account_id, ad_ids or None
        )
        country_metrics = build_country_performance(country_rows)
        validate_country_data(country_metrics)

        account_cpr = compute_cpr(account.spend, account.whatsapp_events)
        account_ctr = compute_ctr(account.clicks, account.impressions)
        account_conv_rate = compute_conversion_rate(
            account.clicks, account.whatsapp_events
        )
        decisions = make_decisions(
            account_cpr,
            account_ctr,
            account_conv_rate,
            ads,
            country_metrics,
        )

        ai_engine = AIEngine()
        ai_payload = {
            "account": account.dict(),
            "ads": [ad.dict() for ad in ads],
            "country": [row.dict() for row in country_metrics],
        }
        ai_analysis = None
        try:
            ai_analysis = ai_engine.analyze(ai_payload)
        except AIEngineError:
            ai_analysis = None

        return OptimizationResponse(
            status="OK",
            account=account,
            ads=ads,
            country_analysis=country_metrics,
            decisions=decisions,
            ai_analysis=ai_analysis,
        )
    except (MetaAPIError, ValidationError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=f"INSUFFICIENT_DATA: {exc}") from exc
