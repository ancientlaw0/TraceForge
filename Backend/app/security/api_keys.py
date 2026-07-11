import secrets
from pwdlib import PasswordHash
password_hasher = PasswordHash.recommended()

def generate_api_key() -> str:
    """ Generates a cryptographically secure API key. Example: tf_sk_kL8f2PqA9nY4... """
    return f"tf_sk_{secrets.token_urlsafe(32)}" # the more the bytes the harder to guess


def hash_api_key(api_key: str) -> str:
    """ Hashes the API key before storing it in the database. """
    return password_hasher.hash(api_key)


def verify_api_key(plain_key: str, hashed_key: str) -> bool:
    """ Verifies an incoming API key against the stored hash. """
    return password_hasher.verify(plain_key, hashed_key)