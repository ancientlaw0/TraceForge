from pydantic import BaseModel, EmailStr, Field

class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)# validation required later 

class UserLogin(BaseModel):
    email: EmailStr
    password: str