from pydantic import BaseModel

class SummaryResponse(BaseModel):
    requests: int
    success: int
    failed: int
    avg_latency: float
    cost: float
    input_tokens: int
    output_tokens: int
    total_tokens: int

class GraphPoint(BaseModel):
    minute: str
    requests: int

class ProviderStat(BaseModel):
    provider: str
    requests: int
    cost: float

class ModelStat(BaseModel):
    model: str
    requests: int
    cost: float

class LiveResponse(BaseModel):
    summary: SummaryResponse
    graph: list[GraphPoint]
    providers: list[ProviderStat]
    models: list[ModelStat]