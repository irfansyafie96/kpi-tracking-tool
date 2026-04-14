from datetime import datetime

from sqlalchemy import String, Integer, Boolean, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class KpiMetric(Base):
    __tablename__ = "kpi_metrics"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    kra_name: Mapped[str] = mapped_column(String, nullable=False)
    kra_weight: Mapped[int] = mapped_column(Integer, nullable=False)
    metric_name: Mapped[str] = mapped_column(String, nullable=False)
    evidence: Mapped[str | None] = mapped_column(String, nullable=True)
    metric_weight: Mapped[int] = mapped_column(Integer, nullable=False)
    rubric_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    requires_file: Mapped[bool] = mapped_column(Boolean, default=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
