from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.models.models import Problem
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/problems", tags=["problems"])

@router.get("/")
async def get_problems(
    topic: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user)
):
    query = select(Problem)
    if topic and topic != "All": query = query.where(Problem.topic == topic)
    if difficulty and difficulty != "All": query = query.where(Problem.difficulty == difficulty)
    result = await db.execute(query.order_by(Problem.id))
    problems = result.scalars().all()
    return {"problems": [{"id": p.id, "title": p.title, "description": p.description, "difficulty": p.difficulty, "topic": p.topic, "examples": p.examples, "constraints": p.constraints, "starter_code": p.starter_code} for p in problems]}