from traceforge.config import configure
from traceforge.patcher import Patcher
from traceforge.recorder import Recorder
from traceforge.transport import HTTPTransport
from traceforge.integrations.groq import GroqIntegration

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




def instrument_groq(
    client,
):

    if not _initialized:
        raise RuntimeError(
            "Call traceforge.init() first."
        )

    integration = GroqIntegration()

    patcher = Patcher(
        integration=integration,
        recorder=_recorder,
    )

    integration.install(
        patcher,
        client,
    )

def instrument_ollama(client):
    if not _initialized:
        raise RuntimeError("Call traceforge.init() first.")

    from traceforge.integrations.ollama import OllamaIntegration

    integration = OllamaIntegration()

    patcher = Patcher(
        integration=integration,
        recorder=_recorder,
    )

    integration.install(patcher, client)

def instrument_anthropic(client):
    if not _initialized:
        raise RuntimeError( "Call traceforge.init() first." )
    from traceforge.integrations.anthropic import (
        AnthropicIntegration,
    )

    integration = AnthropicIntegration()

    patcher = Patcher(
        integration=integration,
        recorder=_recorder,
    )

    integration.install(
        patcher,
        client,
    )

def instrument_deepseek(client):
    if not _initialized:
        raise RuntimeError( "Call traceforge.init() first." )

    from traceforge.integrations.deepseek import (
        DeepSeekIntegration,
    )

    integration = DeepSeekIntegration()

    patcher = Patcher(
        integration=integration,
        recorder=_recorder,
    )

    integration.install(
        patcher,
        client,
    )

async def flush():
    if _recorder is not None:
        await _recorder.flush()