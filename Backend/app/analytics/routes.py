from fastapi import APIRouter,Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .schemas import ModelAnalyticsResponse
from app.dependencies.current_user import get_current_user
from app.database import get_db
from analytics.schemas import AnalyticsFilter,ProviderAnalyticsResponse,ErrorAnalyticsResponse,TimeSeriesResponse
from app.models import User
from service.models import get_models
from service.overview import get_overview
from service.providers import get_providers
from .schemas import OverviewResponse
from service.errors import get_error_analytics
from service.timeseries import get_timeseries

router = APIRouter( prefix="/analytics", tags=["Analytics"] )


@router.get("/overview", response_model=OverviewResponse)
async def overview(
    # start: datetime | None = Query(
    #     None,
    #     description="Start datetime (inclusive)"
    # ),
    # end: datetime | None = Query(
    #     None,
    #     description="End datetime (inclusive)"
    # ),

    # provider: str | None = Query(
    #     None,
    #     description="Filter by provider"
    # ),
    # model: str | None = Query(
    #     None,
    #     description="Filter by model"
    # ),
    # status: TraceStatus | None = Query(
    #     None,
    #     description="Filter by request status"
    # ),
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
    return await get_error_analytics(
        db=db,
        user=current_user,
        filters=filters,
    )