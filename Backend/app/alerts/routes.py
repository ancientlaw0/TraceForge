from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.current_user import get_current_user
from app.models import User
from app.alerts.schemas import (
    AlertCreate,
    AlertUpdate,
    AlertResponse,
)
from app.alerts.service import (
    create_alert,
    get_alert,
    get_user_alerts,
    update_alert,
    delete_alert,
)


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
)


@router.post(
    "/",
    response_model=AlertResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create(
    alert: AlertCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_alert(
        db,
        current_user,
        alert,
    )


@router.get(
    "/",
    response_model=list[AlertResponse],
)
async def list_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_user_alerts(
        db,
        current_user,
    )


@router.get(
    "/{alert_id}",
    response_model=AlertResponse,
)
async def get(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_alert(
        db,
        current_user,
        alert_id,
    )


@router.patch(
    "/{alert_id}",
    response_model=AlertResponse,
)
async def update(
    alert_id: int,
    alert: AlertUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await update_alert(
        db,
        current_user,
        alert_id,
        alert,
    )


@router.delete(
    "/{alert_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await delete_alert(
        db,
        current_user,
        alert_id,
    )