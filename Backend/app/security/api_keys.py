import secrets
from pwdlib import PasswordHash
password_hasher = PasswordHash.recommended()

def generate_api_key() -> tuple[str, str]:
    """Generates an API key and its public lookup prefix."""
    key_prefix = secrets.token_hex(4)
    secret = secrets.token_urlsafe(32)
    api_key = f"tf_sk_{key_prefix}_{secret}"
    return api_key, key_prefix

def hash_api_key(api_key: str) -> str:
    """ Hashes the API key before storing it in the database. """
    return password_hasher.hash(api_key)

def verify_api_key(plain_key: str, hashed_key: str) -> bool:
    """ Verifies an incoming API key against the stored hash. """
    return password_hasher.verify(plain_key, hashed_key)