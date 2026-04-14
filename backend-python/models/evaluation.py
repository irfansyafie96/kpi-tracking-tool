from datetime import datetime
from decimal import Decimal

from sqlalchemy import String, Integer, Numeric, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Evaluation(Base):
    __tablename__ = "evaluations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    member_id: Mapped[int] = mapped_column(Integer, nullable=False)
    evaluator_name: Mapped[str] = mapped_column(String, nullable=False)
    final_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    performance_rating: Mapped[str] = mapped_column(String, nullable=False)
    evaluation_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
