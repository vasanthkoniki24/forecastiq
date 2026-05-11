from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "ForecastIQ API"
    DEBUG: bool = True

    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    FRONTEND_URL: str = "http://localhost:5173"

    UPLOAD_DIR: str = "uploads"
    REPORTS_DIR: str = "reports"
    MAX_UPLOAD_SIZE_MB: int = 50

    class Config:
        env_file = ".env"


settings = Settings()