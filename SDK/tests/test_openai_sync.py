
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
    api_key=os.getenv("TEST_OPENAI"),
)

traceforge.instrument_openai(
    client
)

print("Sending sync request...")

try:

    response = client.chat.completions.create(
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

    traceforge.flush_sync()

    print("\nSync trace flushed.")

except Exception as error:

    print("\nOpenAI request failed:")
    print(error)