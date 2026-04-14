from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal


class DashboardSummary(BaseModel):
    total_evaluations: int
    average_score: float
    rating_breakdown: dict[str, int]


class MemberScore(BaseModel):
    member_id: int
    member_name: str
    role: str
    latest_score: Decimal
    latest_rating: str


class ProjectSummary(BaseModel):
    project_id: int
    members_evaluated: int
    member_scores: list[MemberScore]


class MemberSummary(BaseModel):
    member_id: int
    total_evaluations: int
    latest_score: Decimal | None = None
    latest_rating: str | None = None
    latest_evaluation_date: datetime | None = None
    kra_scores: dict[str, float] = {}


class ProjectMemberResponse(BaseModel):
    id: int
    project_id: int
    member_name: str
    role: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True
