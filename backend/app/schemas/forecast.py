from datetime import datetime
from typing import Literal, Any

from pydantic import BaseModel, Field


ModelType = Literal["auto", "linear_regression", "prophet"]


class TrainForecastRequest(BaseModel):
    dataset_id: int
    date_column: str = Field(..., min_length=1)
    target_column: str = Field(..., min_length=1)
    model_type: ModelType = "auto"
    periods: int = Field(default=30, ge=1, le=365)


class TrainForecastResponse(BaseModel):
    job_id: str
    message: str


class PredictForecastRequest(BaseModel):
    dataset_id: int
    date_column: str = Field(..., min_length=1)
    target_column: str = Field(..., min_length=1)
    model_type: ModelType = "auto"
    periods: int = Field(default=30, ge=1, le=365)


class PredictionResponse(BaseModel):
    id: int
    dataset_id: int
    model_type: str
    periods: int
    results: list[dict[str, Any]]
    mae: float
    rmse: float
    mape: float
    created_at: datetime

    model_config = {
        "from_attributes": True
    }