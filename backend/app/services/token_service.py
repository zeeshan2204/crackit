from datetime import datetime, timedelta
from jose import jwt
from app.config import settings

ALGORITHM = "HS256"

def sign_access(payload: dict) -> str:
    data = payload.copy()
    data["exp"] = datetime.utcnow() + timedelta(minutes=15)
    return jwt.encode(data, settings.JWT_SECRET, algorithm=ALGORITHM)

def sign_refresh(payload: dict) -> str:
    data = payload.copy()
    data["exp"] = datetime.utcnow() + timedelta(days=7)
    return jwt.encode(data, settings.JWT_REFRESH_SECRET, algorithm=ALGORITHM)

def verify_access(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])

def verify_refresh(token: str) -> dict:
    return jwt.decode(token, settings.JWT_REFRESH_SECRET, algorithms=[ALGORITHM])