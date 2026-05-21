import pytest
from pydantic import ValidationError
from app.models.schemas import ChatRequest, ChatMessage, ChatResponse, RegisterRequest


def test_chat_request_valid():
    req = ChatRequest(
        messages=[ChatMessage(role="user", content="What is a hash map?")],
        context="solving Two Sum problem"
    )
    assert len(req.messages) == 1
    assert req.messages[0].role == "user"
    assert req.context == "solving Two Sum problem"


def test_chat_request_empty_messages():
    req = ChatRequest(messages=[], context="test")
    assert req.messages == []


def test_chat_response():
    resp = ChatResponse(reply="Great approach! Consider edge cases.")
    assert resp.reply == "Great approach! Consider edge cases."


def test_register_request_invalid_email():
    with pytest.raises(ValidationError):
        RegisterRequest(name="Alice", email="not-an-email", password="secret123")


def test_register_request_valid():
    req = RegisterRequest(name="Alice", email="alice@example.com", password="secret123")
    assert req.name == "Alice"
    assert req.email == "alice@example.com"
