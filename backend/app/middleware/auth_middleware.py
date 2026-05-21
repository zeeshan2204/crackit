from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.token_service import verify_access

bearer = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer)
) -> dict:
    try:
        return verify_access(credentials.credentials)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")