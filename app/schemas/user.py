from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    analyst = "analyst"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.analyst

class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True

class LoginData(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
