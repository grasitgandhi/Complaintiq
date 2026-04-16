# backend/api/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.agent import Agent

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email:    str
    password: str


class LoginResponse(BaseModel):
    user_id: int
    name:    str
    email:   str
    role:    str
    team:    str | None
    token:   str


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.email == req.email).first()

    if not agent:
        # Customer login — demo@customer.com with any password
        if req.email == "demo@customer.com":
            return LoginResponse(
                user_id=9001, name="Demo Customer", email=req.email,
                role="customer", team=None, token="mock-token-customer",
            )
        raise HTTPException(status_code=401, detail="Email not found")

    # TODO: replace plain-text comparison with bcrypt in production
    if agent.password_plain != req.password:
        raise HTTPException(status_code=401, detail="Invalid password")

    role = {
        "AGENT":      "agent",
        "MANAGER":    "manager",
        "COMPLIANCE": "manager",
    }.get(agent.role.value, "agent")

    return LoginResponse(
        user_id=agent.id,
        name=agent.name,
        email=agent.email,
        role=role,
        team=agent.team,
        token=f"mock-token-{role}-{agent.id}",
    )


@router.get("/me")
def get_me(token: str):
    """Return user info from token (mock)"""
    if "manager" in token:
        return {"role": "manager", "name": "Sunita Sharma"}
    if "agent" in token:
        return {"role": "agent", "name": "Priya Mehta"}
    return {"role": "customer", "name": "Demo Customer"}
