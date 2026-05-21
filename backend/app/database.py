from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

import ssl as _ssl

_db_url = settings.DATABASE_URL.replace("?sslmode=require", "").replace("&sslmode=require", "")
_ssl_ctx = _ssl.create_default_context() if "sslmode=require" in settings.DATABASE_URL else False

engine = create_async_engine(
    _db_url,
    echo=False,
    connect_args={"ssl": _ssl_ctx} if _ssl_ctx else {},
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncSession:
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()