from datetime import datetime
from pydantic import BaseModel,Field

class APIKeyCreate(BaseModel): # creatig an api key
    name: str = Field(min_length=1,max_length=100)

class APIKeyResponse(BaseModel): #key you see once at the frontend
    api_key: str

class APIKeyInfo(BaseModel): # rest metadata about the keys
    id: int
    name: str
    is_active: bool
    last_used_at: datetime | None
    created_at: datetime