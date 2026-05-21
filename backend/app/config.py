from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str
    GROQ_API_KEY: str
    GOOGLE_CLIENT_ID: str = ""
    CLIENT_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()