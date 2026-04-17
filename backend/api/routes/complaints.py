# backend/api/routes/complaints.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional

from database import get_db
from models.complaint import Complaint, ComplaintEvent, ActorType, ComplaintStatus, ProductCategory
from models.agent import Agent
from schemas.complaint_schemas import (
    ComplaintCreate, ComplaintCreateResponse, ComplaintOut,
    ComplaintListResponse, StatusUpdate, ResponseCreate,
    FeedbackCreate, AIDraftResponse,
)
from services import nlp_service, sla_service, dedup_service, rag_service
from services.pii_masking import mask_account, mask_mobile, mask_email

router = APIRouter(prefix="/complaints", tags=["complaints"])

PRODUCT_CATEGORY_MAP = {
    "UPI": ProductCategory.UPI,
    "UPI PAYMENT": ProductCategory.UPI,
    "NACH": ProductCategory.NACH,
    "NACH MANDATE": ProductCategory.NACH,
    "SAVINGS": ProductCategory.SAVINGS,
    "SAVINGS ACCOUNT": ProductCategory.SAVINGS,
    "HOME_LOAN": ProductCategory.HOME_LOAN,
    "HOME LOAN": ProductCategory.HOME_LOAN,
    "CREDIT_CARD": ProductCategory.CREDIT_CARD,
    "CREDIT CARD": ProductCategory.CREDIT_CARD,
    "FD": ProductCategory.FD,
    "FIXED DEPOSIT": ProductCategory.FD,
    "NRE": ProductCategory.NRE,
    "NRE ACCOUNT": ProductCategory.NRE,
    "PMJDY": ProductCategory.PMJDY,
    "PMJDY ACCOUNT": ProductCategory.PMJDY,
    "NET_BANKING": ProductCategory.NET_BANKING,
    "NET BANKING": ProductCategory.NET_BANKING,
    "OTHER": ProductCategory.OTHER,
}

CHANNEL_MAP = {
    "ONLINE PORTAL": "Online Portal",
    "EMAIL": "Email",
    "PHONE": "Phone",
    "BRANCH WALK-IN": "Branch Walk-in",
    "BRANCH WALK IN": "Branch Walk-in",
    "SOCIAL MEDIA": "Social Media",
}


def _normalize_product_category(raw_value: str) -> ProductCategory:
    key = (raw_value or "").strip().upper()
    normalized = PRODUCT_CATEGORY_MAP.get(key)
    if not normalized:
        raise HTTPException(
            status_code=400,
            detail="Invalid product category. Use one of: UPI, NACH, SAVINGS, HOME_LOAN, CREDIT_CARD, FD, NRE, PMJDY, NET_BANKING, OTHER.",
        )
    return normalized


def _normalize_channel(raw_value: Optional[str]) -> str:
    key = (raw_value or "Online Portal").strip().upper()
    return CHANNEL_MAP.get(key, "Online Portal")


def _gen_reference(db: Session) -> str:
    year  = datetime.now().year
    count = db.query(Complaint).count() + 1
    return f"CIQ-{year}-{str(count).zfill(6)}"


def _make_event(complaint_id: int, event_type: str, description: str,
                actor_type=ActorType.SYSTEM, actor_id: Optional[int] = None):
    return ComplaintEvent(
        complaint_id=complaint_id,
        event_type=event_type,
        description=description,
        actor_type=actor_type,
        actor_id=actor_id,
    )


# ── POST /complaints ──────────────────────────────────────────────────────────
@router.post("", response_model=ComplaintCreateResponse, status_code=201)
def create_complaint(body: ComplaintCreate, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    normalized_product = _normalize_product_category(body.product_category)
    normalized_channel = _normalize_channel(body.channel)

    # ── PII MASKING: Mask sensitive customer data before database storage ──
    masked_account = mask_account(body.customer_account)
    masked_mobile  = mask_mobile(body.customer_mobile)
    masked_email   = mask_email(body.customer_email) if body.customer_email else None

    # Layer 2 + 3 — NLP classification
    nlp = nlp_service.classify_complaint(body.complaint_text)

    # Layer 4 — SLA tier + deadline
    tier     = nlp["severity"]
    deadline = sla_service.get_sla_deadline(tier, now)

    # Layer 3 — Duplicate detection
    # Note: Use original account for dedup matching, but will store masked version
    recent = [
        {"id": c.id, "text": c.complaint_text, "filed_at": c.filed_at}
        for c in db.query(Complaint)
            .filter(Complaint.customer_account == masked_account)
            .order_by(Complaint.filed_at.desc())
            .limit(20)
    ]
    dedup = dedup_service.check_duplicate(body.complaint_text, body.customer_account, recent)

    # Persist with MASKED PII
    ref = _gen_reference(db)
    c   = Complaint(
        reference_number          = ref,
        customer_account          = masked_account,  # ← MASKED: Show only last 4 digits
        customer_mobile           = masked_mobile,   # ← MASKED: Show only last 3 digits
        customer_email            = masked_email,    # ← MASKED: Show only domain
        preferred_language        = (body.preferred_language or "EN")[:2].upper(),
        product_category          = normalized_product,
        channel                   = normalized_channel,
        complaint_text            = body.complaint_text,
        attachments               = [a.model_dump() for a in (body.attachments or [])],
        transaction_reference     = body.transaction_reference,
        incident_date             = body.incident_date,
        filed_at                  = now,
        status                    = ComplaintStatus.New,
        sla_tier                  = tier,
        sla_deadline              = deadline,
        sla_breach_probability    = sla_service.check_sla_breach_probability(deadline, now, "New", tier),
        ai_complaint_type         = nlp["complaint_type"],
        ai_product_category       = nlp["product_category"],
        ai_severity               = nlp["severity"],
        ai_sentiment              = nlp["sentiment"],
        ai_confidence_score       = nlp["ai_confidence_score"],
        ai_trigger_phrases        = nlp["trigger_phrases"],
        escalation_threat_detected= nlp["escalation_detected"],
        escalation_language       = nlp["escalation_language"],
        is_duplicate              = dedup["is_duplicate"],
        duplicate_of_id           = dedup["duplicate_of"],
        duplicate_similarity_score= dedup["similarity_score"],
    )
    db.add(c)
    db.flush()   # get c.id

    # Audit event
    db.add(_make_event(c.id, "COMPLAINT_RECEIVED",
        f"Complaint received and classified by AI pipeline (Layer 2–4). "
        f"Product: {nlp['product_category']}, Sentiment: {nlp['sentiment']}, Tier: {tier}"))

    if nlp["escalation_detected"]:
        db.add(_make_event(c.id, "ESCALATION_DETECTED",
            f"Customer mentioned regulatory body ({', '.join(nlp['trigger_phrases'])}) — "
            f"auto-upgraded to P1 (Indian Banking Ontology, {nlp['escalation_language']} detected)"))

    db.commit()
    db.refresh(c)

    return ComplaintCreateResponse(
        reference_number    = ref,
        sla_tier            = tier,
        sla_deadline        = deadline,
        estimated_resolution= deadline.strftime("%d %b %Y"),
        escalation_detected = nlp["escalation_detected"],
        ai_complaint_type   = nlp["complaint_type"],
        ai_confidence_score = nlp["ai_confidence_score"],
    )


# ── GET /complaints ───────────────────────────────────────────────────────────
@router.get("", response_model=ComplaintListResponse)
def list_complaints(
    status:           Optional[str] = None,
    sla_tier:         Optional[str] = None,
    product_category: Optional[str] = None,
    agent_id:         Optional[str] = None,
    search:           Optional[str] = None,
    page:             int = Query(1, ge=1),
    limit:            int = Query(20, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Complaint)
    if status:           q = q.filter(Complaint.status == status)
    if sla_tier:         q = q.filter(Complaint.sla_tier == sla_tier)
    if product_category: q = q.filter(Complaint.product_category == product_category)
    if agent_id and agent_id != "me":
        q = q.filter(Complaint.assigned_agent_id == int(agent_id))
    if search:
        q = q.filter(
            Complaint.reference_number.ilike(f"%{search}%") |
            Complaint.customer_account.ilike(f"%{search}%")
        )

    total  = q.count()
    items  = q.order_by(Complaint.sla_deadline).offset((page - 1) * limit).limit(limit).all()
    pages  = (total + limit - 1) // limit

    return ComplaintListResponse(items=items, total=total, page=page, pages=pages)


# ── GET /complaints/{ref} ─────────────────────────────────────────────────────
@router.get("/{reference_number}", response_model=ComplaintOut)
def get_complaint(reference_number: str, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.reference_number == reference_number).first()
    if not c:
        # Try by id
        try:
            c = db.query(Complaint).filter(Complaint.id == int(reference_number)).first()
        except ValueError:
            pass
    if not c:
        raise HTTPException(404, "Complaint not found")
    return c


# ── PATCH /complaints/{id}/status ────────────────────────────────────────────
@router.patch("/{complaint_id}/status", response_model=ComplaintOut)
def update_status(complaint_id: int, body: StatusUpdate, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(404, "Complaint not found")

    old_status  = c.status
    c.status    = body.status
    if body.agent_id:
        c.assigned_agent_id = body.agent_id

    desc = f"Status updated: {old_status} → {body.status}"
    if body.note:
        desc += f" · Note: {body.note}"

    db.add(_make_event(c.id, "STATUS_UPDATE", desc,
           actor_type=ActorType.AGENT, actor_id=body.agent_id))
    db.commit()
    db.refresh(c)
    return c


# ── POST /complaints/{id}/response ───────────────────────────────────────────
@router.post("/{complaint_id}/response", response_model=ComplaintOut)
def send_response(complaint_id: int, body: ResponseCreate, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(404, "Complaint not found")

    now = datetime.now(timezone.utc)
    c.status              = ComplaintStatus.Resolved
    c.resolved_at         = now
    c.final_response_text = body.final_response_text
    c.draft_edited_by_agent = (body.final_response_text != c.ai_draft_response)

    agent = db.query(Agent).filter(Agent.id == body.agent_id).first() if body.agent_id else None
    agent_name = agent.name if agent else "Agent"

    db.add(_make_event(c.id, "RESPONSE_SENT",
        f"Response approved and sent by {agent_name} (HITL sign-off — Layer 8)",
        actor_type=ActorType.AGENT, actor_id=body.agent_id))
    db.commit()
    db.refresh(c)
    return c


# ── POST /complaints/{id}/feedback ───────────────────────────────────────────
@router.post("/{complaint_id}/feedback")
def submit_feedback(complaint_id: int, body: FeedbackCreate, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(404, "Complaint not found")

    c.csat_rating  = body.csat_rating
    c.csat_comment = body.csat_comment

    db.add(_make_event(c.id, "CUSTOMER_FEEDBACK",
        f"Customer submitted {body.csat_rating}/5 feedback",
        actor_type=ActorType.CUSTOMER))
    db.commit()
    return {"success": True}


# ── GET /complaints/{id}/ai-draft ─────────────────────────────────────────────
@router.get("/{complaint_id}/ai-draft", response_model=AIDraftResponse)
def get_ai_draft(complaint_id: int, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(404, "Complaint not found")

    # Layer 5 + 6 — RAG draft generation
    result = rag_service.generate_draft(
        complaint_text   = c.complaint_text,
        product_category = c.product_category,
        complaint_ref    = c.reference_number,
    )

    # Persist draft if first time
    if not c.ai_draft_response:
        c.ai_draft_response        = result["draft_text"]
        c.ai_draft_policy_sources  = result["policy_sources"]
        c.ai_draft_generated_at    = result["generated_at"]
        c.compliance_flagged       = result["compliance_flagged"]
        c.compliance_flag_reason   = result["flag_reason"]
        if c.status == ComplaintStatus.New or c.status == ComplaintStatus.InProgress:
            c.status = ComplaintStatus.DraftReady
        db.commit()

    return AIDraftResponse(
        draft_text         = result["draft_text"],
        policy_sources     = result["policy_sources"],
        compliance_flagged = result["compliance_flagged"],
        flag_reason        = result["flag_reason"],
        generated_at       = result["generated_at"],
    )
