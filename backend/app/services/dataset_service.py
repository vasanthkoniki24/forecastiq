import pandas as pd

from fastapi import HTTPException, status, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dataset import Dataset
from app.models.user import User

from app.schemas.dataset import DatasetPreviewResponse

from app.utils.file_utils import save_upload_file


def load_dataframe(file_path: str) -> pd.DataFrame:
    if file_path.endswith(".csv"):
        return pd.read_csv(file_path)

    return pd.read_excel(file_path)


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    df.drop_duplicates(inplace=True)

    df = df.ffill()

    df = df.fillna("")

    return df


def build_column_info(df: pd.DataFrame) -> dict:
    return {
        column: str(dtype)
        for column, dtype in df.dtypes.items()
    }


async def upload_dataset(
    db: AsyncSession,
    current_user: User,
    file: UploadFile,
) -> Dataset:
    try:
        file_path = await save_upload_file(file)

        df = load_dataframe(file_path)

        if df.empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded dataset is empty",
            )

        df = clean_dataframe(df)

        dataset = Dataset(
            filename=file.filename,
            file_path=file_path,
            row_count=len(df),
            column_info=build_column_info(df),
            status="ready",
            owner_id=current_user.id,
        )

        db.add(dataset)

        await db.commit()
        await db.refresh(dataset)

        return dataset

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dataset processing failed: {str(e)}",
        )


async def get_user_datasets(
    db: AsyncSession,
    current_user: User,
):
    result = await db.execute(
        select(Dataset)
        .where(Dataset.owner_id == current_user.id)
        .order_by(Dataset.uploaded_at.desc())
    )

    return result.scalars().all()


async def get_dataset_by_id(
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


async def get_dataset_preview(
    db: AsyncSession,
    dataset_id: int,
    current_user: User,
) -> DatasetPreviewResponse:
    dataset = await get_dataset_by_id(
        db,
        dataset_id,
        current_user,
    )

    try:
        df = load_dataframe(dataset.file_path)

        df = clean_dataframe(df)

        preview_df = df.head(50)

        columns = [
            {
                "name": column,
                "dtype": str(dtype),
            }
            for column, dtype in preview_df.dtypes.items()
        ]

        rows = preview_df.fillna("").to_dict(orient="records")

        return DatasetPreviewResponse(
            dataset_id=dataset.id,
            columns=columns,
            rows=rows,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to generate preview: {str(e)}",
        )


async def delete_dataset(
    db: AsyncSession,
    dataset_id: int,
    current_user: User,
):
    dataset = await get_dataset_by_id(
        db,
        dataset_id,
        current_user,
    )

    await db.delete(dataset)
    await db.commit()

    return {
        "message": "Dataset deleted successfully"
    }