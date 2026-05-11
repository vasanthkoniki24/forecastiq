import os
import uuid
from pathlib import Path

from fastapi import UploadFile, HTTPException, status

from app.core.config import settings


ALLOWED_EXTENSIONS = {
    ".csv",
    ".xls",
    ".xlsx",
}


ALLOWED_CONTENT_TYPES = {
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}


def validate_upload_file(file: UploadFile) -> None:
    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV, XLS, and XLSX files are allowed",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type",
        )


async def save_upload_file(file: UploadFile) -> str:
    validate_upload_file(file)

    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)

    extension = Path(file.filename).suffix.lower()

    unique_name = f"{uuid.uuid4().hex}{extension}"

    file_path = os.path.join(upload_dir, unique_name)

    contents = await file.read()

    max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    if len(contents) > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit",
        )

    with open(file_path, "wb") as f:
        f.write(contents)

    return file_path