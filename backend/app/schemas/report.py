from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


ReportFormat = Literal["excel", "pdf"]


class GenerateReportRequest(BaseModel):
    prediction_id: int = Field(..., ge=1)
    format: ReportFormat = "excel"


class ReportResponse(BaseModel):
    id: int
    prediction_id: int
    format: str
    filename: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }