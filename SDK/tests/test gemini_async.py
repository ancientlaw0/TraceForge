import asyncio
import os
import dotenv

from google import genai

import traceforge 

dotenv.load_dotenv()


async def main():

    traceforge.init(
        api_key=os.getenv("TEST_API_KEY"),
        endpoint="http://localhost:8000",
    )

    client = genai.Client(
        api_key=os.getenv("TEST_GEMINI"),
    )

    traceforge.instrument_gemini(
        client
    )

    print("Sending async request...")

    try:

        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents="Explain recursion in one sentence.",
        )

        print("\nGemini response:")
        print(response.text)

        await traceforge.flush()

        print("\nAsync trace flushed.")

    except Exception as error:

        print("\nGemini request failed:")
        print(error)


if __name__ == "__main__":

    asyncio.run(main())