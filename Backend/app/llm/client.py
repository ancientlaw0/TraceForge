from groq import AsyncGroq
from app.core.config import settings


class LLMClient:
    def __init__(self):
        self.client = AsyncGroq(
            api_key=settings.NVIDIA_API_KEY,
        )

        self.model = settings.LLM_MODEL

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 1024,
    ) -> str:

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return response.choices[0].message.content.strip()