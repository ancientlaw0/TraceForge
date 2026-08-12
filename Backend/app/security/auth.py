from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
from jose import jwt
from dotenv import load_dotenv
from app.core.config import settings

password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hasher.hash(password) # salt added so that guessing isnt that easy 


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hasher.verify(password, hashed_password)
# backend just verify not decrypts for security puropses

load_dotenv()

SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    settings.ACCESS_TOKEN_EXPIRE_MINUTES
)

def create_access_token(user_id: int):

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return token

from jose import JWTError


def verify_access_token(token: str):

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        return payload

    except JWTError:
        return None
    



