from datetime import datetime
from pydantic import BaseModel

class APIKeyCreate(BaseModel): # creatig an api key
    name: str

class APIKeyResponse(BaseModel): #key you see once at the frontend
    api_key: str

class APIKeyInfo(BaseModel): # rest metadata about the keys
    id: int
    name: str
    is_active: bool
    last_used_at: datetime | None
    created_at: datetime