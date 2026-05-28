import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, JSON, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id:           Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    email:        Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name:         Mapped[str] = mapped_column(String, nullable=False)
    password_hash:Mapped[str | None] = mapped_column(String, nullable=True)
    google_id:    Mapped[str | None] = mapped_column(String, unique=True, nullable=True)
    avatar:       Mapped[str | None] = mapped_column(String, nullable=True)
    theme:        Mapped[str] = mapped_column(String, default="dark")
    created_at:   Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    submissions: Mapped[list["Submission"]] = relationship("Submission", back_populates="user")


class Problem(Base):
    __tablename__ = "problems"

    id:          Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title:       Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty:  Mapped[str] = mapped_column(String, nullable=False)  # Easy / Medium / Hard
    topic:       Mapped[str] = mapped_column(String, nullable=False)
    examples:    Mapped[dict] = mapped_column(JSON, nullable=False)
    constraints: Mapped[dict] = mapped_column(JSON, nullable=False)
    starter_code:Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at:  Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    submissions: Mapped[list["Submission"]] = relationship("Submission", back_populates="problem")


class Submission(Base):
    __tablename__ = "submissions"

    id:         Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id:    Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    problem_id: Mapped[int] = mapped_column(Integer, ForeignKey("problems.id"), nullable=False)
    code:       Mapped[str] = mapped_column(Text, nullable=False)
    language:   Mapped[str] = mapped_column(String, nullable=False)
    time_taken: Mapped[int] = mapped_column(Integer, default=0)  # seconds
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user:     Mapped["User"]     = relationship("User", back_populates="submissions")
    problem:  Mapped["Problem"]  = relationship("Problem", back_populates="submissions")
    feedback: Mapped["Feedback | None"] = relationship("Feedback", back_populates="submission", uselist=False)


class Feedback(Base):
    __tablename__ = "feedback"

    id:            Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    submission_id: Mapped[str] = mapped_column(String, ForeignKey("submissions.id"), unique=True)
    correctness:   Mapped[int] = mapped_column(Integer)
    efficiency:    Mapped[int] = mapped_column(Integer)
    readability:   Mapped[int] = mapped_column(Integer)
    edge_cases:    Mapped[int] = mapped_column(Integer)
    overall:       Mapped[int] = mapped_column(Integer)
    summary:       Mapped[str] = mapped_column(Text)
    strengths:     Mapped[dict] = mapped_column(JSON)
    improvements:  Mapped[dict] = mapped_column(JSON)
    ai_comment:    Mapped[str] = mapped_column(Text)
    created_at:    Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    submission: Mapped["Submission"] = relationship("Submission", back_populates="feedback")


class ExamQuestion(Base):
    __tablename__ = "exam_questions"

    id:             Mapped[int]  = mapped_column(Integer, primary_key=True, autoincrement=True)
    section:        Mapped[str]  = mapped_column(String, nullable=False)   # verbal/reasoning/aptitude/coding
    topic:          Mapped[str]  = mapped_column(String, nullable=False)
    question_text:  Mapped[str]  = mapped_column(Text, nullable=False)
    options:        Mapped[dict] = mapped_column(JSON, nullable=False)      # list of 4 strings
    correct_answer: Mapped[str]  = mapped_column(String, nullable=False)   # "A"/"B"/"C"/"D"
    explanation:    Mapped[str]  = mapped_column(Text, nullable=False)
    difficulty:     Mapped[str]  = mapped_column(String, default="medium")
    time_limit:     Mapped[int]  = mapped_column(Integer, default=90)       # seconds per question

    answers: Mapped[list["ExamAnswer"]] = relationship("ExamAnswer", back_populates="question")


class ExamSession(Base):
    __tablename__ = "exam_sessions"

    id:         Mapped[str]      = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id:    Mapped[str]      = mapped_column(String, ForeignKey("users.id"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_time:   Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    scores:     Mapped[dict]     = mapped_column(JSON, default=dict)        # {verbal, reasoning, aptitude, coding, total}
    time_taken: Mapped[dict]     = mapped_column(JSON, default=dict)        # {verbal, reasoning, aptitude, coding}
    completed:  Mapped[bool]     = mapped_column(Boolean, default=False)

    user:    Mapped["User"]           = relationship("User")
    answers: Mapped[list["ExamAnswer"]] = relationship("ExamAnswer", back_populates="session")


class ExamAnswer(Base):
    __tablename__ = "exam_answers"

    id:          Mapped[str]  = mapped_column(String, primary_key=True, default=gen_uuid)
    session_id:  Mapped[str]  = mapped_column(String, ForeignKey("exam_sessions.id"), nullable=False)
    question_id: Mapped[int]  = mapped_column(Integer, ForeignKey("exam_questions.id"), nullable=False)
    user_answer: Mapped[str | None] = mapped_column(String, nullable=True)  # "A"/"B"/"C"/"D" or None
    is_correct:  Mapped[bool] = mapped_column(Boolean, default=False)
    time_spent:  Mapped[int]  = mapped_column(Integer, default=0)           # seconds

    session:  Mapped["ExamSession"]  = relationship("ExamSession", back_populates="answers")
    question: Mapped["ExamQuestion"] = relationship("ExamQuestion", back_populates="answers")