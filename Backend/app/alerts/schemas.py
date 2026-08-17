from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models import AlertMetric, AlertOperator, AlertWindow


class AlertCreate(BaseModel):
    metric: AlertMetric
    operator: AlertOperator = AlertOperator.GREATER_THAN
    threshold_value: Decimal
    window_minutes: AlertWindow
    enabled: bool = True
    cooldown_minutes: int = 30


class AlertUpdate(BaseModel):
    metric: AlertMetric | None = None
    operator: AlertOperator | None = None
    threshold_value: Decimal | None = None
    window_minutes: AlertWindow | None = None
    enabled: bool | None = None
    cooldown_minutes: int | None = None


class AlertResponse(BaseModel):
    id: int
    metric: AlertMetric
    operator: AlertOperator
    threshold_value: Decimal
    window_minutes: AlertWindow
    enabled: bool
    cooldown_minutes: int

    model_config = ConfigDict(from_attributes=True)