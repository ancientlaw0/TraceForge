import asyncio

from traceforge.config import configure
from traceforge.trace import Trace, TraceStatus
from traceforge.transport import HTTPTransport
import os
import dotenv
dotenv.load_dotenv()

TRACEFORGE_API_KEY = os.getenv("TEST_API_KEY")


async def main():

    configure(
        api_key=TRACEFORGE_API_KEY,
        endpoint="http://127.0.0.1:8000",
    )

    trace = Trace(
        trace_id=__import__("uuid").uuid4(),

        provider="groq",

        model="qwen/qwen3.6-27b",

        prompt="test prompt",

        response="test response",

        latency_ms=123.45,

        input_tokens=10,

        output_tokens=20,

        cost=0.001,

        status=TraceStatus.SUCCESS,

        error_message=None,

        metadata_trace={
            "integration": "groq",
            "test": True,
        },
    )

    transport = HTTPTransport()

    print("SENDING TRACE")

    try:

        await transport.send(trace)

        print("TRACE SENT SUCCESSFULLY")

    except Exception as error:

        print(
            "TRANSPORT ERROR:",
            repr(error),
        )


if __name__ == "__main__":
    asyncio.run(main())