import asyncio
from google import genai
import traceforge
import dotenv

dotenv.load_dotenv()

async def main():

    traceforge.init(
        api_key=dotenv.getenv("TEST_API_KEY"),
        endpoint="http://localhost:8000",
    )

    client = genai.Client(
        api_key=dotenv.getenv("TEST_GEMINI"),
    )

    traceforge.instrument_gemini(
        client
    )

    response = await client.aio.models.generate_content(
        model="gemini-3.7-flash",
        contents="Explain recursion in one sentence.",
    )

    print(
        response.text
    )

    # Only for this short-lived test process.
    await asyncio.sleep(1)


if __name__ == "__main__":
    asyncio.run(main())