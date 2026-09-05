import dotenv
import os

from groq import Groq

import traceforge as traceforge
dotenv.load_dotenv()

GROQ_API_KEY = os.getenv("TEST_GROQ")
TRACEFORGE_API_KEY = os.getenv("TEST_API_KEY")


traceforge.init(
    api_key=TRACEFORGE_API_KEY,
    endpoint="http://localhost:8000",
)

client = Groq(
    api_key=GROQ_API_KEY,
)

traceforge.instrument_groq(
    client
)

print("Sending sync request...")

response = client.chat.completions.create(

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

traceforge.flush_sync()

print("\nSync trace flushed.")