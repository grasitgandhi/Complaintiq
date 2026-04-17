# backend/schemas/complaint_schemas.py
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime


class AttachmentIn(BaseModel):
    name: str
    mime_type: str
    size_kb: int
    data_base64: str


class ComplaintCreate(BaseModel):
    customer_account:    str
    customer_mobile:     str
    customer_email:      Optional[str] = None
    preferred_language:  Optional[str] = "EN"
    product_category:    str
    channel:             Optional[str] = "Online Portal"
    complaint_text:      str
    incident_date:       Optional[str] = None
    transaction_reference: Optional[str] = None
    attachments:         Optional[List[AttachmentIn]] = []

    @field_validator("customer_mobile")
    @classmethod
    def validate_mobile(cls, v):
        import re
        if not re.match(r"^[6-9]\d{9}$", v):
            raise ValueError("Mobile must be 10 digits starting with 6–9")
        return v

    @field_validator("complaint_text")
    @classmethod
    def validate_text(cls, v):
        if len(v) < 30:
            raise ValueError("Complaint description must be at least 30 characters")
        return v


class PolicySource(BaseModel):
    doc_name: str
    section:  str
    excerpt:  str


class ComplaintEvent(BaseModel):
    id:          int
    event_type:  str
    description: str
    actor_type:  str
    created_at:  datetime

    class Config:
        from_attributes = True


class ComplaintOut(BaseModel):
    id:               int
    reference_number: str
    customer_account: str
    customer_name:    Optional[str]
    customer_mobile:  Optional[str]
    product_category: str
    channel:          Optional[str]
    complaint_text:   str
    attachments:      Optional[List[dict]] = []
    filed_at:         datetime
    status:           str
    sla_tier:         str
    sla_deadline:     Optional[datetime]
    sla_breach_probability: Optional[float]
    ai_complaint_type:      Optional[str]
    ai_sentiment:           Optional[str]
    ai_confidence_score:    Optional[float]
    ai_trigger_phrases:     Optional[List[str]]
    escalation_threat_detected: bool
    escalation_language:        Optional[str]
    compliance_flagged:         bool
    compliance_flag_reason:     Optional[str]
    is_duplicate:               bool
    duplicate_similarity_score: Optional[float]
    ai_draft_response:          Optional[str]
    ai_draft_policy_sources:    Optional[List[dict]]
    final_response_text:        Optional[str]
    csat_rating:                Optional[int]
    events:                     List[ComplaintEvent] = []

    class Config:
        from_attributes = True


class ComplaintCreateResponse(BaseModel):
    reference_number:    str
    sla_tier:            str
    sla_deadline:        datetime
    estimated_resolution: str
    escalation_detected: bool
    ai_complaint_type:   str
    ai_confidence_score: float


class ComplaintListResponse(BaseModel):
    items: List[ComplaintOut]
    total: int
    page:  int
    pages: int


class StatusUpdate(BaseModel):
    status:   str
    agent_id: Optional[int] = None
    note:     Optional[str] = None


class ResponseCreate(BaseModel):
    final_response_text: str
    agent_id:            Optional[int] = None


class FeedbackCreate(BaseModel):
    csat_rating:  int
    csat_comment: Optional[str] = None

    @field_validator("csat_rating")
    @classmethod
    def validate_rating(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Rating must be 1–5")
        return v


class AIDraftResponse(BaseModel):
    draft_text:        str
    policy_sources:    List[PolicySource]
    compliance_flagged: bool
    flag_reason:       Optional[str]
    generated_at:      datetime
