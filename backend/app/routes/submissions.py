from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
import uuid

from app.database import get_db
from app.models.models import Problem, Submission, Feedback
from app.models.schemas import SubmitRequest
from app.middleware.auth_middleware import get_current_user
from app.services.ai_service import evaluate_code

router = APIRouter(prefix="/submissions", tags=["submissions"])


# ── POST /submissions — submit code + get AI feedback ─────────
@router.post("/")
async def create_submission(
    body: SubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Fetch problem
    result = await db.execute(select(Problem).where(Problem.id == body.problem_id))
    problem = result.scalar_one_or_none()
    if not problem:
        raise HTTPException(404, "Problem not found")

    # Get AI evaluation
    problem_dict = {
        "title": problem.title,
        "description": problem.description,
        "difficulty": problem.difficulty,
        "topic": problem.topic
    }
    ai_result = evaluate_code(body.code, body.language, problem_dict)

    # Save submission
    submission = Submission(
        id=str(uuid.uuid4()),
        user_id=current_user["id"],
        problem_id=body.problem_id,
        code=body.code,
        language=body.language,
        time_taken=body.time_taken
    )
    db.add(submission)
    await db.flush()  # get submission.id before feedback

    # Save feedback
    feedback = Feedback(
        id=str(uuid.uuid4()),
        submission_id=submission.id,
        correctness=ai_result["scores"]["correctness"],
        efficiency=ai_result["scores"]["efficiency"],
        readability=ai_result["scores"]["readability"],
        edge_cases=ai_result["scores"]["edge_cases"],
        overall=ai_result["overall"],
        summary=ai_result["summary"],
        strengths=ai_result["strengths"],
        improvements=ai_result["improvements"],
        ai_comment=ai_result["ai_comment"]
    )
    db.add(feedback)
    await db.commit()

    return {
        "submission": {
            "id": submission.id,
            "feedback": {
                "correctness": feedback.correctness,
                "efficiency": feedback.efficiency,
                "readability": feedback.readability,
                "edge_cases": feedback.edge_cases,
                "overall": feedback.overall,
                "summary": feedback.summary,
                "strengths": feedback.strengths,
                "improvements": feedback.improvements,
                "ai_comment": feedback.ai_comment
            }
        }
    }


# ── GET /submissions/history ──────────────────────────────────
@router.get("/history")
async def get_history(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Submission)
        .options(selectinload(Submission.feedback), selectinload(Submission.problem))
        .where(Submission.user_id == current_user["id"])
        .order_by(Submission.created_at.desc())
        .limit(20)
    )
    submissions = result.scalars().all()

    return {"submissions": [
        {
            "id": s.id,
            "language": s.language,
            "time_taken": s.time_taken,
            "created_at": s.created_at.isoformat(),
            "problem": {
                "title": s.problem.title,
                "topic": s.problem.topic,
                "difficulty": s.problem.difficulty
            },
            "feedback": {
                "overall": s.feedback.overall
            } if s.feedback else None
        }
        for s in submissions
    ]}


# ── GET /submissions/stats ────────────────────────────────────
@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Submission)
        .options(selectinload(Submission.feedback), selectinload(Submission.problem))
        .where(Submission.user_id == current_user["id"])
        .order_by(Submission.created_at.asc())
    )
    submissions = result.scalars().all()

    total = len(submissions)
    avg_score = (
        round(sum(s.feedback.overall for s in submissions if s.feedback) / total)
        if total else 0
    )

    # By topic
    topic_map: dict[str, dict] = {}
    for s in submissions:
        t = s.problem.topic
        if t not in topic_map:
            topic_map[t] = {"count": 0, "total": 0}
        topic_map[t]["count"] += 1
        topic_map[t]["total"] += s.feedback.overall if s.feedback else 0

    by_topic = [
        {"topic": t, "count": v["count"], "avg": round(v["total"] / v["count"])}
        for t, v in topic_map.items()
    ]

    # Score over time (last 10)
    score_over_time = [
        {
            "date": s.created_at.strftime("%d %b"),
            "score": s.feedback.overall if s.feedback else 0,
            "title": s.problem.title
        }
        for s in submissions[-10:]
    ]

    return {
        "total": total,
        "avg_score": avg_score,
        "by_topic": by_topic,
        "score_over_time": score_over_time
    }