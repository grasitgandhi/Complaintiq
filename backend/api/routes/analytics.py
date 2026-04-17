# backend/api/routes/analytics.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, timedelta, timezone
from typing import List
import os

from database import get_db
from models.complaint import Complaint, ComplaintStatus, SLATier, SentimentLabel
from schemas.analytics_schemas import (
    SummaryStats, VolumePoint, ProductCount,
    SLAPerformanceRow, SentimentRow, MonthlyReportData, AgentPerformanceRow,
)
from models.agent import Agent, AgentRole

router = APIRouter(prefix="/analytics", tags=["analytics"])

BANK_NAME = os.getenv("BANK_NAME", "State Bank of India")


@router.get("/summary", response_model=SummaryStats)
def summary(db: Session = Depends(get_db)):
    open_count   = db.query(Complaint).filter(Complaint.status.notin_(["Resolved","Closed"])).count()
    total        = db.query(Complaint).count() or 1
    resolved     = db.query(Complaint).filter(Complaint.status.in_(["Resolved","Closed"])).count()

    # Breach rate
    now = datetime.now(timezone.utc)
    breached = db.query(Complaint).filter(
        Complaint.sla_deadline < now,
        Complaint.status.notin_(["Resolved","Closed"])
    ).count()
    breach_rate = round((breached / total) * 100, 1) if total else 0

    # Avg resolution time (days)
    resolved_complaints = db.query(Complaint).filter(
        Complaint.resolved_at.isnot(None)
    ).all()
    if resolved_complaints:
        avg_res = sum(
            (c.resolved_at - c.filed_at).total_seconds() / 86400
            for c in resolved_complaints
        ) / len(resolved_complaints)
    else:
        avg_res = 0.0

    # AI automation rate
    edited   = db.query(Complaint).filter(Complaint.draft_edited_by_agent == True).count()
    ai_auto  = round(((resolved - edited) / resolved * 100), 1) if resolved > 0 else 61.0

    # CSAT
    ratings = db.query(Complaint.csat_rating).filter(Complaint.csat_rating.isnot(None)).all()
    csat    = round(sum(r[0] for r in ratings) / len(ratings), 1) if ratings else 4.2

    return SummaryStats(
        open=open_count, breach_rate=breach_rate,
        avg_resolution=round(avg_res, 1), ai_automation=ai_auto, csat=csat,
    )


@router.get("/volume", response_model=List[VolumePoint])
def volume(db: Session = Depends(get_db)):
    now    = datetime.now(timezone.utc)
    result = []
    for i in range(29, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end   = day_start + timedelta(days=1)
        total    = db.query(Complaint).filter(Complaint.filed_at.between(day_start, day_end)).count()
        resolved = db.query(Complaint).filter(
            Complaint.filed_at.between(day_start, day_end),
            Complaint.status.in_(["Resolved", "Closed"])
        ).count()
        result.append(VolumePoint(
            date     = day_start.strftime("%d %b"),
            total    = total,
            resolved = resolved,
        ))
    return result


@router.get("/by-product", response_model=List[ProductCount])
def by_product(db: Session = Depends(get_db)):
    rows = db.query(Complaint.product_category, func.count(Complaint.id))\
             .group_by(Complaint.product_category).all()
    return [ProductCount(product=r[0], count=r[1]) for r in rows]


@router.get("/sla-performance", response_model=List[SLAPerformanceRow])
def sla_performance(db: Session = Depends(get_db)):
    now    = datetime.now(timezone.utc)
    result = []
    for tier in ["P1", "P2", "P3", "P4"]:
        rows = db.query(Complaint).filter(Complaint.sla_tier == tier).all()
        total    = len(rows)
        breached = sum(1 for c in rows
                       if c.status not in ("Resolved","Closed") and c.sla_deadline and c.sla_deadline < now)
        on_time  = total - breached
        breach_rate = round((breached / total * 100), 1) if total else 0.0
        resolved_rows = [c for c in rows if c.resolved_at]
        avg_days = round(
            sum((c.resolved_at - c.filed_at).total_seconds() / 86400 for c in resolved_rows)
            / len(resolved_rows), 1
        ) if resolved_rows else 0.0
        result.append(SLAPerformanceRow(
            tier=tier, total=total, on_time=on_time, breached=breached,
            breach_rate=breach_rate, avg_days=avg_days,
        ))
    return result


@router.get("/sentiment", response_model=List[SentimentRow])
def sentiment(db: Session = Depends(get_db)):
    rows = db.query(Complaint.product_category, Complaint.ai_sentiment, func.count(Complaint.id))\
             .group_by(Complaint.product_category, Complaint.ai_sentiment).all()
    agg: dict = {}
    for product, sent, cnt in rows:
        if product not in agg:
            agg[product] = {"frustrated": 0, "neutral": 0, "satisfied": 0}
        if sent in ("FRUSTRATED", "VERY_FRUSTRATED"):
            agg[product]["frustrated"] += cnt
        elif sent == "SATISFIED":
            agg[product]["satisfied"] += cnt
        else:
            agg[product]["neutral"] += cnt
    return [SentimentRow(product=k, **v) for k, v in agg.items()]


@router.get("/agent-performance", response_model=List[AgentPerformanceRow])
def agent_performance(db: Session = Depends(get_db)):
    agents = db.query(Agent).filter(Agent.role == AgentRole.AGENT).all()
    result = []

    for agent in agents:
        assigned_rows = db.query(Complaint).filter(Complaint.assigned_agent_id == agent.id).all()
        resolved_rows = [
            c for c in assigned_rows
            if c.status in (ComplaintStatus.Resolved, ComplaintStatus.Closed)
        ]

        handle_durations = [
            (c.resolved_at - c.filed_at).total_seconds() / 86400
            for c in resolved_rows
            if c.resolved_at and c.filed_at
        ]
        avg_handle_days = round(sum(handle_durations) / len(handle_durations), 1) if handle_durations else 0.0

        csat_values = [c.csat_rating for c in assigned_rows if c.csat_rating is not None]
        csat = round(sum(csat_values) / len(csat_values), 1) if csat_values else 0.0

        resolved_with_deadline = [
            c for c in resolved_rows
            if c.sla_deadline is not None and c.resolved_at is not None
        ]
        within_sla = sum(1 for c in resolved_with_deadline if c.resolved_at <= c.sla_deadline)
        sla_pct = round((within_sla / len(resolved_with_deadline)) * 100, 1) if resolved_with_deadline else 0.0

        ai_eligible = [c for c in resolved_rows if c.ai_draft_response]
        ai_no_edit = sum(1 for c in ai_eligible if not c.draft_edited_by_agent)
        ai_usage = round((ai_no_edit / len(ai_eligible)) * 100, 1) if ai_eligible else 0.0

        by_product_map = {}
        for c in assigned_rows:
            key = str(c.product_category)
            by_product_map[key] = by_product_map.get(key, 0) + 1
        by_product = [
            {"product": k, "count": v}
            for k, v in sorted(by_product_map.items(), key=lambda x: x[1], reverse=True)
        ]

        frustrated = 0
        neutral = 0
        satisfied = 0
        for c in assigned_rows:
            if c.ai_sentiment in (SentimentLabel.FRUSTRATED, SentimentLabel.VERY_FRUSTRATED):
                frustrated += 1
            elif c.ai_sentiment == SentimentLabel.SATISFIED:
                satisfied += 1
            else:
                neutral += 1

        result.append(
            AgentPerformanceRow(
                id=agent.id,
                name=agent.name,
                team=agent.team or "Unassigned Team",
                assigned=len(assigned_rows),
                resolved=len(resolved_rows),
                avg_handle_days=avg_handle_days,
                csat=csat,
                sla_pct=sla_pct,
                ai_usage=ai_usage,
                by_product=by_product,
                sentiment={
                    "frustrated": frustrated,
                    "neutral": neutral,
                    "satisfied": satisfied,
                },
            )
        )

    return result


# ── RBI Monthly Report ────────────────────────────────────────────────────────
report_router = APIRouter(prefix="/reports", tags=["reports"])

@report_router.get("/monthly", response_model=MonthlyReportData)
def monthly_report(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    month = now.strftime("%B %Y")

    all_rows = db.query(Complaint).all()

    # Table 1 — category summary
    by_cat = []
    for row in db.query(Complaint.product_category, func.count(Complaint.id))\
                 .group_by(Complaint.product_category).all():
        category = row[0].value if hasattr(row[0], "value") else str(row[0])
        cnt = row[1]
        disp = db.query(Complaint).filter(
            Complaint.product_category == row[0],
            Complaint.status.in_(["Resolved", "Closed"])
        ).count()
        by_cat.append({
            "category": category,
            "received": cnt,
            "pending_prev": 0,
            "disposed": disp,
            "pending_end": max(cnt - disp, 0),
        })

    # Table 2 — mode of receipt (explicit stored channel)
    channel_counts = {
        "Online Portal": 0,
        "Email": 0,
        "Phone": 0,
        "Branch Walk-in": 0,
        "Social Media": 0,
    }

    for c in all_rows:
        channel = (getattr(c, "channel", None) or "Online Portal").strip()
        if channel not in channel_counts:
            channel = "Online Portal"
        channel_counts[channel] += 1

    total_received = len(all_rows)
    by_channel = []
    for ch in ["Online Portal", "Email", "Phone", "Branch Walk-in", "Social Media"]:
        count = channel_counts[ch]
        if count == 0:
            continue
        pct = round((count / total_received) * 100) if total_received else 0
        by_channel.append({"channel": ch, "count": count, "pct": pct})

    # Table 3 — top complaint grounds (use AI complaint type where available)
    top_ground_rows = db.query(Complaint.ai_complaint_type, func.count(Complaint.id))\
        .filter(Complaint.ai_complaint_type.isnot(None))\
        .group_by(Complaint.ai_complaint_type)\
        .order_by(func.count(Complaint.id).desc())\
        .limit(10)\
        .all()

    top_grounds = [
        {"ground": row[0], "count": row[1]}
        for row in top_ground_rows
        if row[0]
    ]

    # Fallback to product category if complaint type is missing
    if not top_grounds:
        fallback_rows = db.query(Complaint.product_category, func.count(Complaint.id))\
            .group_by(Complaint.product_category)\
            .order_by(func.count(Complaint.id).desc())\
            .limit(10)\
            .all()
        top_grounds = [
            {
                "ground": (row[0].value if hasattr(row[0], "value") else str(row[0])),
                "count": row[1],
            }
            for row in fallback_rows
        ]

    # Table 4 — disposal breakdown for resolved/closed complaints
    disposed_rows = [
        c for c in all_rows
        if c.status in (ComplaintStatus.Resolved, ComplaintStatus.Closed)
    ]
    within_sla = sum(
        1 for c in disposed_rows
        if c.resolved_at is not None and c.sla_deadline is not None and c.resolved_at <= c.sla_deadline
    )
    beyond_sla = sum(
        1 for c in disposed_rows
        if c.resolved_at is not None and c.sla_deadline is not None and c.resolved_at > c.sla_deadline
    )
    total_disposed = len(disposed_rows)

    return MonthlyReportData(
        bank_name=BANK_NAME,
        period=month,
        by_category=by_cat,
        by_channel=by_channel,
        top_grounds=top_grounds,
        disposal={
            "within_sla": within_sla,
            "beyond_sla": beyond_sla,
            "total": total_disposed,
        },
    )
