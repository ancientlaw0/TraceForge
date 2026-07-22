from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict


class AlertMetric(str, Enum):
    LATENCY_AVG = "latency_avg"
    LATENCY_MAX = "latency_max"
    ERROR_RATE = "error_rate"
    TIMEOUT_RATE = "timeout_rate"
    COST = "cost"
    TOTAL_TOKENS = "total_tokens"


class AlertOperator(str, Enum):
    GREATER_THAN = ">"
    GREATER_THAN_EQUAL = ">="
    LESS_THAN = "<"
    LESS_THAN_EQUAL = "<="


class AlertWindow(int, Enum):
    FIVE = 5
    FIFTEEN = 15
    THIRTY = 30
    SIXTY = 60
    ONE_TWENTY = 120


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