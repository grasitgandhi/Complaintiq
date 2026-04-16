# backend/services/sla_service.py
"""
Layer 4 — Risk Attribution
  get_sla_deadline  : RBI IOS SLA tier → deadline datetime
  check_sla_breach_probability : XGBoost breach predictor mock
"""
from datetime import datetime, timedelta, timezone
import random

# TODO: Layer 4 — Risk Attribution — replace with XGBoost model trained on historical data
# Target: SLA compliance rate > 92% (design target based on XGBoost prediction capability)

# Per RBI Integrated Ombudsman Scheme (Circular RBI/2023-24/117)
SLA_HOURS = {"P1": 24, "P2": 48}   # calendar hours
SLA_BDAYS = {"P3": 5,  "P4": 10}   # business days

# 2026 Indian bank holidays (major national holidays)
BANK_HOLIDAYS_2026 = {
    datetime(2026, 1, 1).date(),   # New Year
    datetime(2026, 1, 14).date(),  # Makar Sankranti
    datetime(2026, 1, 26).date(),  # Republic Day
    datetime(2026, 3, 25).date(),  # Holi
    datetime(2026, 4, 14).date(),  # Dr. Ambedkar Jayanti / Tamil New Year
    datetime(2026, 8, 15).date(),  # Independence Day
    datetime(2026, 10, 2).date(),  # Gandhi Jayanti
    datetime(2026, 10, 24).date(), # Dussehra
    datetime(2026, 11, 5).date(),  # Diwali
    datetime(2026, 12, 25).date(), # Christmas
}


def _is_business_day(d: datetime) -> bool:
    return d.weekday() < 5 and d.date() not in BANK_HOLIDAYS_2026


def get_sla_deadline(tier: str, filed_at: datetime) -> datetime:
    """
    Per RBI IOS:
      P1 → +24 calendar hours
      P2 → +48 calendar hours
      P3 → +5 business days
      P4 → +10 business days
    """
    # Per RBI Integrated Ombudsman Scheme (Circular RBI/2023-24/117)
    if tier in SLA_HOURS:
        return filed_at + timedelta(hours=SLA_HOURS[tier])

    bdays_needed = SLA_BDAYS.get(tier, 5)
    current      = filed_at
    bdays_count  = 0

    while bdays_count < bdays_needed:
        current = current + timedelta(days=1)
        if _is_business_day(current):
            bdays_count += 1

    return current


def check_sla_breach_probability(
    sla_deadline: datetime,
    filed_at: datetime,
    status: str,
    tier: str,
) -> float:
    """
    TODO: Layer 4 — replace with XGBoost model trained on historical complaint data
    Features in production: time_remaining_fraction, status, tier, agent_queue_depth,
                            complaint_sentiment, product_category, hour_of_day, day_of_week

    Prototype: rule-based scoring
    """
    now = datetime.now(timezone.utc)

    # Time fraction used
    total_window = (sla_deadline - filed_at).total_seconds()
    elapsed      = (now - filed_at).total_seconds()
    if total_window <= 0:
        return 1.0
    time_fraction = min(elapsed / total_window, 1.0)

    # Status penalty
    status_penalty = {
        "New":              0.30,
        "InProgress":       0.10,
        "AwaitingCustomer": 0.15,
        "DraftReady":       0.05,
        "Resolved":         0.0,
        "Closed":           0.0,
    }.get(status, 0.10)

    # Tier urgency
    tier_factor = {"P1": 1.3, "P2": 1.1, "P3": 0.9, "P4": 0.7}.get(tier, 1.0)

    score = (time_fraction * 0.6 + status_penalty * 0.4) * tier_factor
    noise = random.uniform(-0.03, 0.03)
    return round(max(0.0, min(1.0, score + noise)), 2)
