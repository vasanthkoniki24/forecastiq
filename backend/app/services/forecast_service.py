import asyncio
import math
import uuid
from datetime import timedelta

import numpy as np
import pandas as pd
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error

from app.models.dataset import Dataset
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.forecast import PredictForecastRequest, TrainForecastRequest
from app.services.dataset_service import clean_dataframe, load_dataframe


TRAINING_JOBS: dict[str, dict] = {}


def validate_forecast_columns(
    df: pd.DataFrame,
    date_column: str,
    target_column: str,
) -> None:
    if date_column not in df.columns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Date column '{date_column}' not found in dataset",
        )

    if target_column not in df.columns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Target column '{target_column}' not found in dataset",
        )

    try:
        pd.to_datetime(df[date_column])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Column '{date_column}' cannot be converted to date",
        )

    try:
        pd.to_numeric(df[target_column])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Target column '{target_column}' must be numeric",
        )


def prepare_time_series(
    df: pd.DataFrame,
    date_column: str,
    target_column: str,
) -> pd.DataFrame:
    validate_forecast_columns(df, date_column, target_column)

    ts = df[[date_column, target_column]].copy()

    ts[date_column] = pd.to_datetime(
        ts[date_column],
        errors="coerce",
    )

    ts[target_column] = pd.to_numeric(
        ts[target_column],
        errors="coerce",
    )

    ts.dropna(
        subset=[date_column, target_column],
        inplace=True,
    )

    if ts.empty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dataset has no valid rows after cleaning",
        )

    ts = (
        ts.groupby(date_column)[target_column]
        .sum()
        .reset_index()
        .sort_values(date_column)
    )

    ts.columns = ["date", "value"]

    if len(ts) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 5 valid date rows are required for forecasting",
        )

    return ts


def calculate_metrics(
    y_true,
    y_pred,
) -> dict:
    mae = mean_absolute_error(y_true, y_pred)
    rmse = math.sqrt(mean_squared_error(y_true, y_pred))

    y_true_array = np.array(y_true)
    y_pred_array = np.array(y_pred)

    y_true_safe = np.where(y_true_array == 0, 1, y_true_array)

    mape = np.mean(
        np.abs((y_true_array - y_pred_array) / y_true_safe)
    ) * 100

    return {
        "mae": round(float(mae), 2),
        "rmse": round(float(rmse), 2),
        "mape": round(float(mape), 2),
    }


def train_linear_regression(
    ts: pd.DataFrame,
    periods: int,
) -> dict:
    ts = ts.copy()
    ts["day_index"] = np.arange(len(ts))

    x_train = ts[["day_index"]]
    y_train = ts["value"]

    model = LinearRegression()
    model.fit(x_train, y_train)

    fitted_values = model.predict(x_train)

    metrics = calculate_metrics(
        y_train,
        fitted_values,
    )

    last_day_index = int(ts["day_index"].max())
    last_date = ts["date"].max()

    future_indexes = np.arange(
        last_day_index + 1,
        last_day_index + periods + 1,
    ).reshape(-1, 1)

    future_predictions = model.predict(future_indexes)

    residual_std = float(
        np.std(y_train - fitted_values)
    )

    results = []
    for index, forecast_value in enumerate(
        future_predictions,
        start=1,
    ):
        future_date = last_date + timedelta(days=index)

        forecast = max(float(forecast_value), 0.0)
        lower = max(forecast - 1.96 * residual_std, 0.0)
        upper = forecast + 1.96 * residual_std

        results.append(
            {
                "date": future_date.strftime("%Y-%m-%d"),
                "actual": None,
                "forecast": round(forecast, 2),
                "lower": round(lower, 2),
                "upper": round(upper, 2),
            }
        )

    return {
        "model_type": "linear_regression",
        "results": results,
        **metrics,
    }


def train_prophet_forecast(
    ts: pd.DataFrame,
    periods: int,
) -> dict:
    try:
        from prophet import Prophet
    except Exception:
        return train_linear_regression(ts, periods)

    prophet_df = ts.rename(
        columns={
            "date": "ds",
            "value": "y",
        }
    )

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        uncertainty_samples=300,
    )

    model.fit(prophet_df)

    future = model.make_future_dataframe(
        periods=periods,
        freq="D",
    )

    forecast_df = model.predict(future)

    fitted_values = forecast_df.iloc[: len(prophet_df)]["yhat"].values

    metrics = calculate_metrics(
        prophet_df["y"].values,
        fitted_values,
    )

    future_forecast = forecast_df.tail(periods)

    results = []

    for _, row in future_forecast.iterrows():
        results.append(
            {
                "date": row["ds"].strftime("%Y-%m-%d"),
                "actual": None,
                "forecast": round(max(float(row["yhat"]), 0.0), 2),
                "lower": round(max(float(row["yhat_lower"]), 0.0), 2),
                "upper": round(max(float(row["yhat_upper"]), 0.0), 2),
            }
        )

    return {
        "model_type": "prophet",
        "results": results,
        **metrics,
    }


def choose_model_type(
    requested_model: str,
    row_count: int,
) -> str:
    if requested_model in ["linear_regression", "prophet"]:
        return requested_model

    if row_count >= 500:
        return "prophet"

    return "linear_regression"


async def get_owned_dataset(
    db: AsyncSession,
    dataset_id: int,
    current_user: User,
) -> Dataset:
    result = await db.execute(
        select(Dataset).where(
            Dataset.id == dataset_id,
            Dataset.owner_id == current_user.id,
        )
    )

    dataset = result.scalar_one_or_none()

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found",
        )

    return dataset


async def create_training_job(
    db: AsyncSession,
    current_user: User,
    payload: TrainForecastRequest,
) -> dict:
    dataset = await get_owned_dataset(
        db=db,
        dataset_id=payload.dataset_id,
        current_user=current_user,
    )

    df = clean_dataframe(
        load_dataframe(dataset.file_path)
    )

    prepare_time_series(
        df=df,
        date_column=payload.date_column,
        target_column=payload.target_column,
    )

    job_id = uuid.uuid4().hex

    TRAINING_JOBS[job_id] = {
        "user_id": current_user.id,
        "dataset_id": dataset.id,
        "status": "created",
        "pct": 0,
    }

    return {
        "job_id": job_id,
        "message": "Training job created",
    }


async def training_event_generator(job_id: str):
    if job_id not in TRAINING_JOBS:
        yield 'data: {"step":"Training job not found","pct":0,"status":"error"}\n\n'
        return

    steps = [
        ("Loading dataset", 10),
        ("Cleaning and preprocessing data", 30),
        ("Validating date and target columns", 45),
        ("Training forecasting model", 70),
        ("Generating confidence intervals", 90),
        ("Done", 100),
    ]
    for step, pct in steps:
        TRAINING_JOBS[job_id]["step"] = step
        TRAINING_JOBS[job_id]["pct"] = pct

        status_value = "done" if pct == 100 else "running"

        yield (
            f'data: {{"step":"{step}",'
            f'"pct":{pct},'
            f'"status":"{status_value}"}}\n\n'
        )

        await asyncio.sleep(0.8)

    TRAINING_JOBS[job_id]["status"] = "done"


async def predict_forecast(
    db: AsyncSession,
    current_user: User,
    payload: PredictForecastRequest,
) -> Prediction:
    dataset = await get_owned_dataset(
        db=db,
        dataset_id=payload.dataset_id,
        current_user=current_user,
    )

    df = clean_dataframe(
        load_dataframe(dataset.file_path)
    )

    ts = prepare_time_series(
        df=df,
        date_column=payload.date_column,
        target_column=payload.target_column,
    )

    selected_model_type = choose_model_type(
        requested_model=payload.model_type,
        row_count=len(ts),
    )

    if selected_model_type == "prophet":
        forecast_output = train_prophet_forecast(
            ts=ts,
            periods=payload.periods,
        )
    else:
        forecast_output = train_linear_regression(
            ts=ts,
            periods=payload.periods,
        )

    prediction = Prediction(
        dataset_id=dataset.id,
        model_type=forecast_output["model_type"],
        periods=payload.periods,
        results=forecast_output["results"],
        mae=forecast_output["mae"],
        rmse=forecast_output["rmse"],
        mape=forecast_output["mape"],
    )

    db.add(prediction)

    await db.commit()
    await db.refresh(prediction)

    return prediction


async def get_prediction_results(
    db: AsyncSession,
    current_user: User,
    prediction_id: int,
) -> Prediction:
    result = await db.execute(
        select(Prediction)
        .join(Dataset)
        .where(
            Prediction.id == prediction_id,
            Dataset.owner_id == current_user.id,
        )
    )

    prediction = result.scalar_one_or_none()

    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found",
        )

    return prediction