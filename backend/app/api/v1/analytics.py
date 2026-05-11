from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsSummaryResponse,
    MonthlySalesItem,
    TopProductItem,
    AccuracyResponse,
)
from app.services.analytics_service import (
    get_summary,
    get_monthly_sales,
    get_top_products,
    get_accuracy,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get(
    "/summary",
    response_model=AnalyticsSummaryResponse,
)
async def analytics_summary_route(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_summary(db, current_user)


@router.get(
    "/monthly-sales",
    response_model=list[MonthlySalesItem],
)
async def monthly_sales_route(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_monthly_sales(db, current_user)


@router.get(
    "/top-products",
    response_model=list[TopProductItem],
)
async def top_products_route(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_top_products(db, current_user)


@router.get(
    "/accuracy",
    response_model=AccuracyResponse,
)
async def accuracy_route(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_accuracy(db, current_user)