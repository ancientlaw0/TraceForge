from fastapi import APIRouter,Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .schemas import ModelAnalyticsResponse
from app.dependencies.current_user import get_current_user
from app.database import get_db
from app.analytics.schemas import AnalyticsFilter,ProviderAnalyticsResponse,ErrorAnalyticsResponse,TimeSeriesResponse,TraceAnalyticsResponse
from app.models import User
from app.analytics.service.models import get_models
from app.analytics.service.overview import get_overview
from app.analytics.service.providers import get_providers
from .schemas import OverviewResponse
from app.analytics.service.errors import get_error_analytics as get_error_analytics_service
from .service.timeseries import get_timeseries
from app.analytics.service.traces import get_traces

router = APIRouter( prefix="/analytics", tags=["Analytics"] )

@router.get("/overview", response_model=OverviewResponse)
async def overview(
    filters: AnalyticsFilter = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_overview(
    db=db,
    user=current_user,
    filters=filters,
)

@router.get( "/models", response_model=list[ModelAnalyticsResponse], )
async def models(
    filters: AnalyticsFilter = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_models(
        db=db,
        user=current_user,
        filters=filters,
    )

@router.get(
    "/providers",
    response_model=list[ProviderAnalyticsResponse],
)
async def providers(
    filters: AnalyticsFilter = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_providers(
        db=db,
        user=current_user,
        filters=filters,
    )

@router.get(
    "/timeseries",
    response_model=list[TimeSeriesResponse],
)
async def get_time_series(
    filters: AnalyticsFilter = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_timeseries(
        db=db,
        user=current_user,
        filters=filters,
    )

@router.get(
    "/errors",
    response_model=list[ErrorAnalyticsResponse],
)
async def get_error_analytics(
    filters: AnalyticsFilter = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_error_analytics_service(
        db=db,
        user=current_user,
        filters=filters,
    )

@router.get(
    "/traces",
    response_model=list[TraceAnalyticsResponse],
)
async def traces(
    filters: AnalyticsFilter = Depends(),

    db: AsyncSession = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    return await get_traces(
        db=db,
        user=current_user,
        filters=filters,
    )