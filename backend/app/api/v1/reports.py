from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.report import GenerateReportRequest, ReportResponse
from app.services.report_service import (
    generate_report,
    get_reports,
    get_report_for_download,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.post(
    "/generate",
    response_model=ReportResponse,
    status_code=201,
)
async def generate_report_route(
    payload: GenerateReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await generate_report(
        db,
        current_user,
        payload,
    )


@router.get(
    "",
    response_model=list[ReportResponse],
)
async def get_reports_route(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_reports(
        db,
        current_user,
    )


@router.get("/{report_id}/download/{report_format}")
async def download_report_route(
    report_id: int,
    report_format: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = await get_report_for_download(
        db,
        current_user,
        report_id,
        report_format,
    )

    media_type = (
        "application/pdf"
        if report.format == "pdf"
        else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    return FileResponse(
        path=report.file_path,
        filename=report.filename,
        media_type=media_type,
    )