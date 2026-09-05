from dataclasses import dataclass

@dataclass
class AuthContext:
    user_id: int
    api_key_id: int