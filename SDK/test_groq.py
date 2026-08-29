import asyncio
from groq import AsyncGroq
import traceforge
import dotenv
import os
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

    print("Sending request...")

    try:

        response = await client.chat.completions.create(

            model="qwen/qwen3.6-27b",

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
        ##await asyncio.sleep(0) # important to wait for the trace to be sent before the script exits
        print("\nRequest completed.")

    except Exception as error:

        print("\nGroq request failed:")
        print(error)


if __name__ == "__main__":

    asyncio.run(
        main()
    )