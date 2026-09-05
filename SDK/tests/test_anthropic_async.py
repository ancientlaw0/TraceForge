import asyncio
import os
import dotenv

from anthropic import AsyncAnthropic

import traceforge

dotenv.load_dotenv()


async def main():

    traceforge.init(
        api_key=os.getenv("TEST_API_KEY"),
        endpoint="http://localhost:8000",
    )

    client = AsyncAnthropic(
        api_key=os.getenv("TEST_ANTHROPIC"),
    )

    traceforge.instrument_anthropic(
        client
    )

    print("Sending async request...")

    try:

        response = await client.messages.create(
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

        await traceforge.flush()

        print("\nAsync trace flushed.")

    except Exception as error:

        print("\nAnthropic request failed:")
        print(error)


if __name__ == "__main__":

    asyncio.run(main())