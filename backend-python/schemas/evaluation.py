from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal


class EvaluationDetailSubmit(BaseModel):
    metric_id: int | None = None
    kra_name: str
    metric_name: str
    evidence_reviewed: str | None = None
    percentage_score: int
    evidence_remarks: str | None = None
    file_path: str | None = None


class EvaluationSubmit(BaseModel):
    member_id: int
    evaluator_name: str
    details: list[EvaluationDetailSubmit]


class EvaluationDetailResponse(BaseModel):
    id: int
    evaluation_id: int
    metric_id: int | None = None
    kra_name: str
    metric_name: str
    evidence_reviewed: str | None = None
    percentage_score: int
    evidence_remarks: str | None = None
    file_path: str | None = None

    class Config:
        from_attributes = True


class EvaluationResponse(BaseModel):
    id: int
    member_id: int
    evaluator_name: str
    final_score: Decimal
    performance_rating: str
    evaluation_date: datetime | None = None

    class Config:
        from_attributes = True
