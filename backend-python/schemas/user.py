from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str


class UserUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    password: str | None = None
