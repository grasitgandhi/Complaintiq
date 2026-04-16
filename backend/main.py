# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from database import engine, Base
import models.complaint  # noqa: F401 — register models
import models.agent      # noqa: F401

from api.routes.complaints import router as complaints_router
from api.routes.analytics  import router as analytics_router, report_router
from api.routes.auth       import router as auth_router

# Create all tables on startup (dev mode — use Alembic for production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title       = "ComplaintIQ API",
    description = "Unified AI Complaint Dashboard for Indian Banking — 10-Layer Governed AI Pipeline",
    version     = "1.0.0",
    docs_url    = "/docs",
    redoc_url   = "/redoc",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins     = [os.getenv("FRONTEND_URL", "http://localhost:3000"), "http://localhost:3000"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(complaints_router)
app.include_router(analytics_router)
app.include_router(report_router)


@app.get("/", tags=["health"])
def health():
    return {
        "status":  "ok",
        "service": "ComplaintIQ API",
        "version": "1.0.0",
        "architecture": "Deterministic–Generative Bifurcation: XGBoost→classification, Ollama→narration",
    }
