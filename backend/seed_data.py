# backend/seed_data.py
"""
Section 5 — Mock Data and Database Seed
Idempotent: safe to run multiple times (truncates all tables, then re-inserts).
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta, timezone
from database import SessionLocal, engine, Base
from models.complaint import (
    Complaint, ComplaintEvent, ComplaintStatus, SLATier,
    SentimentLabel, ActorType, ProductCategory, PreferredLanguage,
)
from models.agent import Agent, AgentRole

Base.metadata.drop_all(bind=engine)   # drop old tables with wrong column types
Base.metadata.create_all(bind=engine)  # recreate with correct JSONB types

now = datetime.now(timezone.utc)
def dago(d): return now - timedelta(days=d)
def hago(h): return now - timedelta(hours=h)
def hahead(h): return now + timedelta(hours=h)
def bdahead(d): return now + timedelta(days=d * 1.4)  # approx business days


def seed():
    db = SessionLocal()
    print("🗑  Truncating tables…")
    db.query(ComplaintEvent).delete()
    db.query(Complaint).delete()
    db.query(Agent).delete()
    db.commit()

    # ── AGENTS ────────────────────────────────────────────────────────────────
    print("👤 Seeding agents…")
    agents = [
        Agent(name="Priya Mehta",   email="priya@sbibank.com",  password_plain="demo123", role=AgentRole.AGENT,   team="Email Team"),
        Agent(name="Arjun Nair",    email="arjun@sbibank.com",  password_plain="demo123", role=AgentRole.AGENT,   team="Phone Team"),
        Agent(name="Sunita Sharma", email="sunita@sbibank.com", password_plain="demo123", role=AgentRole.MANAGER, team="Compliance"),
    ]
    for a in agents:
        db.add(a)
    db.commit()
    priya  = db.query(Agent).filter_by(email="priya@sbibank.com").first()
    arjun  = db.query(Agent).filter_by(email="arjun@sbibank.com").first()
    print("✓ Agents seeded")

    # ── HELPER ────────────────────────────────────────────────────────────────
    def add_event(c_id, etype, desc, actor=ActorType.SYSTEM, at=None, actor_id=None):
        db.add(ComplaintEvent(
            complaint_id=c_id, event_type=etype, description=desc,
            actor_type=actor, actor_id=actor_id,
            created_at=at or now,
        ))

    # ── MANDATORY DEMO COMPLAINTS ─────────────────────────────────────────────
    print("📋 Seeding mandatory demo complaints (CIQ-2026-000001 to 000003)…")

    # Complaint 1 — UPI, P3, Rajesh S., In Progress
    c1 = Complaint(
        reference_number="CIQ-2026-000001",
        customer_account="XXXXXX4821", customer_name="Rajesh S.",
        customer_mobile="9876543210", customer_email="rajesh@email.com",
        preferred_language=PreferredLanguage.EN,
        product_category=ProductCategory.UPI,
        complaint_text="Mera UPI payment fail ho gaya lekin paisa account se deduct ho gaya. Transaction ID: UPI/2026/03/15/4821. Please help immediately.",
        incident_date="2026-03-15", filed_at=dago(2),
        status=ComplaintStatus.InProgress, assigned_agent_id=priya.id,
        sla_tier=SLATier.P3, sla_deadline=hahead(72),
        sla_breach_probability=0.18,
        ai_complaint_type="UPI Transaction Failure", ai_product_category="UPI",
        ai_severity="P3", ai_sentiment=SentimentLabel.NEUTRAL,
        ai_confidence_score=0.91, ai_trigger_phrases=[],
        escalation_threat_detected=False, compliance_flagged=False,
        is_duplicate=False,
        ai_draft_response="Dear Rajesh S., We acknowledge your UPI payment issue. As per [RBI Payment System Circular PSS/2021/01, Section 4.2], failed UPI transactions are auto-reversed within T+1 working day. We are investigating your transaction UPI/2026/03/15/4821. Your complaint is assigned P3 priority with resolution expected within 5 business days. Contact us at 1800-1234 for updates. Yours sincerely, ComplaintIQ Resolution Team.",
        ai_draft_policy_sources=[{"doc_name": "RBI Payment System Circular PSS/2021/01", "section": "Section 4.2", "excerpt": "Failed UPI transactions shall be auto-reversed within T+1 working day."}],
    )
    db.add(c1); db.flush()
    add_event(c1.id, "COMPLAINT_RECEIVED", "Complaint received and classified by AI pipeline (Layer 2–4)", at=dago(2))
    add_event(c1.id, "ASSIGNED", "Assigned to Priya Mehta, Email Team", at=dago(1.9))
    add_event(c1.id, "AGENT_NOTE", "Agent reviewed. Awaiting transaction trace from UPI team.", actor=ActorType.AGENT, actor_id=priya.id, at=dago(1))

    # Complaint 2 — NACH, P1, Meera P., Draft Ready (ESCALATION)
    c2 = Complaint(
        reference_number="CIQ-2026-000002",
        customer_account="XXXXXX9034", customer_name="Meera P.",
        customer_mobile="9823001234", customer_email="meera@email.com",
        preferred_language=PreferredLanguage.EN,
        product_category=ProductCategory.NACH,
        complaint_text="My NACH mandate for home loan EMI bounce hua hai. I will report to Banking Ombudsman if not resolved in 24 hours. This is completely unacceptable — 3rd time this month.",
        incident_date="2026-03-22", filed_at=hago(12),
        status=ComplaintStatus.DraftReady, assigned_agent_id=arjun.id,
        sla_tier=SLATier.P1, sla_deadline=hahead(18),
        sla_breach_probability=0.74,
        ai_complaint_type="NACH Mandate Bounce", ai_product_category="NACH",
        ai_severity="P1", ai_sentiment=SentimentLabel.FRUSTRATED,
        ai_confidence_score=0.96, ai_trigger_phrases=["Banking Ombudsman"],
        escalation_threat_detected=True, escalation_language="English",
        compliance_flagged=True,
        compliance_flag_reason="Draft references regulatory escalation — review required before sending",
        is_duplicate=False,
        ai_draft_response="Dear Ms. Meera P., We sincerely regret the inconvenience caused by the NACH mandate bounce on your home loan account. As per our policy [NACH Operations Manual, Section 3.4], a mandate bounce may occur due to insufficient funds or a bank-side processing error. We have raised a Priority 1 investigation (Ticket #INT-2026-8821) and will resolve this within 24 hours as mandated by [RBI IOS Circular RBI/2023-24/117, Section 6.1]. Our customer care team will contact you at your registered mobile number within 2 hours. For immediate assistance: 1800-1234 (toll-free). Yours sincerely, ComplaintIQ Resolution Team.",
        ai_draft_policy_sources=[
            {"doc_name": "NACH Operations Manual", "section": "Section 3.4", "excerpt": "Mandate bounce due to bank error shall be reversed within 1 business day with penalty waiver."},
            {"doc_name": "RBI IOS Circular RBI/2023-24/117", "section": "Section 6.1", "excerpt": "P1 complaints must be addressed within 24 calendar hours."},
        ],
    )
    db.add(c2); db.flush()
    add_event(c2.id, "COMPLAINT_RECEIVED", "Complaint received and classified by AI pipeline (Layer 2–4)", at=hago(12))
    add_event(c2.id, "ESCALATION_DETECTED", "Customer mentioned Banking Ombudsman — auto-upgraded to P1 (Indian Banking Ontology)", at=hago(11.9))
    add_event(c2.id, "ASSIGNED", "Assigned to Arjun Nair, Phone Team", at=hago(11.5))
    add_event(c2.id, "DRAFT_GENERATED", "AI draft generated (Llama 3.2 3B via Ollama — local)", at=hago(11))
    add_event(c2.id, "COMPLIANCE_FLAG", "Compliance check flagged: regulatory escalation language detected (Layer 7)", at=hago(10.9))

    # Complaint 3 — PMJDY, P4, Lakshmi D., New
    c3 = Complaint(
        reference_number="CIQ-2026-000003",
        customer_account="XXXXXX6612", customer_name="Lakshmi D.",
        customer_mobile="9444123456",
        preferred_language=PreferredLanguage.TA,
        product_category=ProductCategory.PMJDY,
        complaint_text="Account mein interest credit nahi hua for last month. PMJDY account holder. Please check and update my passbook balance.",
        incident_date="2026-03-01", filed_at=hago(4),
        status=ComplaintStatus.New,
        sla_tier=SLATier.P4, sla_deadline=bdahead(10),
        sla_breach_probability=0.05,
        ai_complaint_type="Interest Credit Discrepancy", ai_product_category="PMJDY",
        ai_severity="P4", ai_sentiment=SentimentLabel.NEUTRAL,
        ai_confidence_score=0.88, ai_trigger_phrases=[],
        escalation_threat_detected=False, compliance_flagged=False,
        is_duplicate=False,
    )
    db.add(c3); db.flush()
    add_event(c3.id, "COMPLAINT_RECEIVED", "Complaint received and classified by AI pipeline (Layer 2–4)", at=hago(4))
    db.commit()
    print("✓ Demo complaints seeded")

    # ── REMAINING 17 COMPLAINTS ───────────────────────────────────────────────
    print("📋 Seeding remaining 17 complaints…")

    BULK = [
        # 4 — UPI, Neutral, P3, InProgress, Vikram T.
        dict(ref="CIQ-2026-000004", acct="XXXXXX3301", name="Vikram T.", mob="9712345678",
             prod=ProductCategory.UPI, text="My UPI payment to electricity board failed but amount was deducted. Need reversal urgently.", lang=PreferredLanguage.EN,
             tier=SLATier.P3, status=ComplaintStatus.InProgress, sentiment=SentimentLabel.NEUTRAL,
             deadline=hahead(60), breach=0.22, agent=priya.id, esc=False, comp=False, dup=False),

        # 5 — NRE, Frustrated, P1, New, Debashish R.
        dict(ref="CIQ-2026-000005", acct="XXXXXX7741", name="Debashish R.", mob="9433112233",
             prod=ProductCategory.NRE, text="My remittance from UK has not been credited to my NRE account for 5 working days. Amount: GBP 2,000. RBI ko shikayat karunga agar aaj nahi hua.", lang=PreferredLanguage.BN,
             tier=SLATier.P1, status=ComplaintStatus.New, sentiment=SentimentLabel.FRUSTRATED,
             deadline=hahead(22), breach=0.62, agent=None, esc=True, comp=False, dup=False),

        # 6 — CREDIT_CARD, Frustrated, P2, DraftReady, Sneha P.
        dict(ref="CIQ-2026-000006", acct="XXXXXX8821", name="Sneha P.", mob="9881234567",
             prod=ProductCategory.CREDIT_CARD, text="Unauthorized transaction of ₹8,500 on my credit card from Amazon on 18 March. I did not make this purchase. Suspected fraud, please reverse immediately.", lang=PreferredLanguage.MR,
             tier=SLATier.P2, status=ComplaintStatus.DraftReady, sentiment=SentimentLabel.FRUSTRATED,
             deadline=hahead(30), breach=0.45, agent=arjun.id, esc=False, comp=False, dup=False),

        # 7 — NACH, Frustrated, P3, InProgress, Prashant D.
        dict(ref="CIQ-2026-000007", acct="XXXXXX2211", name="Prashant D.", mob="9765432100",
             prod=ProductCategory.NACH, text="My NACH mandate for SIP deduction has bounced again. 2nd time this month. Please investigate.", lang=PreferredLanguage.MR,
             tier=SLATier.P3, status=ComplaintStatus.InProgress, sentiment=SentimentLabel.FRUSTRATED,
             deadline=hahead(90), breach=0.25, agent=priya.id, esc=False, comp=False, dup=False),

        # 8 — SAVINGS, Neutral, P4, Resolved, Rupa B.
        dict(ref="CIQ-2026-000008", acct="XXXXXX4412", name="Rupa B.", mob="9836541230",
             prod=ProductCategory.SAVINGS, text="My passbook has not been updated for 2 months. Please update the entries for Jan and Feb 2026.", lang=PreferredLanguage.BN,
             tier=SLATier.P4, status=ComplaintStatus.Resolved, sentiment=SentimentLabel.NEUTRAL,
             deadline=dago(5), breach=0.0, agent=priya.id, esc=False, comp=False, dup=False),

        # 9 — HOME_LOAN, Very Frustrated, P1, DraftReady, Arumugam K.
        dict(ref="CIQ-2026-000009", acct="XXXXXX9921", name="Arumugam K.", mob="9444987654",
             prod=ProductCategory.HOME_LOAN, text="En home loan EMI deducted twice this month. Bank error. Consumer court ku poguren if not resolved. Total excess deduction: ₹24,000.", lang=PreferredLanguage.TA,
             tier=SLATier.P1, status=ComplaintStatus.DraftReady, sentiment=SentimentLabel.VERY_FRUSTRATED,
             deadline=hahead(10), breach=0.81, agent=arjun.id, esc=True, comp=True, dup=False),

        # 10 — UPI, Neutral, P3, New, Kavitha S.
        dict(ref="CIQ-2026-000010", acct="XXXXXX1122", name="Kavitha S.", mob="9790123456",
             prod=ProductCategory.UPI, text="UPI payment to merchant failed but money deducted. Merchant says not received. Transaction ID: UPI/2026/03/20/9021.", lang=PreferredLanguage.TA,
             tier=SLATier.P3, status=ComplaintStatus.New, sentiment=SentimentLabel.NEUTRAL,
             deadline=hahead(96), breach=0.10, agent=None, esc=False, comp=False, dup=False),

        # 11 — FD, Neutral, P4, Resolved, Sunita M.
        dict(ref="CIQ-2026-000011", acct="XXXXXX3344", name="Sunita M.", mob="9821456789",
             prod=ProductCategory.FD, text="My Fixed Deposit matured on 10 March but renewal was not done as per standing instructions. Please check.", lang=PreferredLanguage.EN,
             tier=SLATier.P4, status=ComplaintStatus.Resolved, sentiment=SentimentLabel.NEUTRAL,
             deadline=dago(8), breach=0.0, agent=priya.id, esc=False, comp=False, dup=False),

        # 12 — NET_BANKING, Neutral, P3, InProgress, Meera K. (duplicate of #3 — different customer)
        dict(ref="CIQ-2026-000012", acct="XXXXXX5566", name="Meera K.", mob="9845678901",
             prod=ProductCategory.NET_BANKING, text="I am unable to login to net banking since 3 days. Password reset option not working. Please resolve urgently.", lang=PreferredLanguage.EN,
             tier=SLATier.P3, status=ComplaintStatus.InProgress, sentiment=SentimentLabel.NEUTRAL,
             deadline=hahead(48), breach=0.30, agent=arjun.id, esc=False, comp=False, dup=False),

        # 13 — UPI, Satisfied, P4, Resolved, Rajesh K.
        dict(ref="CIQ-2026-000013", acct="XXXXXX7788", name="Rajesh K.", mob="9867890123",
             prod=ProductCategory.UPI, text="UPI payment failed but amount was reversed automatically. Just wanted to confirm the reversal is complete. Thank you for the quick resolution.", lang=PreferredLanguage.EN,
             tier=SLATier.P4, status=ComplaintStatus.Resolved, sentiment=SentimentLabel.SATISFIED,
             deadline=dago(2), breach=0.0, agent=priya.id, esc=False, comp=False, dup=False),

        # 14 — NACH, Frustrated, P2, InProgress, Senthil A.
        dict(ref="CIQ-2026-000014", acct="XXXXXX9900", name="Senthil A.", mob="9444000123",
             prod=ProductCategory.NACH, text="My car loan EMI mandate bounced. Bank is charging penalty unfairly. This is 2nd bounce due to bank processing error. Need immediate resolution.", lang=PreferredLanguage.TA,
             tier=SLATier.P2, status=ComplaintStatus.InProgress, sentiment=SentimentLabel.FRUSTRATED,
             deadline=hahead(36), breach=0.48, agent=arjun.id, esc=False, comp=False, dup=False),

        # 15 — SAVINGS, Neutral, P3, Resolved, Lakshmi P.
        dict(ref="CIQ-2026-000015", acct="XXXXXX1234", name="Lakshmi P.", mob="9791234567",
             prod=ProductCategory.SAVINGS, text="My savings account interest for February was not credited on time. It was credited 3 days late. Requesting clarification.", lang=PreferredLanguage.EN,
             tier=SLATier.P3, status=ComplaintStatus.Resolved, sentiment=SentimentLabel.NEUTRAL,
             deadline=dago(6), breach=0.0, agent=priya.id, esc=False, comp=False, dup=False),

        # 16 — UPI, Neutral, P3, New, Vikram N.
        dict(ref="CIQ-2026-000016", acct="XXXXXX5678", name="Vikram N.", mob="9712005678",
             prod=ProductCategory.UPI, text="UPI pe bheja payment pending tha aur 3 din baad bhi na merchant ko mila na mujhe wapas aaya. Kripya check karein.", lang=PreferredLanguage.HI,
             tier=SLATier.P3, status=ComplaintStatus.New, sentiment=SentimentLabel.NEUTRAL,
             deadline=hahead(84), breach=0.08, agent=None, esc=False, comp=False, dup=False),

        # 17 — CREDIT_CARD, Satisfied, P4, Resolved, Debashish M.
        dict(ref="CIQ-2026-000017", acct="XXXXXX8765", name="Debashish M.", mob="9433998877",
             prod=ProductCategory.CREDIT_CARD, text="My credit card bill was double charged last month. The duplicate charge has now been reversed. Just confirming resolution. Good service.", lang=PreferredLanguage.EN,
             tier=SLATier.P4, status=ComplaintStatus.Resolved, sentiment=SentimentLabel.SATISFIED,
             deadline=dago(3), breach=0.0, agent=arjun.id, esc=False, comp=False, dup=False),

        # 18 — NRE, Frustrated, P2, InProgress, Rupa S.
        dict(ref="CIQ-2026-000018", acct="XXXXXX3322", name="Rupa S.", mob="9836001122",
             prod=ProductCategory.NRE, text="International wire transfer from USA not credited. 4 working days passed. USD 3,500 pending. Urgent resolution needed.", lang=PreferredLanguage.EN,
             tier=SLATier.P2, status=ComplaintStatus.InProgress, sentiment=SentimentLabel.FRUSTRATED,
             deadline=hahead(24), breach=0.55, agent=priya.id, esc=False, comp=False, dup=False),

        # 19 — HOME_LOAN, Neutral, P3, AwaitingCustomer, Prashant K.
        dict(ref="CIQ-2026-000019", acct="XXXXXX6611", name="Prashant K.", mob="9765000099",
             prod=ProductCategory.HOME_LOAN, text="Home loan statement shows incorrect principal outstanding. Please send corrected statement for tax filing.", lang=PreferredLanguage.MR,
             tier=SLATier.P3, status=ComplaintStatus.AwaitingCustomer, sentiment=SentimentLabel.NEUTRAL,
             deadline=hahead(72), breach=0.15, agent=arjun.id, esc=False, comp=False, dup=False),

        # 20 — PMJDY, Neutral, P4, Resolved, Kavitha D.
        dict(ref="CIQ-2026-000020", acct="XXXXXX4433", name="Kavitha D.", mob="9790456789",
             prod=ProductCategory.PMJDY, text="En PMJDY account la overdraft facility activate aagalai. Branch ku pona solvanga online apply nu. Online la error varuthu.", lang=PreferredLanguage.TA,
             tier=SLATier.P4, status=ComplaintStatus.Resolved, sentiment=SentimentLabel.NEUTRAL,
             deadline=dago(4), breach=0.0, agent=priya.id, esc=False, comp=False, dup=False),
    ]

    for b in BULK:
        c = Complaint(
            reference_number          = b["ref"],
            customer_account          = b["acct"],
            customer_name             = b["name"],
            customer_mobile           = b["mob"],
            preferred_language        = b["lang"],
            product_category          = b["prod"],
            complaint_text            = b["text"],
            incident_date             = "2026-03-20",
            filed_at                  = dago(1),
            status                    = b["status"],
            assigned_agent_id         = b.get("agent"),
            sla_tier                  = b["tier"],
            sla_deadline              = b["deadline"],
            sla_breach_probability    = b["breach"],
            ai_sentiment              = b["sentiment"],
            ai_confidence_score       = 0.90,
            ai_trigger_phrases        = [],  # always a list, never a string
            escalation_threat_detected= b["esc"],
            compliance_flagged        = b["comp"],
            is_duplicate              = b["dup"],
        )
        db.add(c)
        db.flush()
        add_event(c.id, "COMPLAINT_RECEIVED", "Complaint received and classified by AI pipeline", at=dago(1))
        if c.status == ComplaintStatus.Resolved:
            c.resolved_at = dago(0.2)
            add_event(c.id, "RESOLVED", "Complaint resolved and response sent (HITL sign-off)", actor=ActorType.AGENT, at=dago(0.2))

    db.commit()
    print(f"✓ {len(BULK)} additional complaints seeded")

    print("\n✓ Seed complete.")
    print("Demo logins: priya@sbibank.com | arjun@sbibank.com | sunita@sbibank.com (all: demo123)")
    print("Customer demo: demo@customer.com (any password)")
    db.close()


if __name__ == "__main__":
    seed()