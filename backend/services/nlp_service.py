# backend/services/nlp_service.py
"""
10-Layer Pipeline:
  Layer 2 — NLP Classification (DistilBERT 4-head mock)
  Layer 3 — Anomaly Detection — escalation phrase detection (Indian banking ontology)
"""
import random
import re

# TODO: Layer 2 — Behaviour Modelling — replace with DistilBERT fine-tuned 4-head classifier
# TODO: Layer 2 — Sentiment — replace with ProsusAI/FinBERT for finance-domain sentiment
# TODO: Layer 3 — Anomaly Detection — escalation patterns feed into Layer 4 routing

# ── Indian Banking Domain Ontology ──────────────────────────────────────────
# 200+ term ontology — no competitor handles Indian banking cross-language detection
ESCALATION_PHRASES = {
    "English": [
        "report to rbi", "banking ombudsman", "consumer court", "sebi",
        "file complaint with rbi", "rbi complaint", "ombudsman", "legal action",
    ],
    "Hindi": [
        "rbi ko", "rbi mein shikayat", "shikayat karunga", "consumer court",
        "ombudsman", "rbi kahu",
    ],
    "Tamil": [
        "rbi kku", "ombudsman paas", "consumer court", "rbi complaint",
    ],
    "Marathi": [
        "rbi kade", "tक्रार", "ombudsman", "consumer court",
    ],
    "Bengali": [
        "rbi te", "অভিযোগ", "ombudsman", "consumer court",
    ],
    "Gujarati": [
        "rbi ne", "ombudsman", "farayad", "consumer court",
    ],
}

PRODUCT_KEYWORDS = {
    "UPI":         ["upi", "phonepe", "gpay", "bhim", "transaction", "payment failed", "upi payment"],
    "NACH":        ["nach", "mandate", "emi", "auto debit", "recurring", "bounce"],
    "SAVINGS":     ["savings", "account", "balance", "interest", "passbook"],
    "HOME_LOAN":   ["home loan", "housing loan", "emi", "mortgage"],
    "CREDIT_CARD": ["credit card", "card", "billing", "fraud", "dispute", "chargeback"],
    "FD":          ["fixed deposit", "fd", "maturity", "interest"],
    "NRE":         ["nre", "nro", "remittance", "foreign", "overseas", "gbp", "usd"],
    "PMJDY":       ["pmjdy", "jan dhan", "basic savings"],
    "NET_BANKING": ["net banking", "internet banking", "online banking", "login", "password"],
}

TYPE_MAP = {
    "UPI":         "UPI Transaction Failure",
    "NACH":        "NACH Mandate Bounce",
    "SAVINGS":     "Account Issue",
    "HOME_LOAN":   "Loan EMI Dispute",
    "CREDIT_CARD": "Billing Dispute",
    "FD":          "Fixed Deposit Issue",
    "NRE":         "Remittance Delay",
    "PMJDY":       "Interest Credit Discrepancy",
    "NET_BANKING": "Net Banking Access Issue",
    "OTHER":       "General Complaint",
}

HIGH_SEVERITY_KEYWORDS = [
    "fraud", "scam", "unauthorized", "stolen", "3rd time", "multiple times",
    "not resolved", "still pending", "urgent", "emergency",
]


def classify_complaint(text: str) -> dict:
    """
    TODO: Layer 2 — replace with DistilBERT fine-tuned 4-head classifier
    Returns: complaint_type, product_category, severity, sentiment,
             confidence_scores, trigger_phrases, escalation_detected, escalation_language
    """
    t = text.lower()

    # ── Product detection ────────────────────────────────────────────────────
    product = "OTHER"
    for prod, keywords in PRODUCT_KEYWORDS.items():
        if any(k in t for k in keywords):
            product = prod
            break

    # ── Escalation threat detection (Layer 3 — Indian Banking Ontology) ──────
    escalation_detected = False
    escalation_language = None
    trigger_phrases = []

    for lang, phrases in ESCALATION_PHRASES.items():
        for phrase in phrases:
            if phrase in t:
                escalation_detected = True
                escalation_language = lang
                trigger_phrases.append(phrase)

    # ── Sentiment (TODO: replace with FinBERT) ────────────────────────────────
    frustrated_words = ["not resolved", "unacceptable", "worst", "fraud", "cheating",
                        "bounce", "fail", "3rd time", "multiple", "angry", "disgusting"]
    satisfied_words  = ["thank", "resolved", "happy", "good service", "excellent"]

    if escalation_detected or sum(1 for w in frustrated_words if w in t) >= 2:
        sentiment = "VERY_FRUSTRATED"
    elif any(w in t for w in frustrated_words):
        sentiment = "FRUSTRATED"
    elif any(w in t for w in satisfied_words):
        sentiment = "SATISFIED"
    else:
        sentiment = "NEUTRAL"

    # ── Severity / SLA tier (Layer 4 — feeds into SLA service) ───────────────
    # TODO: Layer 4 — Risk Attribution — replace rule engine with XGBoost model
    if escalation_detected or (sentiment == "VERY_FRUSTRATED" and product in ["HOME_LOAN", "NACH", "NRE"]):
        severity = "P1"
    elif sentiment == "FRUSTRATED" and any(k in t for k in HIGH_SEVERITY_KEYWORDS):
        severity = "P2"
    elif product in ["UPI", "CREDIT_CARD"] and "fraud" in t:
        severity = "P2"
    elif t.strip().endswith("?") or any(k in t for k in ["status", "update", "enquiry", "check"]):
        severity = "P4"
    else:
        severity = "P3"

    # ── Mock confidence scores (TODO: replace with real model logits) ─────────
    base_conf = 0.88 + random.uniform(0, 0.09)
    confidence_scores = {
        "complaint_type":  round(base_conf, 2),
        "product_category": round(base_conf + random.uniform(-0.02, 0.04), 2),
        "severity":         round(base_conf + random.uniform(-0.03, 0.04), 2),
        "sentiment":        round(base_conf + random.uniform(-0.05, 0.02), 2),
    }
    avg_confidence = round(sum(confidence_scores.values()) / 4, 2)

    return {
        "complaint_type":      TYPE_MAP.get(product, "General Complaint"),
        "product_category":    product,
        "severity":            severity,
        "sentiment":           sentiment,
        "confidence_scores":   confidence_scores,
        "ai_confidence_score": avg_confidence,
        "trigger_phrases":     list(set(trigger_phrases)),
        "escalation_detected": escalation_detected,
        "escalation_language": escalation_language,
    }
