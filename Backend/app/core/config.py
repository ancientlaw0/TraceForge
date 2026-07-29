from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "TraceForge"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str

    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str
    TRACE_TOPIC: str
    TRACE_CONSUMER_GROUP: str

    # Redis
    REDIS_HOST: str
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    # Security
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    #email
    SMTP_EMAIL:str
    SMTP_PASSWORD:str
    SMTP_HOST:str
    SMTP_PORT: int

    NVIDIA_API_KEY: str
    LLM_MODEL: str 

    model_config = SettingsConfigDict(
        env_file=(
            "app/.env",
        ),
        extra="ignore",
    )


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()