from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings

from app.api.v1.auth import router as auth_router
from app.api.v1.datasets import router as dataset_router
from app.api.v1.forecasts import router as forecast_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.reports import router as reports_router


app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(
    request: Request,
    exc: SQLAlchemyError,
):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Database error occurred"
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request,
    exc: Exception,
):
    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={
                "detail": str(exc)
            },
        )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error"
        },
    )


@app.get("/")
async def root():
    return {
        "message": "ForecastIQ API running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }


app.include_router(auth_router, prefix="/api")
app.include_router(dataset_router, prefix="/api")
app.include_router(forecast_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(reports_router, prefix="/api")