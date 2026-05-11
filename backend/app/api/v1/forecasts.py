from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import (
    get_current_user,
    get_current_user_from_query_token,
)
from app.database import get_db
from app.models.user import User
from app.schemas.forecast import (
    TrainForecastRequest,
    TrainForecastResponse,
    PredictForecastRequest,
    PredictionResponse,
)
from app.services.forecast_service import (
    create_training_job,
    training_event_generator,
    predict_forecast,
    get_prediction_results,
)


router = APIRouter(
    prefix="/forecasts",
    tags=["Forecasts"],
)


@router.post(
    "/train",
    response_model=TrainForecastResponse,
)
async def train_forecast_route(
    payload: TrainForecastRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_training_job(
        db,
        current_user,
        payload,
    )


@router.get("/{job_id}/stream")
async def stream_training_route(
    job_id: str,
    current_user: User = Depends(get_current_user_from_query_token),
):
    return StreamingResponse(
        training_event_generator(job_id),
        media_type="text/event-stream",
    )


@router.post(
    "/predict",
    response_model=PredictionResponse,
)
async def predict_forecast_route(
    payload: PredictForecastRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await predict_forecast(
        db,
        current_user,
        payload,
    )


@router.get(
    "/{prediction_id}/results",
    response_model=PredictionResponse,
)
async def get_prediction_results_route(
    prediction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_prediction_results(
        db,
        current_user,
        prediction_id,
    )