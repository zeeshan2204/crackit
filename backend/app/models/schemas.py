from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# ── Auth ──────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    credential: str

class RefreshRequest(BaseModel):
    refresh_token: str

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    theme: str

class AuthResponse(BaseModel):
    user: UserOut
    access_token: str
    refresh_token: str

# ── Problems ──────────────────────────────────────────────────
class ProblemOut(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    topic: str
    examples: list
    constraints: list
    starter_code: dict

# ── Submissions ───────────────────────────────────────────────
class SubmitRequest(BaseModel):
    problem_id: int
    code: str
    language: str
    time_taken: int = 0

class FeedbackOut(BaseModel):
    correctness: int
    efficiency: int
    readability: int
    edge_cases: int
    overall: int
    summary: str
    strengths: list
    improvements: list
    ai_comment: str

# ── AI Chat ───────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    context: str

class ChatResponse(BaseModel):
    reply: str

# ── Analytics ─────────────────────────────────────────────────
class TopicStat(BaseModel):
    topic: str
    count: int
    avg: int

class ScorePoint(BaseModel):
    date: str
    score: int
    title: str

class StatsOut(BaseModel):
    total: int
    avg_score: int
    by_topic: list[TopicStat]
    score_over_time: list[ScorePoint]