"""Decision engine for optimization actions."""
from __future__ import annotations

from typing import List

from .models import AdMetrics, CountryPerformance, OptimizationDecision
from .processors import compute_cpr, compute_ctr, compute_conversion_rate, total_whatsapp_events


LEARNING_EVENTS_THRESHOLD = 50


def _risk_level(is_learning: bool, volatility_flag: bool) -> str:
    if is_learning:
        return "HIGH"
    if volatility_flag:
        return "MEDIUM"
    return "LOW"


def _learning_status(events: int) -> bool:
    return events < LEARNING_EVENTS_THRESHOLD


def _country_inflation_summary(country_data: List[CountryPerformance]) -> str:
    if not country_data:
        return "Country data missing; conclusions blocked."
    worst = max(country_data, key=lambda row: row.cpr or 0)
    return (
        f"Highest CPR country {worst.country} at {worst.cpr:.2f} with "
        f"CTR {worst.ctr:.4f} and conversation rate {worst.conv_rate:.4f}."
    )


def make_decisions(
    account_cpr: float,
    account_ctr: float,
    account_conv_rate: float,
    ads: List[AdMetrics],
    country_data: List[CountryPerformance],
) -> List[OptimizationDecision]:
    decisions: List[OptimizationDecision] = []
    inflation_summary = _country_inflation_summary(country_data)

    for ad in ads:
        ad_events = total_whatsapp_events(ad.whatsapp_events)
        ad_cpr = compute_cpr(ad.spend, ad.whatsapp_events)
        ad_ctr = compute_ctr(ad.clicks, ad.impressions)
        ad_conv = compute_conversion_rate(ad.clicks, ad.whatsapp_events)
        learning = _learning_status(ad_events)
        volatility_flag = ad_ctr < account_ctr * 0.6 or ad_conv < account_conv_rate * 0.6

        if learning:
            decision = OptimizationDecision(
                decision="STABILIZE",
                justification=(
                    f"Learning phase protection: {ad_events} conversations (<{LEARNING_EVENTS_THRESHOLD}). "
                    f"Hold structure to avoid reset. {inflation_summary}"
                ),
                risk_level=_risk_level(True, volatility_flag),
                expected_cpr_change_pct=0.0,
                learning_reset_risk="HIGH",
            )
        elif ad_cpr == 0:
            decision = OptimizationDecision(
                decision="STABILIZE",
                justification=(
                    "No WhatsApp CPR computed due to missing events; conclusions blocked."
                ),
                risk_level="HIGH",
                expected_cpr_change_pct=0.0,
                learning_reset_risk="HIGH",
            )
        elif ad_cpr > account_cpr * 1.5 and volatility_flag:
            expected_change = max(5.0, min(60.0, (1 - account_cpr / ad_cpr) * 100))
            decision = OptimizationDecision(
                decision="RESTRUCTURE",
                justification=(
                    f"Ad CPR {ad_cpr:.2f} is 50% above account CPR {account_cpr:.2f} with weak CTR/conv. "
                    f"Address creative intent and geo isolation. {inflation_summary}"
                ),
                risk_level=_risk_level(False, True),
                expected_cpr_change_pct=round(expected_change, 2),
                learning_reset_risk="MEDIUM",
            )
        elif ad_cpr < account_cpr * 0.8 and ad_events >= LEARNING_EVENTS_THRESHOLD:
            expected_change = max(5.0, min(40.0, (account_cpr / ad_cpr - 1) * 100))
            decision = OptimizationDecision(
                decision="SCALE",
                justification=(
                    f"Ad CPR {ad_cpr:.2f} is 20% below account CPR {account_cpr:.2f} with stable volume. "
                    f"Scale carefully without mixing geos. {inflation_summary}"
                ),
                risk_level=_risk_level(False, False),
                expected_cpr_change_pct=round(expected_change, 2),
                learning_reset_risk="LOW",
            )
        else:
            decision = OptimizationDecision(
                decision="STABILIZE",
                justification=(
                    f"Ad CPR {ad_cpr:.2f} close to account CPR {account_cpr:.2f}. "
                    f"Maintain while monitoring. {inflation_summary}"
                ),
                risk_level=_risk_level(False, volatility_flag),
                expected_cpr_change_pct=0.0,
                learning_reset_risk="LOW",
            )

        decisions.append(decision)

    return decisions
