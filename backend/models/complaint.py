# backend/models/complaint.py
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float,
    DateTime, ForeignKey, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class ProductCategory(str, enum.Enum):
    UPI          = "UPI"
    NACH         = "NACH"
    SAVINGS      = "SAVINGS"
    HOME_LOAN    = "HOME_LOAN"
    CREDIT_CARD  = "CREDIT_CARD"
    FD           = "FD"
    NRE          = "NRE"
    PMJDY        = "PMJDY"
    NET_BANKING  = "NET_BANKING"
    OTHER        = "OTHER"


class SLATier(str, enum.Enum):
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"
    P4 = "P4"


class ComplaintStatus(str, enum.Enum):
    New              = "New"
    InProgress       = "InProgress"
    AwaitingCustomer = "AwaitingCustomer"
    DraftReady       = "DraftReady"
    Resolved         = "Resolved"
    Closed           = "Closed"


class SentimentLabel(str, enum.Enum):
    VERY_FRUSTRATED = "VERY_FRUSTRATED"
    FRUSTRATED      = "FRUSTRATED"
    NEUTRAL         = "NEUTRAL"
    SATISFIED       = "SATISFIED"


class ActorType(str, enum.Enum):
    SYSTEM   = "SYSTEM"
    AGENT    = "AGENT"
    CUSTOMER = "CUSTOMER"


class PreferredLanguage(str, enum.Enum):
    EN = "EN"
    HI = "HI"
    TA = "TA"
    MR = "MR"
    BN = "BN"
    GU = "GU"


class Complaint(Base):
    __tablename__ = "complaints"

    id               = Column(Integer, primary_key=True, index=True)
    reference_number = Column(String(20), unique=True, index=True, nullable=False)

    # Customer info
    customer_account  = Column(String(20), nullable=False, index=True)
    customer_name     = Column(String(100))
    customer_mobile   = Column(String(15))
    customer_email    = Column(String(200))
    preferred_language = Column(SAEnum(PreferredLanguage), default=PreferredLanguage.EN)

    # Complaint core
    product_category  = Column(SAEnum(ProductCategory), nullable=False)
    channel           = Column(String(40), default="Online Portal")
    complaint_text    = Column(Text, nullable=False)
    attachments       = Column(JSONB, default=list)
    transaction_reference = Column(String(100))
    incident_date     = Column(String(20))
    filed_at          = Column(DateTime(timezone=True), server_default=func.now())
    status            = Column(SAEnum(ComplaintStatus), default=ComplaintStatus.New)
    assigned_agent_id = Column(Integer, ForeignKey("agents.id"), nullable=True)

    # Layer 2 — NLP Classification (DistilBERT 4-head mock)
    # TODO: Layer 2 — Behaviour Modelling — replace with DistilBERT fine-tuned 4-head classifier
    ai_complaint_type    = Column(String(100))
    ai_product_category  = Column(String(50))
    ai_severity          = Column(String(10))
    ai_sentiment         = Column(SAEnum(SentimentLabel))
    ai_confidence_score  = Column(Float)
    ai_trigger_phrases   = Column(JSONB)   # list of matched phrases

    # Layer 4 — Risk Attribution (XGBoost mock)
    # TODO: Layer 4 — Risk Attribution — replace with XGBoost model
    sla_tier             = Column(SAEnum(SLATier), default=SLATier.P3)
    sla_deadline         = Column(DateTime(timezone=True))
    resolved_at          = Column(DateTime(timezone=True), nullable=True)
    sla_breach_probability = Column(Float, default=0.0)

    # Layer 5–6 — RAG + LLM (Ollama + ChromaDB mock)
    # TODO: Layer 5 — replace ChromaDB query with LangChain + ChromaDB semantic retrieval
    # TODO: Layer 6 — replace mock with Ollama Llama 3.2 3B (zero-hallucination mode)
    ai_draft_response      = Column(Text, nullable=True)
    ai_draft_policy_sources = Column(JSONB)  # [{doc_name, section, excerpt}]
    ai_draft_generated_at  = Column(DateTime(timezone=True), nullable=True)
    draft_edited_by_agent  = Column(Boolean, default=False)

    # Layer 7 — Compliance Checker (DistilBERT binary classifier mock)
    # TODO: Layer 7 — replace with DistilBERT binary compliance classifier (50ms inference)
    compliance_flagged      = Column(Boolean, default=False)
    compliance_flag_reason  = Column(String(500), nullable=True)

    # Layer 3 — Anomaly Detection (FAISS dedup mock)
    # TODO: Layer 3 — replace with FAISS cosine similarity on all-MiniLM-L6-v2 embeddings
    is_duplicate            = Column(Boolean, default=False)
    duplicate_of_id         = Column(Integer, ForeignKey("complaints.id"), nullable=True)
    duplicate_similarity_score = Column(Float, nullable=True)

    # Escalation (Indian banking ontology — 6-language detection)
    escalation_threat_detected = Column(Boolean, default=False)
    escalation_language        = Column(String(50), nullable=True)

    # Resolution
    final_response_text = Column(Text, nullable=True)
    csat_rating         = Column(Integer, nullable=True)   # 1–5
    csat_comment        = Column(Text, nullable=True)

    # Relationships
    events        = relationship("ComplaintEvent", back_populates="complaint", cascade="all, delete-orphan")
    assigned_agent = relationship("Agent", back_populates="complaints")


class ComplaintEvent(Base):
    """Full audit trail — Layer 9 Governance"""
    __tablename__ = "complaint_events"

    id           = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    event_type   = Column(String(100), nullable=False)
    description  = Column(Text, nullable=False)
    actor_type   = Column(SAEnum(ActorType), default=ActorType.SYSTEM)
    actor_id     = Column(Integer, nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    complaint = relationship("Complaint", back_populates="events")