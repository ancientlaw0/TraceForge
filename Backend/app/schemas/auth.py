from pydantic import BaseModel, EmailStr, Field
import datetime

class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)# validation required later 

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime