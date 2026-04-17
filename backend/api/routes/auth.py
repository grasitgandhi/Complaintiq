# backend/api/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from database import get_db
from models.agent import Agent
import json
import base64

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email:    str
    password: str
    role:     str = None  # Optional: specify required role (agent/manager)


class LoginResponse(BaseModel):
    user_id: int
    name:    str
    email:   str
    role:    str        # agent, manager, or customer
    team:    str | None
    token:   str        # Enhanced JWT-like token with role embedded


class RegisterRequest(BaseModel):
    email:    str
    password: str
    name:     str
    role:     str       # Must be 'agent' or 'manager'


class RegisterResponse(BaseModel):
    user_id: int
    name:    str
    email:   str
    role:    str
    message: str


def _generate_token(user_id: int, role: str, name: str, email: str) -> str:
    """
    Generate an enhanced base64-encoded token with role information.
    Format: base64(json({user_id, role, name, email, timestamp}))
    
    In production, replace with proper JWT (PyJWT + HS256 signature).
    """
    import time
    payload = {
        "user_id": user_id,
        "role": role,
        "name": name,
        "email": email,
        "iat": int(time.time()),
    }
    token_json = json.dumps(payload)
    token_b64 = base64.b64encode(token_json.encode()).decode()
    return token_b64


def _decode_token(token: str) -> dict:
    """
    Decode the enhanced token back to a dictionary.
    In production, use PyJWT to verify signature.
    """
    try:
        token_json = base64.b64decode(token.encode()).decode()
        return json.loads(token_json)
    except Exception:
        return None


# ── POST /auth/login ──────────────────────────────────────────────────────────
@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user by email and password.
    Supports agent/manager and customer roles.
    
    Role Verification:
    - If password is correct but role doesn't match, return 403 Forbidden
    - If email not found, return 401 Unauthorized
    - If password incorrect, return 401 Unauthorized
    
    Case Insensitivity:
    - Email is normalized to lowercase in database query
    """
    # Normalize email to lowercase for case-insensitive matching
    email_lower = req.email.strip().lower()

    agent = db.query(Agent).filter(
        func.lower(Agent.email) == email_lower
    ).first()

    if not agent:
        demo_users = {
            "demo@customer.com": {"user_id": 9001, "name": "Demo Customer", "role": "customer", "team": None},
            "priya@sbibank.com": {"user_id": 9002, "name": "Priya Mehta", "role": "agent", "team": "Email Team"},
            "arjun@sbibank.com": {"user_id": 9004, "name": "Arjun Nair", "role": "agent", "team": "Phone Team"},
            "sunita@sbibank.com": {"user_id": 9003, "name": "Sunita Sharma", "role": "manager", "team": "Compliance"},
        }
        demo = demo_users.get(email_lower)

        # Demo login — only allow with demo password
        if demo and req.password == "demo123":
            if req.role and req.role != demo["role"]:
                raise HTTPException(status_code=403, detail="Insufficient Permissions")
            token = _generate_token(
                user_id=demo["user_id"],
                role=demo["role"],
                name=demo["name"],
                email=req.email
            )
            return LoginResponse(
                user_id=demo["user_id"],
                name=demo["name"],
                email=req.email,
                role=demo["role"],
                team=demo["team"],
                token=token,
            )

        # Email not found
        raise HTTPException(status_code=401, detail="Email not found")

    # ── Password verification ──
    # TODO: Replace plain-text comparison with bcrypt.checkpw() in production
    if agent.password_plain != req.password:
        raise HTTPException(status_code=401, detail="Invalid password")

    # ── Role verification ──
    role = {
        "AGENT":      "agent",
        "MANAGER":    "manager",
        "COMPLIANCE": "manager",
    }.get(agent.role.value, "agent")

    # If a specific role was required, verify the user has that role
    if req.role and req.role != role:
        raise HTTPException(
            status_code=403,
            detail=f"Insufficient Permissions: Expected role '{req.role}' but user has role '{role}'"
        )

    # Check if agent account is active
    if not agent.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    # ── Generate JWT token with role information ──
    token = _generate_token(
        user_id=agent.id,
        role=role,
        name=agent.name,
        email=agent.email
    )

    return LoginResponse(
        user_id=agent.id,
        name=agent.name,
        email=agent.email,
        role=role,
        team=agent.team,
        token=token,
    )


# ── POST /auth/register ──────────────────────────────────────────────────────
@router.post("/register", response_model=RegisterResponse, status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new agent/manager account.
    Email must be unique (case-insensitive).
    
    NOTE: This endpoint BYPASSES PII masking (no sensitive data masking needed here).
    """
    # Normalize email to lowercase
    email_lower = req.email.lower()

    # Check if email already exists (case-insensitive)
    existing = db.query(Agent).filter(
        Agent.email.ilike(email_lower)
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    # Validate role
    if req.role not in ["agent", "manager"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role. Must be 'agent' or 'manager'"
        )

    # Map role string to enum
    from models.agent import AgentRole
    role_enum = {
        "agent": AgentRole.AGENT,
        "manager": AgentRole.MANAGER,
    }.get(req.role, AgentRole.AGENT)

    # Create new agent account
    new_agent = Agent(
        name=req.name,
        email=email_lower,
        password_plain=req.password,  # TODO: Hash with bcrypt in production
        role=role_enum,
        is_active=True,
    )

    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)

    return RegisterResponse(
        user_id=new_agent.id,
        name=new_agent.name,
        email=new_agent.email,
        role=req.role,
        message=f"Agent account created successfully. Welcome, {new_agent.name}!",
    )


# ── GET /auth/me ──────────────────────────────────────────────────────────────
@router.get("/me")
def get_me(token: str):
    """
    Decode and return user info from token.
    
    The token contains embedded role information that allows the frontend
    to automatically redirect users to the correct dashboard.
    
    NOTE: This endpoint BYPASSES PII masking (no sensitive data masking needed).
    """
    decoded = _decode_token(token)

    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return {
        "user_id": decoded.get("user_id"),
        "role": decoded.get("role"),
        "name": decoded.get("name"),
        "email": decoded.get("email"),
    }


# ── POST /auth/verify-role ────────────────────────────────────────────────────
@router.post("/verify-role")
def verify_role(token: str, required_role: str):
    """
    Verify if a token has the required role.
    Useful for frontend route protection or API endpoint authorization.
    
    Returns:
    - 200 OK if role matches
    - 403 Forbidden if role doesn't match
    - 401 Unauthorized if token is invalid
    """
    decoded = _decode_token(token)

    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_role = decoded.get("role")

    if user_role != required_role:
        raise HTTPException(
            status_code=403,
            detail=f"Insufficient Permissions: Required role '{required_role}' but token has role '{user_role}'"
        )

    return {"status": "authorized", "role": user_role, "user_id": decoded.get("user_id")}
