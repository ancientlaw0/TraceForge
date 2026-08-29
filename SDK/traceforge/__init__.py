from traceforge.config import configure
from traceforge.patcher import Patcher
from traceforge.recorder import Recorder
from traceforge.transport import HTTPTransport


_initialized = False
_recorder = None


def init(
    api_key: str,
    endpoint: str = "http://localhost:8000",
):
    global _initialized
    global _recorder

    if _initialized:
        return

    configure(
        api_key=api_key,
        endpoint=endpoint,
    )

    transport = HTTPTransport()

    _recorder = Recorder(
        transport=transport,
    )

    _initialized = True


def instrument_gemini(
    client,
):

    if not _initialized:
        raise RuntimeError(
            "Call traceforge.init() first."
        )

    from traceforge.integrations.gemini import (
        GeminiIntegration,
    )

    integration = GeminiIntegration()

    patcher = Patcher(
        integration=integration,
        recorder=_recorder,
    )

    integration.install(
        patcher,
        client,
    )