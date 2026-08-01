from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.current_user import get_current_user
from app.models import User

from app.usage.repository import UsageRepository
from app.usage.schemas import (
    UsageLimitResponse,
    UsageLimitUpdate,
)
from app.usage.services import UsageService

router = APIRouter(
    prefix="/usage",
    tags=["Usage"],
)


def get_usage_service(
    db: AsyncSession = Depends(get_db),
) -> UsageService:
    repository = UsageRepository(db)
    return UsageService(repository)


@router.get(
    "/limits",
    response_model=UsageLimitResponse,
)
async def get_usage_limits(
    current_user: User = Depends(get_current_user),
    service: UsageService = Depends(get_usage_service),
):
    return await service.get_limits(current_user.id)


@router.patch(
    "/limits",
    response_model=UsageLimitResponse,
)
async def update_usage_limits(
    payload: UsageLimitUpdate,
    current_user: User = Depends(get_current_user),
    service: UsageService = Depends(get_usage_service),
):
    return await service.update_limits(
        current_user.id,
        payload,
    )


@router.delete(
    "/limits",
)
async def delete_usage_limits(
    current_user: User = Depends(get_current_user),
    service: UsageService = Depends(get_usage_service),
):
    await service.delete_limits(current_user.id)

    return {
        "message": "Usage limits deleted successfully."
    }