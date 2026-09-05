

import os
import dotenv

from openai import OpenAI

import traceforge

dotenv.load_dotenv()


traceforge.init(
    api_key=os.getenv("TEST_API_KEY"),
    endpoint="http://localhost:8000",
)

client = OpenAI(
    api_key=os.getenv("TEST_DEEPSEEK"),
    base_url="https://api.deepseek.com",
)

traceforge.instrument_deepseek(
    client
)

print("Sending sync request...")

try:

    response = client.chat.completions.create(
        model="deepseek-v4-flash",
        messages=[
            {
                "role": "user",
                "content": "Explain recursion in one sentence.",
            }
        ],
    )

    print("\nDeepSeek response:")
    print(
        response.choices[0].message.content
    )

    traceforge.flush_sync()

    print("\nSync trace flushed.")

except Exception as error:

    print("\nDeepSeek request failed:")
    print(error)