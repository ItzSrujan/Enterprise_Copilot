
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.db.base import Base


class Evaluation(Base):
    __tablename__ = "evaluations"

    __table_args__ = (
        CheckConstraint(
            "status IN ('completed', 'failed')",
            name="check_evaluation_status",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    question: Mapped[str] = mapped_column(
        Text, nullable=False
    )

    generated_answer: Mapped[str] = mapped_column(
        Text, nullable=False
    )

    expected_answer: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    # Stores individual metric scores and their results.
    metrics: Mapped[dict] = mapped_column(
        JSONB, nullable=False, default=dict
    )

    overall_score: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="completed"
    )

    error_message: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    evaluated_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    evaluator = relationship("User")