import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, JSON
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