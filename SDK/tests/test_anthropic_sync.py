import os
import dotenv

from anthropic import Anthropic

import traceforge

dotenv.load_dotenv()


traceforge.init(
    api_key=os.getenv("TEST_API_KEY"),
    endpoint="http://localhost:8000",
)

client = Anthropic(
    api_key=os.getenv("TEST_ANTHROPIC"),
)

traceforge.instrument_anthropic(
    client
)

print("Sending sync request...")

try:

    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=100,
        messages=[
            {
                "role": "user",
                "content": "Explain recursion in one sentence.",
            }
        ],
    )

    print("\nAnthropic response:")
    print(response.content[0].text)

    traceforge.flush_sync()

    print("\nSync trace flushed.")

except Exception as error:

    print("\nAnthropic request failed:")
    print(error)