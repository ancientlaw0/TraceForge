import time
import uuid
from functools import wraps
from typing import Any
from traceforge.integrations.base import ProviderIntegration
from traceforge.recorder import Recorder
from traceforge.trace import Trace, TraceStatus

class Patcher:

    def __init__(
        self,
        integration: ProviderIntegration,
        recorder: Recorder,
    ):
        self.integration = integration
        self.recorder = recorder
        self._patched: set[ tuple[int, str] ] = set()

    def patch(
        self,
        target: Any,
        attribute: str,
    ) -> None:

        patch_key = (
            id(target),
            attribute,
        )

        if patch_key in self._patched:
            return

        original = getattr(
            target,
            attribute,
        )

        @wraps(original)
        async def wrapper(
            *args,
            **kwargs,
        ):

            start = time.monotonic()
            trace_id = uuid.uuid4()

            try:

                model, prompt = (
                    self.integration.extract_request(
                        args,
                        kwargs,
                    )
                )

            except Exception:

                model = kwargs.get(
                    "model",
                    "unknown",
                )

                prompt = ""

            try:

                response = await original(
                    *args,
                    **kwargs,
                )

            except Exception as error:

                latency_ms = (
                    time.monotonic()
                    - start
                ) * 1000

                try:

                    error_message = (
                        self.integration.extract_error(
                            error
                        )
                    )

                except Exception:
                    error_message = str(error)

                trace = Trace(
                    trace_id=trace_id,
                    provider= self.integration.provider,
                    model=model,
                    prompt=prompt,
                    response="",
                    latency_ms=latency_ms,
                    input_tokens=0,
                    output_tokens=0,
                    cost=0.0,
                    status=TraceStatus.ERROR,
                    error_message=error_message,
                    metadata_trace={},
                )
                self.recorder.record(trace)
                raise

            latency_ms = ( time.monotonic() - start ) * 1000
            try:

                ( response_text, input_tokens, output_tokens, metadata ) = self.integration.extract_response( response ) 
                cost = (
                    self.integration.calculate_cost(
                        model=model,
                        input_tokens=input_tokens,
                        output_tokens=output_tokens,
                    )
                )
                trace = Trace(
                    trace_id=trace_id,
                    provider=self.integration.provider ,
                    model=model,
                    prompt=prompt,
                    response=response_text,
                    latency_ms=latency_ms,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    cost=cost,
                    status=TraceStatus.SUCCESS,
                    error_message=None,
                   metadata_trace=metadata,
                )
                self.recorder.record(trace)
            except Exception:
                #Traceforge error should not break the application.
                pass

            return response

        setattr(
            target,
            attribute,
            wrapper,
        )
        self._patched.add(
            patch_key
        )