from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

from app.core.dependencies import get_current_user

from app.models.user import User

from app.schemas.dataset import (
    DatasetResponse,
    DatasetPreviewResponse,
)

from app.services.dataset_service import (
    upload_dataset,
    get_user_datasets,
    get_dataset_preview,
    delete_dataset,
)


router = APIRouter(
    prefix="/datasets",
    tags=["Datasets"],
)


@router.post(
    "/upload",
    response_model=DatasetResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_dataset_route(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await upload_dataset(
        db,
        current_user,
        file,
    )


@router.get(
    "",
    response_model=list[DatasetResponse],
)
async def get_datasets_route(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_user_datasets(
        db,
        current_user,
    )


@router.get(
    "/{dataset_id}/preview",
    response_model=DatasetPreviewResponse,
)
async def get_dataset_preview_route(
    dataset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_dataset_preview(
        db,
        dataset_id,
        current_user,
    )


@router.delete(
    "/{dataset_id}",
)
async def delete_dataset_route(
    dataset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await delete_dataset(
        db,
        dataset_id,
        current_user,
    )