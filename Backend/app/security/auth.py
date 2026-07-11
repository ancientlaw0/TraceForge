from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
from jose import jwt
from dotenv import load_dotenv
import os

password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hasher.hash(password) # salt added so that guessing isnt that easy 


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hasher.verify(password, hashed_password)
# backend just verify not decrypts for security puropses

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
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
        JWT_SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token

from jose import JWTError


def verify_access_token(token: str):

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:
        return None
    



