# app/redis/keys.py

from datetime import datetime

from app.redis.schemas import (
    ALERTS_PREFIX,
    METRICS_PREFIX,
    MINUTE_BUCKET_FORMAT,
)


def minute_bucket(timestamp: datetime) -> str:
    """
    Convert a timestamp into a minute bucket.

    Example:
    2026-07-20 14:37:42
        ↓
    202607201437
    """
    return timestamp.strftime(MINUTE_BUCKET_FORMAT)


def totals_key(user_id: int, timestamp: datetime) -> str:
    bucket = minute_bucket(timestamp)
    return f"{METRICS_PREFIX}:{user_id}:{bucket}:totals"


def provider_key(
    user_id: int,
    timestamp: datetime,
    provider: str,
) -> str:
    bucket = minute_bucket(timestamp)
    return f"{METRICS_PREFIX}:{user_id}:{bucket}:provider:{provider}"


def model_key(
    user_id: int,
    timestamp: datetime,
    model: str,
) -> str:
    bucket = minute_bucket(timestamp)
    return f"{METRICS_PREFIX}:{user_id}:{bucket}:model:{model}"


def status_key(
    user_id: int,
    timestamp: datetime,
) -> str:
    bucket = minute_bucket(timestamp)
    return f"{METRICS_PREFIX}:{user_id}:{bucket}:status"


def alert_key(user_id: int) -> str:
    return f"{ALERTS_PREFIX}:{user_id}"

def providers_set_key(user_id):
    return f"metrics:{user_id}:providers"


def models_set_key(user_id):
    return f"metrics:{user_id}:models"