from pydantic import BaseModel
from datetime import datetime


class ProjectCreate(BaseModel):
    project_name: str


class ProjectResponse(BaseModel):
    id: int
    project_name: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True
