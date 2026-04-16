# ComplaintIQ — Unified AI Complaint Dashboard for Indian Banking

**Team Hack-it-Out · SPIT Mumbai · PSBs Hackathon 2026**  
Members: Yash Khetan, Rishikesh Bhatt, Chinmay Tawade, Ridhima Srivastava, Shravani Harel

---

## What is ComplaintIQ?

ComplaintIQ is a 10-layer governed AI pipeline for Indian banking complaint management. It enforces RBI Integrated Ombudsman Scheme (IOS) SLA tiers (P1–P4), detects escalation threats across 6 Indian languages, generates RAG-grounded response drafts via Ollama, and auto-generates the mandatory RBI monthly compliance report — reducing 40–60 staff hours/month to under 2 minutes.

**Architecture principle — Deterministic–Generative Bifurcation:**
> XGBoost handles classification. LLM handles narration. Never mixed.

---

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 14+
- Ollama → `ollama pull llama3.2` (requires 8 GB RAM minimum)
- Git
- Redis (optional — for Celery async tasks)

---

## Install Steps

### 1. Clone the repo

```bash
git clone https://github.com/your-team/complaintiq.git
cd complaintiq
```

### 2. PostgreSQL setup

```bash
psql -U postgres
CREATE DATABASE complaintiq_db;
\q
```

### 3. Ollama setup

```bash
ollama list                # verify llama3.2 is present
ollama pull llama3.2       # if not (requires ~4 GB download, 8 GB RAM)
```

### 4. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env — fill in DB_USER, DB_PASSWORD, DB_NAME
pip install -r requirements.txt
python seed_data.py        # seeds 20 complaints + 3 agents
uvicorn main:app --reload  # API on http://localhost:8000
```

### 5. Frontend setup

```bash
cd frontend
npm install
npm start                  # UI on http://localhost:3000
```

---

## How to Run

| Service    | Command                          | Port  |
|------------|----------------------------------|-------|
| Backend    | `uvicorn main:app --reload`      | 8000  |
| Frontend   | `npm start`                      | 3000  |
| API Docs   | visit http://localhost:8000/docs | 8000  |

---

## How to Seed Data

```bash
cd backend
python seed_data.py
```

Output:
```
✓ Agents seeded
✓ Demo complaints seeded
✓ 17 additional complaints seeded
✓ Seed complete.
Demo logins: priya@sbibank.com | arjun@sbibank.com | sunita@sbibank.com (all: demo123)
Customer demo: demo@customer.com (any password)
```

---

## Demo Credentials

| Role               | Email                   | Password  | Redirects to         |
|--------------------|-------------------------|-----------|----------------------|
| Customer           | demo@customer.com       | demo123   | /customer/track      |
| Bank Agent         | priya@sbibank.com       | demo123   | /agent/queue         |
| Compliance Manager | sunita@sbibank.com      | demo123   | /manager/overview    |

All users share one login page at `/login`.  
Click any **"Login as…"** demo button to pre-fill credentials.

---

## 10-Layer Pipeline

| Layer | Name                   | Technology (Prototype)         | Production Target              |
|-------|------------------------|-------------------------------|-------------------------------|
| 0     | External context       | RBI bulletin ingestion mock   | Scheduled crawler + ChromaDB  |
| 1     | Data intake            | FastAPI + Pydantic v2         | FastAPI + Celery               |
| 2     | NLP Classification     | Rule-based mock               | DistilBERT 4-head fine-tuned  |
| 3     | Anomaly Detection      | Keyword overlap mock          | FAISS + all-MiniLM-L6-v2     |
| 4     | Risk Attribution       | Rule-based scoring mock       | XGBoost (breach probability)  |
| 5     | Context Assembly       | Policy library mock           | ChromaDB + LangChain RAG      |
| 6     | LLM Reasoning          | Template mock                 | Ollama Llama 3.2 3B (local)   |
| 7     | Compliance Checker     | Keyword scan mock             | DistilBERT binary classifier  |
| 8     | HITL                   | Agent approval UI             | Same — mandatory by design    |
| 9     | Governance             | Audit trail + RBI report      | Same — auto-generated         |

---

## Key Technologies

| Layer        | Technology                                              |
|--------------|---------------------------------------------------------|
| Frontend     | React 18 + React Router v6 + Tailwind CSS + Recharts   |
| Backend      | FastAPI (Python 3.10+) + SQLAlchemy + PostgreSQL        |
| NLP          | DistilBERT 4-head (mock) · FinBERT sentiment (mock)    |
| Dedup        | FAISS cosine similarity on all-MiniLM-L6-v2 (mock)    |
| SLA Predictor| XGBoost breach probability (mock)                      |
| RAG          | LangChain + ChromaDB + all-MiniLM-L6-v2 (mock)        |
| LLM          | Ollama Llama 3.2 3B — narration only, never classifies |
| Compliance   | DistilBERT binary classifier (mock)                    |

---

## Regulatory Compliance

- **RBI IOS** — P1=24hr, P2=48hr, P3=5bd, P4=10bd (Circular RBI/2023-24/117)
- **DPDPA** — all models run on-premise via Ollama; zero customer data leaves the bank's infrastructure
- **Trilingual directive** — complaint intake supports EN, HI, TA, MR, BN, GU
- **Indian Banking Ontology** — 200+ product terms and escalation phrases across 6 languages

---

## Project Structure

```
complaintiq/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── customer/       NewComplaint · TrackComplaint · ComplaintDetail · SuccessScreen
│   │   │   ├── agent/          AgentQueue · ComplaintWorkView
│   │   │   └── manager/        ManagerOverview · SLAMonitor · RBIReports · AgentPerformance
│   │   ├── components/
│   │   │   ├── shared/         Header · ProtectedRoute · NotificationBell · Charts · ConfirmModal
│   │   │   ├── customer/       StepProgressBar · StatusStepper · SLACountdown · ComplaintTimeline · FileUploadArea · StarRating
│   │   │   ├── agent/          SidebarNav · ComplaintCard · ClassificationPanel · AIDraftEditor · ContextPanel · InternalNotes · ConfirmSendModal · LoadingSkeleton
│   │   │   └── manager/        StatCard · SLATable
│   │   ├── context/            AuthContext.jsx
│   │   ├── constants/          index.js
│   │   ├── utils/              index.js
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
├── backend/
│   ├── api/routes/             complaints.py · analytics.py · auth.py
│   ├── models/                 complaint.py · agent.py
│   ├── schemas/                complaint_schemas.py · analytics_schemas.py
│   ├── services/               nlp_service.py · sla_service.py · dedup_service.py · rag_service.py
│   ├── main.py
│   ├── database.py
│   ├── seed_data.py
│   └── requirements.txt
├── ml_models/
│   ├── distilbert_classifier/  (fine-tuned weights go here)
│   └── chromadb_store/         (policy document vectors go here)
└── README.md
```

---

## Hackathon Demo Script

### Part 1 — Customer View (2 min)
1. `/login` → click **"Login as Customer"** → Login
2. Navigate to **Track Complaint** → see only your complaints
3. Open `CIQ-2026-000002` → point to: P1 badge, red SLA countdown, escalation timeline event

### Part 2 — Agent View (3 min)
1. Logout → **"Login as Bank Agent"** → Login → `/agent/queue`
2. Point to red **⚠ ESCALATION RISK** badge on `CIQ-2026-000002`
3. Open the complaint → 3-column layout
4. Centre column: subheader "Model: Llama 3.2 3B (Ollama — local)", yellow compliance flag
5. Classification panel: "4-head multi-label — XGBoost + DistilBERT — not the LLM"
6. "Why this classification?" → highlighted phrase: **Banking Ombudsman**
7. Policy tab → "These are the exact sections the LLM was given"
8. Click **Approve and Send Response** → HITL confirmation modal → **Confirm and Send**

### Part 3 — Manager View (2 min)
1. Logout → **"Login as Compliance Manager"** → Login → `/manager/overview`
2. Point to **AI Automation Rate** stat card: "NatWest achieved 49% no-edit rate"
3. SLA Monitor → **Breach Probability** column: "XGBoost prediction — target: < 3%"
4. RBI Reports → **Generate Report** → "40–60 staff hours → under 2 minutes"

---

## Judge Q&A — Quick Defence

| Question | Answer |
|----------|--------|
| "Zero hallucinations?" | Architectural constraint: LLM only uses ChromaDB-retrieved policy docs. Post-generation DistilBERT compliance check before agent sees draft. |
| "Why not Zendesk?" | No RBI IOS SLA concept, no Indian banking ontology, US-hosted → DPDPA non-compliant for PSBs. |
| "Where does ₹14.4 crore saving come from?" | Freshworks/NatWest benchmark: 49% automation at 50,000 complaints/month at ₹300/hr agent cost. A projection — we can show the arithmetic. |
| "Free tools won't scale." | Groq is demo-only. Production: Ollama on bank's own GPU, or enterprise cloud LLM with DPA. Free tools prove the architecture. |
| "Why trust a student team?" | HITL is mandatory — every response requires human sign-off. Bank's liability posture doesn't change. |
