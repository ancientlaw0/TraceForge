from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import APIKey, User
from app.security.api_keys import verify_api_key
from app.security.auth_context import AuthContext

security = HTTPBearer()


async def get_current_api_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):

    api_key = credentials.credentials
    result = await db.execute( select(APIKey) )
    api_keys = result.scalars().all()

    for stored_key in api_keys:

        if (
            stored_key.is_active
            and verify_api_key(api_key, stored_key.key_hash)
        ):

            result = await db.execute(
                select(User).where(
                    User.id == stored_key.user_id
                )
            )
            user = result.scalar_one_or_none()
            if user:
                return AuthContext(
                    user=user,
                    api_key=stored_key
                )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid API Key."
    )