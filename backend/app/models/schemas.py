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

# ── Exam ──────────────────────────────────────────────────────
class ExamQuestionOut(BaseModel):
    id: int
    section: str
    topic: str
    question_text: str
    options: list[str]
    difficulty: str
    time_limit: int

class ExamQuestionWithAnswer(ExamQuestionOut):
    correct_answer: str
    explanation: str

class ExamStartResponse(BaseModel):
    session_id: str
    start_time: str

class AnswerSubmit(BaseModel):
    question_id: int
    user_answer: Optional[str] = None   # None = skipped
    time_spent: int = 0

class SectionSubmit(BaseModel):
    session_id: str
    section: str
    answers: list[AnswerSubmit]
    time_taken: int = 0
    score: Optional[int] = None        # frontend-calculated score (used for local question bank)
    correct: Optional[int] = None
    total: Optional[int] = None

class SectionResult(BaseModel):
    section: str
    total: int
    correct: int
    score: int                          # percentage 0-100
    time_taken: int

class ExamResultOut(BaseModel):
    session_id: str
    completed: bool
    scores: dict
    time_taken: dict
    sections: list[SectionResult]
    total_score: int
    percentile: float
    passed: bool

class LeaderboardEntry(BaseModel):
    rank: int
    name: str
    total_score: int
    verbal: int
    reasoning: int
    aptitude: int
    date: str

class HistoryEntry(BaseModel):
    session_id: str
    date: str
    attempt: int
    total_score: int
    numerical: int = 0
    verbal: int = 0
    reasoning: int = 0
    coding: int = 0

class ExamFeedbackRequest(BaseModel):
    total_score: int
    passed: bool
    sections: list[dict]

class ExamFeedbackResponse(BaseModel):
    feedback: str

# ── Code Runner ───────────────────────────────────────────────
class CodeRunRequest(BaseModel):
    language: str
    code: str
    stdin: str = ""

class CodeRunResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int