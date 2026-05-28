from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.models import ExamQuestion, ExamSession, ExamAnswer, User
from app.models.schemas import (
    ExamStartResponse, ExamQuestionOut, SectionSubmit,
    SectionResult, ExamResultOut, LeaderboardEntry, HistoryEntry,
)

router = APIRouter(prefix="/exam", tags=["exam"])

PASS_TOTAL = 50   # overall pass threshold (%)


@router.post("/start", response_model=ExamStartResponse)
async def start_exam(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    session = ExamSession(user_id=current_user["id"])
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return ExamStartResponse(
        session_id=session.id,
        start_time=session.start_time.isoformat(),
    )


@router.get("/questions/{section}", response_model=list[ExamQuestionOut])
async def get_questions(
    section: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    valid = {"verbal", "reasoning", "aptitude", "coding"}
    if section not in valid:
        raise HTTPException(status_code=400, detail=f"section must be one of {valid}")
    result = await db.execute(
        select(ExamQuestion).where(ExamQuestion.section == section)
    )
    questions = result.scalars().all()
    return [
        ExamQuestionOut(
            id=q.id, section=q.section, topic=q.topic,
            question_text=q.question_text, options=q.options,
            difficulty=q.difficulty, time_limit=q.time_limit,
        )
        for q in questions
    ]


@router.post("/submit-section", response_model=SectionResult)
async def submit_section(
    payload: SectionSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(ExamSession).where(
            ExamSession.id == payload.session_id,
            ExamSession.user_id == current_user["id"],
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    q_ids = [a.question_id for a in payload.answers]
    q_result = await db.execute(
        select(ExamQuestion).where(ExamQuestion.id.in_(q_ids))
    )
    questions = {q.id: q for q in q_result.scalars().all()}

    correct = 0
    for ans in payload.answers:
        q = questions.get(ans.question_id)
        is_correct = bool(q) and bool(ans.user_answer) and ans.user_answer.upper() == q.correct_answer.upper()
        if is_correct:
            correct += 1
        db.add(ExamAnswer(
            session_id=payload.session_id,
            question_id=ans.question_id,
            user_answer=ans.user_answer,
            is_correct=is_correct,
            time_spent=ans.time_spent,
        ))

    total = len(payload.answers)

    # If questions came from the local JS bank (not in DB), use frontend-calculated score
    if not questions and payload.score is not None:
        score = payload.score
        correct = payload.correct or 0
        total = payload.total or total
    else:
        score = round((correct / total) * 100) if total else 0

    scores = dict(session.scores or {})
    scores[payload.section] = score
    session.scores = scores

    times = dict(session.time_taken or {})
    times[payload.section] = payload.time_taken
    session.time_taken = times

    await db.commit()
    return SectionResult(
        section=payload.section,
        total=total,
        correct=correct,
        score=score,
        time_taken=payload.time_taken,
    )


@router.post("/complete/{session_id}", response_model=ExamResultOut)
async def complete_exam(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(ExamSession).where(
            ExamSession.id == session_id,
            ExamSession.user_id == current_user["id"],
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.completed = True
    session.end_time = datetime.utcnow()
    await db.commit()

    return await _build_result(session, db)


@router.get("/result/{session_id}", response_model=ExamResultOut)
async def get_result(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(ExamSession).where(
            ExamSession.id == session_id,
            ExamSession.user_id == current_user["id"],
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return await _build_result(session, db)


@router.get("/history", response_model=list[HistoryEntry])
async def get_history(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(ExamSession)
        .where(ExamSession.user_id == current_user["id"], ExamSession.completed == True)
        .order_by(ExamSession.end_time.asc())
        .limit(20)
    )
    sessions = result.scalars().all()
    entries = []
    for i, s in enumerate(sessions):
        sc = s.scores or {}
        entries.append(HistoryEntry(
            session_id=s.id,
            date=s.end_time.strftime("%d %b") if s.end_time else f"Attempt {i+1}",
            attempt=i + 1,
            total_score=sc.get("total", 0),
            numerical=sc.get("numerical", sc.get("aptitude", 0)),
            verbal=sc.get("verbal", 0),
            reasoning=sc.get("reasoning", 0),
            coding=sc.get("coding", 0),
        ))
    return entries


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def get_leaderboard(
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(ExamSession, User)
        .join(User, ExamSession.user_id == User.id)
        .where(ExamSession.completed == True)
        .order_by(ExamSession.end_time.desc())
        .limit(50)
    )
    rows = result.all()

    # Sort by total score client-side after fetching (JSON extraction varies by DB)
    entries_raw = []
    for sess, user in rows:
        sc = sess.scores or {}
        entries_raw.append({
            "name": user.name,
            "total_score": sc.get("total", 0),
            "verbal": sc.get("verbal", 0),
            "reasoning": sc.get("reasoning", 0),
            "aptitude": sc.get("aptitude", 0),
            "date": sess.end_time.strftime("%Y-%m-%d") if sess.end_time else "",
        })

    entries_raw.sort(key=lambda x: x["total_score"], reverse=True)

    return [
        LeaderboardEntry(rank=i + 1, **e)
        for i, e in enumerate(entries_raw)
    ]


# ── helpers ──────────────────────────────────────────────────────────────────

async def _build_result(session: ExamSession, db: AsyncSession) -> ExamResultOut:
    sc = session.scores or {}
    tt = session.time_taken or {}

    sections_done = []
    for sec in ["numerical", "verbal", "reasoning", "aptitude"]:
        if sec not in sc:
            continue
        sec_q_result = await db.execute(
            select(ExamQuestion.id).where(ExamQuestion.section == sec)
        )
        sec_q_ids = [row[0] for row in sec_q_result.all()]

        ans_result = await db.execute(
            select(ExamAnswer).where(
                ExamAnswer.session_id == session.id,
                ExamAnswer.question_id.in_(sec_q_ids),
            )
        )
        answers = ans_result.scalars().all()
        total = len(answers)
        correct = sum(1 for a in answers if a.is_correct)
        sections_done.append(SectionResult(
            section=sec,
            total=total,
            correct=correct,
            score=sc.get(sec, 0),
            time_taken=tt.get(sec, 0),
        ))

    non_coding = [s.score for s in sections_done]
    total_score = round(sum(non_coding) / len(non_coding)) if non_coding else 0
    scores_with_total = {**sc, "total": total_score}
    session.scores = scores_with_total
    await db.commit()

    # percentile: fraction of completed sessions with lower total score
    count_result = await db.execute(
        select(func.count()).where(ExamSession.completed == True)
    )
    total_sessions = count_result.scalar() or 1

    all_scores_result = await db.execute(
        select(ExamSession.scores).where(ExamSession.completed == True)
    )
    all_scores = all_scores_result.scalars().all()
    lower_count = sum(
        1 for s in all_scores
        if isinstance(s, dict) and s.get("total", 0) < total_score
    )
    percentile = round((lower_count / total_sessions) * 100, 1)

    return ExamResultOut(
        session_id=session.id,
        completed=session.completed,
        scores=scores_with_total,
        time_taken=tt,
        sections=sections_done,
        total_score=total_score,
        percentile=percentile,
        passed=total_score >= PASS_TOTAL,
    )
