import pandas as pd
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dataset import Dataset
from app.models.prediction import Prediction
from app.models.user import User
from app.services.dataset_service import clean_dataframe, load_dataframe


async def get_latest_dataset(
    db: AsyncSession,
    current_user: User,
) -> Dataset | None:
    result = await db.execute(
        select(Dataset)
        .where(Dataset.owner_id == current_user.id)
        .order_by(Dataset.uploaded_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_latest_prediction(
    db: AsyncSession,
    current_user: User,
) -> Prediction | None:
    result = await db.execute(
        select(Prediction)
        .join(Dataset)
        .where(Dataset.owner_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


def detect_date_column(df: pd.DataFrame) -> str | None:
    for column in df.columns:
        converted = pd.to_datetime(df[column], errors="coerce")
        if converted.notna().sum() >= max(3, int(len(df) * 0.5)):
            return column
    return None


def detect_numeric_column(df: pd.DataFrame) -> str | None:
    numeric_columns = df.select_dtypes(include=["number"]).columns.tolist()

    if numeric_columns:
        return numeric_columns[0]

    for column in df.columns:
        converted = pd.to_numeric(df[column], errors="coerce")
        if converted.notna().sum() >= max(3, int(len(df) * 0.5)):
            return column

    return None


def detect_product_column(df: pd.DataFrame) -> str | None:
    preferred_columns = [
        "product",
        "product_name",
        "item",
        "item_name",
        "sku",
        "category",
    ]

    lower_map = {column.lower(): column for column in df.columns}

    for column in preferred_columns:
        if column in lower_map:
            return lower_map[column]

    text_columns = df.select_dtypes(include=["object"]).columns.tolist()

    if text_columns:
        return text_columns[0]

    return None


async def get_summary(
    db: AsyncSession,
    current_user: User,
):
    dataset = await get_latest_dataset(db, current_user)
    prediction = await get_latest_prediction(db, current_user)

    if not dataset:
        return {
            "total_sales": 0,
            "mom_growth": 0,
            "mape": prediction.mape if prediction else 0,
            "top_product": None,
            "forecast_trend": prediction.results if prediction else [],
        }

    df = clean_dataframe(load_dataframe(dataset.file_path))

    date_column = detect_date_column(df)
    numeric_column = detect_numeric_column(df)
    product_column = detect_product_column(df)

    total_sales = 0
    mom_growth = 0
    top_product = None

    if numeric_column:
        df[numeric_column] = pd.to_numeric(
            df[numeric_column],
            errors="coerce",
        ).fillna(0)

        total_sales = round(float(df[numeric_column].sum()), 2)

    if date_column and numeric_column:
        monthly_df = df[[date_column, numeric_column]].copy()

        monthly_df[date_column] = pd.to_datetime(
            monthly_df[date_column],
            errors="coerce",
        )

        monthly_df.dropna(subset=[date_column], inplace=True)

        if not monthly_df.empty:
            monthly_df["month"] = monthly_df[date_column].dt.to_period("M").astype(str)

            monthly_sales = (
                monthly_df.groupby("month")[numeric_column]
                .sum()
                .reset_index()
                .sort_values("month")
            )

            if len(monthly_sales) >= 2:
                previous_month_sales = float(monthly_sales.iloc[-2][numeric_column])
                current_month_sales = float(monthly_sales.iloc[-1][numeric_column])
                if previous_month_sales != 0:
                    mom_growth = round(
                        (
                            (current_month_sales - previous_month_sales)
                            / previous_month_sales
                        )
                        * 100,
                        2,
                    )

    if product_column and numeric_column:
        product_sales = (
            df.groupby(product_column)[numeric_column]
            .sum()
            .reset_index()
            .sort_values(numeric_column, ascending=False)
        )

        if not product_sales.empty:
            top_product = str(product_sales.iloc[0][product_column])

    return {
        "total_sales": total_sales,
        "mom_growth": mom_growth,
        "mape": prediction.mape if prediction else 0,
        "top_product": top_product,
        "forecast_trend": prediction.results if prediction else [],
    }


async def get_monthly_sales(
    db: AsyncSession,
    current_user: User,
):
    dataset = await get_latest_dataset(db, current_user)

    if not dataset:
        return []

    df = clean_dataframe(load_dataframe(dataset.file_path))

    date_column = detect_date_column(df)
    numeric_column = detect_numeric_column(df)

    if not date_column or not numeric_column:
        return []

    df[date_column] = pd.to_datetime(df[date_column], errors="coerce")
    df[numeric_column] = pd.to_numeric(df[numeric_column], errors="coerce").fillna(0)

    df.dropna(subset=[date_column], inplace=True)

    if df.empty:
        return []

    df["month_sort"] = df[date_column].dt.to_period("M")
    df["month"] = df[date_column].dt.strftime("%b %Y")

    monthly = (
        df.groupby(["month_sort", "month"])[numeric_column]
        .sum()
        .reset_index()
        .sort_values("month_sort")
        .tail(12)
    )

    return [
        {
            "month": str(row["month"]),
            "sales": round(float(row[numeric_column]), 2),
        }
        for _, row in monthly.iterrows()
    ]


async def get_top_products(
    db: AsyncSession,
    current_user: User,
):
    dataset = await get_latest_dataset(db, current_user)

    if not dataset:
        return []

    df = clean_dataframe(load_dataframe(dataset.file_path))

    product_column = detect_product_column(df)
    numeric_column = detect_numeric_column(df)

    if not product_column or not numeric_column:
        return []

    df[numeric_column] = pd.to_numeric(df[numeric_column], errors="coerce").fillna(0)

    product_sales = (
        df.groupby(product_column)[numeric_column]
        .sum()
        .reset_index()
        .sort_values(numeric_column, ascending=False)
        .head(10)
    )

    total = float(product_sales[numeric_column].sum())

    if total == 0:
        total = 1

    return [
        {
            "product": str(row[product_column]),
            "volume": round(float(row[numeric_column]), 2),
            "share": round((float(row[numeric_column]) / total) * 100, 2),
        }
        for _, row in product_sales.iterrows()
    ]


async def get_accuracy(
    db: AsyncSession,
    current_user: User,
):
    prediction = await get_latest_prediction(db, current_user)

    if not prediction:
        return {
            "mae": 0,
            "rmse": 0,
            "mape": 0,
            "accuracy": 0,
        }

    accuracy = max(0, 100 - prediction.mape)

    return {
        "mae": prediction.mae,
        "rmse": prediction.rmse,
        "mape": prediction.mape,
        "accuracy": round(accuracy, 2),
    }