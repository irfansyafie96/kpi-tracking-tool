from pydantic import BaseModel
from datetime import datetime


class KpiMetricCreate(BaseModel):
    kra_name: str
    kra_weight: int
    metric_name: str
    evidence: str | None = None
    metric_weight: int
    rubric_json: str | None = None
    requires_file: bool = False
    display_order: int = 0


class KpiMetricResponse(BaseModel):
    id: int
    kra_name: str
    kra_weight: int
    metric_name: str
    evidence: str | None = None
    metric_weight: int
    rubric_json: str | None = None
    requires_file: bool = False
    display_order: int = 0
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class KpiGroup(BaseModel):
    kra_weight: int
    metrics: list[KpiMetricResponse]
