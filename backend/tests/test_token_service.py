import pytest
from jose import JWTError
from app.services.token_service import sign_access, verify_access, sign_refresh, verify_refresh


def test_access_token_roundtrip():
    payload = {"user_id": "abc-123", "email": "test@example.com"}
    token = sign_access(payload)
    decoded = verify_access(token)
    assert decoded["user_id"] == "abc-123"
    assert decoded["email"] == "test@example.com"


def test_refresh_token_roundtrip():
    payload = {"user_id": "xyz-456"}
    token = sign_refresh(payload)
    decoded = verify_refresh(token)
    assert decoded["user_id"] == "xyz-456"


def test_invalid_access_token_raises():
    with pytest.raises(JWTError):
        verify_access("this.is.not.a.valid.token")


def test_refresh_token_not_valid_as_access_token():
    payload = {"user_id": "abc-123"}
    refresh_token = sign_refresh(payload)
    with pytest.raises(JWTError):
        verify_access(refresh_token)
