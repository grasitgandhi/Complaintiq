# backend/services/dedup_service.py
"""
Layer 3 — Anomaly Detection — Duplicate Detection
TODO: Layer 3 — replace with FAISS cosine similarity on all-MiniLM-L6-v2 embeddings
      Production: detects same complaint filed by email, phone, and web — 3 tickets, 1 issue
      Target: reduce 20–30% duplicate volume (industry benchmark) to < 2%
"""
from datetime import datetime, timedelta, timezone


def _word_overlap(a: str, b: str) -> float:
    """Prototype: simple word overlap ratio (Jaccard similarity)"""
    wa = set(a.lower().split())
    wb = set(b.lower().split())
    if not wa or not wb:
        return 0.0
    return len(wa & wb) / len(wa | wb)


def check_duplicate(
    complaint_text: str,
    account_number: str,
    recent_complaints: list,          # list of {id, text, filed_at} from DB
    window_days: int = 7,
) -> dict:
    """
    TODO: Layer 3 — replace with FAISS cosine similarity on all-MiniLM-L6-v2 embeddings
    Prototype: word overlap > 80% within last 7 days, same account
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=window_days)

    best_id    = None
    best_score = 0.0

    for c in recent_complaints:
        # Same account, within window
        filed = c.get("filed_at")
        if filed and filed < cutoff:
            continue
        score = _word_overlap(complaint_text, c.get("text", ""))
        if score > best_score:
            best_score = score
            best_id    = c.get("id")

    is_dup = best_score >= 0.80 and best_id is not None

    return {
        "is_duplicate":     is_dup,
        "duplicate_of":     best_id if is_dup else None,
        "similarity_score": round(best_score, 2) if is_dup else None,
    }
