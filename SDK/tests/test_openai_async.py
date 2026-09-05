import asyncio
import os
import dotenv

from openai import AsyncOpenAI

import traceforge

dotenv.load_dotenv()


async def main():

    traceforge.init(
        api_key=os.getenv("TEST_API_KEY"),
        endpoint="http://localhost:8000",
    )

    client = AsyncOpenAI(
        api_key=os.getenv("TEST_OPENAI"),
    )

    traceforge.instrument_openai(
        client
    )

    print("Sending async request...")

    try:

        response = await client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "user",
                    "content": "Explain recursion in one sentence.",
                }
            ],
        )

        print("\nOpenAI response:")
        print(
            response.choices[0].message.content
        )

        await traceforge.flush()

        print("\nAsync trace flushed.")

    except Exception as error:

        print("\nOpenAI request failed:")
        print(error)


if __name__ == "__main__":

    asyncio.run(main())