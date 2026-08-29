import asyncio
from traceforge.trace import Trace
from traceforge.transport import HTTPTransport

class Recorder:
    def __init__(
        self,
        transport: HTTPTransport,
    ):
        self.transport = transport

    def record(
        self,
        trace: Trace,
    ) -> None:
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(
                self._send(trace)
            )
        except RuntimeError:
                    # sync handling later
            pass

    async def _send(
        self,
        trace: Trace,
    ) -> None:
        try:
            await self.transport.send( trace )
        except Exception as error:
            print(
                "TraceForge telemetry error:",
                str(error),
            )