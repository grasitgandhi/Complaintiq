# backend/services/rag_service.py
"""
Layer 5 — Context Assembly (ChromaDB RAG + LangChain)
Layer 6 — LLM Reasoning (Ollama Llama 3.2 3B — narration only)
Layer 7 — Compliance Checker (DistilBERT binary classifier mock)

ARCHITECTURE PRINCIPLE — Deterministic–Generative Bifurcation:
  XGBoost / rule engine → ALL classification and SLA decisions (deterministic, auditable)
  LLM (Ollama)          → ONLY response narration, constrained to RAG-retrieved documents
  NEVER mix them. LLM must not make classification, routing, or SLA decisions.
"""
from datetime import datetime, timezone
import os
import httpx

# TODO: Layer 5 — replace ChromaDB query with LangChain + ChromaDB semantic retrieval
# TODO: Layer 6 — replace mock with Ollama Llama 3.2 3B (zero-hallucination mode:
#        LLM constrained to retrieved documents only — cannot generate outside knowledge base)
# For faster demo: swap Ollama for Groq free tier (Llama 3.1 8B, 14,400 req/day)

POLICY_LIBRARY = {
    "UPI": [
        {"doc_name": "RBI Payment System Circular PSS/2021/01", "section": "Section 4.2",
         "excerpt": "Failed UPI transactions shall be auto-reversed within T+1 working day. Customer is entitled to a full refund within 24 hours."},
        {"doc_name": "NPCI UPI Dispute Resolution Guidelines", "section": "Section 2.1",
         "excerpt": "Banks must resolve UPI transaction disputes within 3 business days of complaint receipt."},
    ],
    "NACH": [
        {"doc_name": "NACH Operations Manual", "section": "Section 3.4",
         "excerpt": "Mandate bounce due to bank error shall be reversed within 1 business day with penalty waiver. Customer must be informed within 2 hours."},
        {"doc_name": "RBI IOS Circular RBI/2023-24/117", "section": "Section 6.1",
         "excerpt": "P1 complaints must be addressed within 24 calendar hours of receipt."},
    ],
    "SAVINGS": [
        {"doc_name": "Savings Account Operations Manual", "section": "Section 5.2",
         "excerpt": "Interest must be credited on the last working day of each quarter. Discrepancies must be resolved within 5 business days."},
    ],
    "HOME_LOAN": [
        {"doc_name": "Home Loan Policy Manual", "section": "Section 8.1",
         "excerpt": "EMI processing errors shall be corrected within 2 business days. Penalty charges must be reversed if the error is bank-side."},
    ],
    "CREDIT_CARD": [
        {"doc_name": "Credit Card Operations Manual", "section": "Section 8.1",
         "excerpt": "Disputed transactions are provisionally reversed within 48 hours pending investigation. Permanent resolution within 30 days per RBI mandate."},
    ],
    "NRE": [
        {"doc_name": "NRE Account Operations Policy", "section": "Section 4.1",
         "excerpt": "International remittances must be credited within 2 working days of receipt from the correspondent bank."},
    ],
}

DEFAULT_POLICY = [
    {"doc_name": "General Complaints Resolution Policy", "section": "Section 2.1",
     "excerpt": "All complaints shall be acknowledged within 24 hours and resolved within the applicable SLA tier deadline as per RBI IOS."},
]

MOCK_DRAFTS = {
    "UPI": "Dear {name}, We acknowledge your UPI payment complaint and sincerely regret the inconvenience. As per [RBI Payment System Circular PSS/2021/01, Section 4.2], failed UPI transactions are auto-reversed within T+1 working day. We are investigating transaction {ref} and will ensure a full refund is processed within 24 hours. Your complaint reference is {complaint_ref}. For real-time updates, please contact 1800-1234 (toll-free). Yours sincerely, ComplaintIQ Resolution Team.",
    "NACH": "Dear {name}, We sincerely regret the inconvenience caused by the NACH mandate bounce. As per our policy [NACH Operations Manual, Section 3.4], a mandate bounce due to bank error shall be reversed within 1 business day with penalty waiver. We have raised a Priority investigation (Ticket #INT-2026-{id}) and will resolve this within 24 hours as mandated by [RBI IOS Circular RBI/2023-24/117, Section 6.1]. Our team will contact you at your registered mobile within 2 hours. Yours sincerely, ComplaintIQ Resolution Team.",
    "CREDIT_CARD": "Dear {name}, We take card transaction disputes very seriously. As per [Credit Card Operations Manual, Section 8.1], disputed transactions are provisionally reversed within 48 hours while we investigate. We have raised a chargeback request and initiated a fraud review. Your card has been temporarily blocked for your safety — please visit your nearest branch to collect a replacement. Yours sincerely, ComplaintIQ Resolution Team.",
    "NRE": "Dear {name}, We acknowledge the delay in crediting your international remittance. As per [NRE Account Operations Policy, Section 4.1], remittances must be credited within 2 working days of receipt from the correspondent bank. We have escalated this to our International Banking desk and will resolve it within 24 hours. Yours sincerely, ComplaintIQ Resolution Team.",
    "DEFAULT": "Dear {name}, Thank you for bringing this to our attention. We have received your complaint (Reference: {complaint_ref}) and are investigating as a priority. As per our [General Complaints Resolution Policy, Section 2.1], we will resolve this within the applicable SLA timeline. Our team will contact you shortly. Yours sincerely, ComplaintIQ Resolution Team.",
}

COMPLIANCE_FLAGS = {
    "unauthorised_promise": ["guarantee", "100% refund", "immediately", "right now", "promise you"],
    "incorrect_rbi_timeline": ["48 hours" if "P1" else "", "rbi says 7 days"],
    "liability_admission": ["bank error", "our mistake", "we are responsible", "bank is at fault"],
    "pii_in_draft": [],  # checked dynamically
    "discriminatory_language": ["unfortunately you are", "based on your account type"],
}


def generate_draft(complaint_text: str, product_category: str, complaint_ref: str = "CIQ-2026-XXXXXX") -> dict:
    """
    TODO: Layer 5 — replace ChromaDB query with LangChain + ChromaDB semantic retrieval
    TODO: Layer 6 — replace mock with Ollama Llama 3.2 3B (zero-hallucination:
          LLM constrained to retrieved documents only)
    """
    # Step 1: Retrieve policy docs (Layer 5 — ChromaDB RAG mock)
    policy_sources = POLICY_LIBRARY.get(product_category, DEFAULT_POLICY)

    # Step 2: Generate draft (Layer 6 — Ollama mock)
    template = MOCK_DRAFTS.get(product_category, MOCK_DRAFTS["DEFAULT"])
    draft = template.format(
        name="Valued Customer",
        ref="your recent transaction",
        id="8821",
        complaint_ref=complaint_ref,
    )

    # Step 3: Run compliance check (Layer 7)
    compliance = compliance_check(draft)

    return {
        "draft_text":         draft,
        "policy_sources":     policy_sources,
        "compliance_flagged": compliance["compliance_flagged"],
        "flag_reason":        compliance["flag_reason"],
        "generated_at":       datetime.now(timezone.utc),
    }


def compliance_check(draft_text: str) -> dict:
    """
    TODO: Layer 7 — replace with DistilBERT binary compliance classifier (50ms inference)
    Flags: unauthorised_promise | incorrect_rbi_timeline | liability_admission |
           pii_in_draft | discriminatory_language

    Prototype: keyword scan for obviously problematic phrases
    """
    t = draft_text.lower()
    for flag_type, keywords in COMPLIANCE_FLAGS.items():
        for kw in keywords:
            if kw and kw in t:
                return {
                    "compliance_flagged": True,
                    "flag_reason": f"{flag_type.replace('_',' ').title()} detected — review before sending",
                }

    # Check for PII (account numbers, mobile numbers)
    import re
    if re.search(r"\b\d{10,16}\b", draft_text):
        return {
            "compliance_flagged": True,
            "flag_reason": "Possible PII (account/mobile number) detected in draft",
        }

    return {"compliance_flagged": False, "flag_reason": None}
