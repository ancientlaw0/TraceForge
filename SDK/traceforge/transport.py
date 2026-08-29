import httpx
from traceforge.config import get_config
from traceforge.trace import Trace

class HTTPTransport:
    def __init__(
        self,
        timeout: float = 5.0,
    ):
        self.timeout = timeout

    async def send(
        self,
        trace: Trace,
    ) -> None:
        config = get_config()
        payload = {
            "trace_id": str(trace.trace_id),
            "provider": trace.provider,
            "model": trace.model,
            "prompt": trace.prompt,
            "response": trace.response,
            "latency_ms": trace.latency_ms,
            "input_tokens": trace.input_tokens,
            "output_tokens": trace.output_tokens,
            "cost": trace.cost,
            "status": trace.status.value,
            "error_message": trace.error_message,
            "metadata_trace": trace.metadata_trace,
        }

        async with httpx.AsyncClient(
            timeout=self.timeout
        ) as client:

            response = await client.post(
                f"{config.endpoint}/traces/",
                json=payload,
                headers={
                    "Authorization": (
                        f"Bearer {config.api_key}"
                    ),
                },
            )
            response.raise_for_status()