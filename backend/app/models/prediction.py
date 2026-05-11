
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base

from datetime import datetime


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    dataset_id: Mapped[int] = mapped_column(
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    model_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    periods: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    results: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )

    mae: Mapped[float] = mapped_column(
        Float,
        default=0.0,
    )

    rmse: Mapped[float] = mapped_column(
        Float,
        default=0.0,
    )

    mape: Mapped[float] = mapped_column(
        Float,
        default=0.0,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    dataset = relationship(
        "Dataset",
        back_populates="predictions",
        lazy="selectin",
    )

    reports = relationship(
        "Report",
        back_populates="prediction",
        cascade="all, delete-orphan",
        lazy="selectin",
    )