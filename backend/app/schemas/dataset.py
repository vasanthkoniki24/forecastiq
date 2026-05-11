from datetime import datetime
from typing import Any

from pydantic import BaseModel


class DatasetResponse(BaseModel):
    id: int
    filename: str
    row_count: int
    column_info: dict[str, Any]
    status: str
    uploaded_at: datetime

    model_config = {
        "from_attributes": True
    }


class DatasetPreviewResponse(BaseModel):
    dataset_id: int
    columns: list[dict[str, str]]
    rows: list[dict[str, Any]]