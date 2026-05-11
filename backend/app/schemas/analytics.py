from typing import Any

from pydantic import BaseModel


class AnalyticsSummaryResponse(BaseModel):
    total_sales: float
    mom_growth: float
    mape: float
    top_product: str | None
    forecast_trend: list[dict[str, Any]]


class MonthlySalesItem(BaseModel):
    month: str
    sales: float


class TopProductItem(BaseModel):
    product: str
    volume: float
    share: float


class AccuracyResponse(BaseModel):
    mae: float
    rmse: float
    mape: float
    accuracy: float