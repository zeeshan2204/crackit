from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import bcrypt

from app.database import get_db
from app.models.models import User
from app.models.schemas import (
    RegisterRequest, LoginRequest,
    RefreshRequest, UserOut
)
from app.services.token_service import sign_access, sign_refresh, verify_refresh
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def make_tokens(user: User) -> dict:
    payload = {"id": user.id, "email": user.email}
    return {
        "access_token": sign_access(payload),
        "refresh_token": sign_refresh(payload)
    }

def safe_user(user: User) -> UserOut:
    return UserOut(id=user.id, name=user.name, email=user.email, avatar=user.avatar, theme=user.theme)


# ── Register ──────────────────────────────────────────────────
@router.post("/register")
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Email already in use")

    user = User(
        id=str(uuid.uuid4()),
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password)
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"user": safe_user(user), **make_tokens(user)}


# ── Login ─────────────────────────────────────────────────────
@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(401, "Invalid credentials")
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")

    return {"user": safe_user(user), **make_tokens(user)}


# ── Refresh token ─────────────────────────────────────────────
@router.post("/refresh")
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = verify_refresh(body.refresh_token)
    except Exception:
        raise HTTPException(401, "Invalid refresh token")

    result = await db.execute(select(User).where(User.id == payload["id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(401, "User not found")

    return {"access_token": sign_access({"id": user.id, "email": user.email})}


# ── Get current user ──────────────────────────────────────────
@router.get("/me")
async def get_me(db: AsyncSession = Depends(get_db),
                 current_user: dict = Depends(__import__("app.middleware.auth_middleware", fromlist=["get_current_user"]).get_current_user)):
    result = await db.execute(select(User).where(User.id == current_user["id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")
    return {"user": safe_user(user)}