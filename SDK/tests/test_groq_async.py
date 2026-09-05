import asyncio
import dotenv
import os

from groq import AsyncGroq

import traceforge as traceforge

dotenv.load_dotenv()

GROQ_API_KEY = os.getenv("TEST_GROQ")
TRACEFORGE_API_KEY = os.getenv("TEST_API_KEY")


async def main():

    traceforge.init(
        api_key=TRACEFORGE_API_KEY,
        endpoint="http://localhost:8000",
    )

    client = AsyncGroq(
        api_key=GROQ_API_KEY,
    )

    traceforge.instrument_groq(
        client
    )

    print("Sending async request...")

    response = await client.chat.completions.create(

        model="openai/gpt-oss-20b",

        messages=[
            {
                "role": "user",
                "content": "Explain recursion in one sentence.",
            }
        ],
    )

    print("\nGroq response:")
    print(
        response.choices[0].message.content
    )

    await traceforge.flush()

    print("\nAsync trace flushed.")


if __name__ == "__main__":
    asyncio.run(main())