from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID

from app.models import TraceStatus

class TraceCreate(BaseModel):

    trace_id: UUID
    provider: str
    model: str
    prompt: str
    response: str
    latency_ms: float
    input_tokens: int
    output_tokens: int
    cost: float
    status: TraceStatus
    error_message: Optional[str] = None
    metadata_trace: Optional[dict] = None