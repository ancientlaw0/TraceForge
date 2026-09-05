import asyncio
import traceforge as traceforge
from openai import AsyncOpenAI
import dotenv

dotenv.load_dotenv()

async def main():

    traceforge.init(
        api_key=dotenv.getenv("TEST_API_KEY"),
        endpoint="http://localhost:8000",
    )

    client = AsyncOpenAI(
        api_key=dotenv.getenv("TEST_OPENAI"),
    )

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": "Explain recursion in one sentence.",
            }
        ],
    )

    print("\nOPENAI RESPONSE:")
    print(
        response.choices[0].message.content
    )


if __name__ == "__main__":
    asyncio.run(main())