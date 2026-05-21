import os

os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost/test")
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-testing-only")
os.environ.setdefault("JWT_REFRESH_SECRET", "test-refresh-secret-key-for-testing")
os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault("GOOGLE_CLIENT_ID", "")
os.environ.setdefault("CLIENT_URL", "http://localhost:5173")
