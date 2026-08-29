from typing import Any
from pydantic import BaseModel
from enum import Enum
from datetime import datetime
from app.auth.schemas.traces import TraceStatus

class SummaryResponse(BaseModel):
    total_requests: int
    successful_requests: int
    error_requests: int
    timeout_requests: int
    success_rate: float
    error_rate: float
    timeout_rate: float
    total_cost: float
    total_input_tokens: int
    total_output_tokens: int


class LatencyResponse(BaseModel):
    average: float
    p50: float
    p95: float
    p99: float


class OverviewResponse(BaseModel):
    summary: SummaryResponse
    latency: LatencyResponse

class TimeFilter(str, Enum):
    hour = "hour"      # Last 1 hour
    day = "day"        # Last 24 hours
    week = "week"      # Last 7 days
    month = "month"    # Last 30 days
    all = "all"        # All time
    custom = "custom"

class AnalyticsFilter(BaseModel):
    provider: str | None = None
    model: str | None = None
    status: TraceStatus | None = None
    time: TimeFilter = TimeFilter.week
    start: datetime | None = None
    end: datetime | None = None

class ModelAnalyticsResponse(BaseModel):
    provider: str
    model: str
    requests: int
    successful_requests: int
    error_requests: int
    timeout_requests: int
    average_latency: float
    p95_latency: float
    total_cost: float
    total_input_tokens: int
    total_output_tokens: int
    error_rate: float
    timeout_rate: float

from pydantic import BaseModel


class ProviderAnalyticsResponse(BaseModel):
    provider: str
    requests: int
    successful_requests: int
    error_requests: int
    timeout_requests: int
    average_latency: float
    p95_latency: float
    total_cost: float
    total_input_tokens: int
    total_output_tokens: int
    error_rate: float
    timeout_rate: float

class TimeSeriesResponse(BaseModel):
    timestamp: datetime

    requests: int

    successful_requests: int
    error_requests: int
    timeout_requests: int

    average_latency: float

    total_cost: float

    total_input_tokens: int
    total_output_tokens: int

class ErrorAnalyticsResponse(BaseModel):
    error_message: str
    count: int

class TraceAnalyticsResponse(BaseModel):
    trace_id: str
    provider: str
    model: str
    prompt: str
    response: str
    latency_ms: float
    input_tokens: int
    output_tokens: int
    cost: float
    status: TraceStatus
    error_message: str | None
    metadata_trace: dict[str, Any] | None
    created_at: datetime