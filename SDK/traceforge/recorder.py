import asyncio

from traceforge.trace import Trace
from traceforge.transport import HTTPTransport


class Recorder:

    def __init__(
        self,
        transport: HTTPTransport,
    ):
        self.transport = transport

        self._tasks: set[
            asyncio.Task
        ] = set()

    def record(
        self,
        trace: Trace,
    ) -> None:

        try:

            loop = asyncio.get_running_loop()

            task = loop.create_task(
                self._send(trace)
            )

            self._tasks.add(task)

            task.add_done_callback(
                self._tasks.discard
            )

        except RuntimeError:

            pass

    async def _send(
        self,
        trace: Trace,
    ) -> None:
        try:

            await self.transport.send(
                trace
            )

        except Exception as error:

            print(
                "TraceForge telemetry error:",
                str(error),
            )

    async def flush(
        self,
    ) -> None:

        if not self._tasks:
            return

        tasks = list(
            self._tasks
        )

        await asyncio.gather(
            *tasks,
            return_exceptions=True,
        )