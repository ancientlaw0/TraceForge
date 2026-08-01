from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict

class UsageLimitBase(BaseModel):
    enabled: bool = True
    # Request Limits
    max_requests_per_minute: Optional[int] = None
    max_requests_per_hour: Optional[int] = None
    max_requests_per_day: Optional[int] = None
    # Token Limits
    max_input_tokens_per_day: Optional[int] = None
    max_output_tokens_per_day: Optional[int] = None
    # Cost Limits
    max_cost_per_day: Optional[Decimal] = None
    # Behaviou
    block_on_limit: bool = True

class UsageLimitCreate(UsageLimitBase):
    pass

class UsageLimitUpdate(BaseModel):
    enabled: Optional[bool] = None
    max_requests_per_minute: Optional[int] = None
    max_requests_per_hour: Optional[int] = None
    max_requests_per_day: Optional[int] = None
    max_input_tokens_per_day: Optional[int] = None
    max_output_tokens_per_day: Optional[int] = None
    max_cost_per_day: Optional[Decimal] = None
    block_on_limit: Optional[bool] = None

class UsageLimitResponse(UsageLimitBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UsageIncrement(BaseModel):

    requests: int = 1
    input_tokens: int
    output_tokens: int
    cost: Decimal

