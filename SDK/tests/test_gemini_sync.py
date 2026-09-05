import os
import dotenv

from google import genai

import traceforge as traceforge

dotenv.load_dotenv()


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

print("Sending sync request...")

try:

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents="Explain recursion in one sentence.",
    )

    print("\nGemini response:")
    print(response.text)

    traceforge.flush_sync()

    print("\nSync trace flushed.")

except Exception as error:

    print("\nGemini request failed:")
    print(error)