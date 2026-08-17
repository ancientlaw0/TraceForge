from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Alert, User
from app.alerts.schemas import AlertCreate, AlertUpdate


async def create_alert(
    db: AsyncSession,
    user: User,
    alert_data: AlertCreate,
) -> Alert:

    alert = Alert(
        user_id=user.id,
        **alert_data.model_dump(),
    )

    db.add(alert)

    await db.commit()
    await db.refresh(alert)

    return alert


async def get_user_alerts(
    db: AsyncSession,
    user: User,
) -> list[Alert]:

    stmt = (
        select(Alert)
        .where(Alert.user_id == user.id)
        .order_by(Alert.created_at.desc())
    )

    result = await db.execute(stmt)

    return result.scalars().all()


async def get_alert(
    db: AsyncSession,
    user: User,
    alert_id: int,
) -> Alert:

    stmt = (
        select(Alert)
        .where(
            Alert.id == alert_id,
            Alert.user_id == user.id,
        )
    )

    result = await db.execute(stmt)

    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    return alert


async def update_alert(
    db: AsyncSession,
    user: User,
    alert_id: int,
    alert_update: AlertUpdate,
) -> Alert:

    alert = await get_alert(
        db,
        user,
        alert_id,
    )

    update_data = alert_update.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(alert, key, value)

    await db.commit()
    await db.refresh(alert)

    return alert


async def delete_alert(
    db: AsyncSession,
    user: User,
    alert_id: int,
) -> None:

    alert = await get_alert(
        db,
        user,
        alert_id,
    )

    await db.delete(alert)
    await db.commit()