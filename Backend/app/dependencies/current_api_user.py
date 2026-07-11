from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import APIKey, User
from app.security.api_keys import verify_api_key

security = HTTPBearer()


def get_current_api_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    api_key = credentials.credentials
    api_keys = db.query(APIKey).all()
    for stored_key in api_keys:
        if ( stored_key.is_active and verify_api_key(api_key, stored_key.key_hash) ):

            user = (
                db.query(User)
                .filter(User.id == stored_key.user_id)
                .first()
            )
            if user:
                return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid API Key."
    )