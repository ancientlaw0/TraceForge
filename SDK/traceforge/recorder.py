import asyncio
from concurrent.futures import ThreadPoolExecutor, Future

from traceforge.trace import Trace
from traceforge.transport import HTTPTransport


class Recorder:

    def __init__(self, transport: HTTPTransport):
        self.transport = transport

        self._tasks: set[asyncio.Task] = set()

        self._sync_tasks: set[Future] = set()

        self._executor = ThreadPoolExecutor(
            max_workers=2
        )

    def record(self, trace: Trace) -> None:

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

            task = self._executor.submit(
                self._send_sync,
                trace,
            )

            self._sync_tasks.add(task)

            task.add_done_callback(
                self._sync_tasks.discard
            )

    async def _send(self, trace: Trace) -> None:
        try:
            await self.transport.send(trace)

        except Exception as error:
            print(
                "TraceForge telemetry error:",
                str(error),
            )

    def _send_sync(self, trace: Trace) -> None:
        try:
            self.transport.send_sync(trace)

        except Exception as error:
            print(
                "TraceForge telemetry error:",
                str(error),
            )

    async def flush(self) -> None:

        if not self._tasks:
            return

        tasks = list(self._tasks)

        await asyncio.gather(
            *tasks,
            return_exceptions=True,
        )

    def flush_sync(self) -> None:

        if not self._sync_tasks:
            return

        tasks = list(self._sync_tasks)

        for task in tasks:
            task.result()