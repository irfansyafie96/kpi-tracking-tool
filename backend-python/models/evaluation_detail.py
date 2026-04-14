from sqlalchemy import String, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class EvaluationDetail(Base):
    __tablename__ = "evaluation_details"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    evaluation_id: Mapped[int] = mapped_column(Integer, ForeignKey("evaluations.id"), nullable=False)
    metric_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    kra_name: Mapped[str] = mapped_column(String, nullable=False)
    metric_name: Mapped[str] = mapped_column(String, nullable=False)
    evidence_reviewed: Mapped[str | None] = mapped_column(String, nullable=True)
    percentage_score: Mapped[int] = mapped_column(Integer, nullable=False)
    evidence_remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
