from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

from app.database import get_db
from app.models import APIKey
from app.security.api_keys import verify_api_key
from app.security.auth_context import AuthContext
from app.security.auth_cache import (
    get_cached_auth,
    set_cached_auth,
)

security = HTTPBearer()


async def get_current_api_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    api_key = credentials.credentials

    # 1. Redis fast path
    cached = await get_cached_auth(api_key)

    if cached is not None:
        return AuthContext(
            user_id=cached["user_id"],
            api_key_id=cached["api_key_id"],
        )

    # 2. Parse prefix
    parts = api_key.split("_", 3)

    if len(parts) != 4 or parts[0] != "tf" or parts[1] != "sk":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key.",
        )

    key_prefix = parts[2]

    # 3. Find the candidate key
    result = await db.execute(
        select(APIKey).where(
            APIKey.key_prefix == key_prefix,
            APIKey.is_active == True,
        )
    )

    stored_key = result.scalar_one_or_none()

    if stored_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key.",
        )

    # 4. Expensive Argon2 verification
    valid = await asyncio.to_thread(
        verify_api_key,
        api_key,
        stored_key.key_hash,
    )

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key.",
        )

    # 5. Cache successful authentication
    await set_cached_auth(
        api_key=api_key,
        user_id=stored_key.user_id,
        api_key_id=stored_key.id,
    )

    # 6. Return identity only
    return AuthContext(
        user_id=stored_key.user_id,
        api_key_id=stored_key.id,
    )