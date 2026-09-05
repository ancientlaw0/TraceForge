from locust import HttpUser, task, between
import uuid
import random
import os
import dotenv

dotenv.load_dotenv()

API_KEY = os.getenv("TEST_API_KEY")


class TraceForgeUser(HttpUser):

    wait_time = between(1,2)

    @task
    def send_trace(self):

        payload = {
            "trace_id": str(uuid.uuid4()),

            "provider": random.choice([
                "openai",
                "anthropic",
                "google",
            ]),

            "model": random.choice([
                "gpt-4o",
                "claude-3-5-sonnet",
                "gemini-1.5-pro",
            ]),

            "prompt": "Load test request",
            "response": "Load test response",

            "latency_ms": random.uniform(
                100,
                1500,
            ),

            "input_tokens": random.randint(
                50,
                1000,
            ),

            "output_tokens": random.randint(
                20,
                500,
            ),

            "cost": round(
                random.uniform(
                    0.0001,
                    0.05,
                ),
                6,
            ),

            "status": "success",
            "error_message": None,

            "metadata_trace": {
                "source": "locust",
                "test": True,
            },
        }

        with self.client.post(
            "/traces/",
            json=payload,
            headers={
                "Authorization": f"Bearer {API_KEY}",
            },
            name="/traces",
            catch_response=True,
        ) as response:

            if response.status_code == 202:
                response.success()
            else:
                response.failure(
                    f"Expected 202, got {response.status_code}: "
                    f"{response.text[:200]}"
                )