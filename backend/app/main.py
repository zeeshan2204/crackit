from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, Base
from app.routes import auth, problems, submissions, ai
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="InterviewAI API",
    version="1.0.0",
    lifespan=lifespan
)

_origins = [settings.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(_origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api")
app.include_router(problems.router,    prefix="/api")
app.include_router(submissions.router, prefix="/api")
app.include_router(ai.router,          prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok"}