import hashlib
import json
import dotenv
import os
from app.redis.client import redis_client
dotenv.load_dotenv()

CACHE_TTL = int(os.getenv("AUTH_CACHE_TTL"))


def fingerprint(api_key: str) -> str:
    return hashlib.sha256(
        api_key.encode("utf-8")
    ).hexdigest()


async def get_cached_auth(api_key: str):
    key = f"tf:auth:{fingerprint(api_key)}"

    value = await redis_client.get(key)

    if value is None:
        return None

    return json.loads(value)


async def set_cached_auth(
    api_key: str,
    user_id: int,
    api_key_id: int,
):
    key = f"tf:auth:{fingerprint(api_key)}"

    value = json.dumps({
        "user_id": user_id,
        "api_key_id": api_key_id,
    })

    await redis_client.set(
        key,
        value,
        ex=CACHE_TTL,
    )