from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Alert, User
from app.alerts.schemas import AlertCreate, AlertUpdate

def create_alert(
    db: Session,
    user: User,
    alert_data: AlertCreate,
) -> Alert:

    alert = Alert( user_id=user.id, **alert_data.model_dump(), )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert

def get_user_alerts(
    db: Session,
    user: User,
) -> list[Alert]:

    return (
        db.query(Alert)
        .filter(Alert.user_id == user.id)
        .all()
    )

def get_alert(
    db: Session,
    user: User,
    alert_id: int,
) -> Alert:

    alert = (
        db.query(Alert)
        .filter(
            Alert.id == alert_id,
            Alert.user_id == user.id,
        )
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    return alert

def update_alert(
    db: Session,
    user: User,
    alert_id: int,
    alert_update: AlertUpdate,
) -> Alert:

    alert = get_alert(db, user, alert_id)

    update_data = alert_update.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(alert, key, value)

    db.commit()
    db.refresh(alert)

    return alert

def delete_alert(
    db: Session,
    user: User,
    alert_id: int,
) -> None:

    alert = get_alert(db, user, alert_id)

    db.delete(alert)
    db.commit()