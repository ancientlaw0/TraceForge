from dataclasses import dataclass

from app.models import User
from app.models import APIKey

@dataclass
class AuthContext:
    user: User
    api_key: APIKey