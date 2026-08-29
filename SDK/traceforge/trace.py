from dataclasses import dataclass, field
from enum import Enum
from typing import Any
from uuid import UUID

class TraceStatus(Enum):
    SUCCESS = "success"
    ERROR = "error"
    TIMEOUT = "timeout"

@dataclass
class Trace:
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
    error_message: str | None = None
    metadata_trace: dict[str, Any] = field( default_factory=dict )