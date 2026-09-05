from typing import Any
from importlib import import_module
from traceforge.integrations.base import ProviderIntegration
class OpenAIIntegration(ProviderIntegration):

    @property
    def provider(self) -> str:
        return "openai"

    def extract_request(
        self,
        args: tuple[Any, ...],
        kwargs: dict[str, Any],
    ) -> tuple[str, str]:

        model = kwargs.get(
            "model",
            "unknown",
        )

        messages = kwargs.get(
            "messages",
            [],
        )

        prompt_parts = []

        for message in messages:

            if not isinstance(message, dict):
                continue

            role = message.get(
                "role",
                "",
            )

            content = message.get(
                "content",
                "",
            )

            if isinstance(content, str):

                prompt_parts.append(
                    f"{role}: {content}"
                )

            else:

                prompt_parts.append(
                    f"{role}: {str(content)}"
                )

        prompt = "\n".join(
            prompt_parts
        )

        return model, prompt

    def extract_response(
        self,
        response: Any,
    ) -> tuple[
        str,
        int,
        int,
        dict[str, Any],
    ]:

        response_text = ""

        if getattr(
            response,
            "choices",
            None,
        ):

            choice = response.choices[0]

            message = getattr(
                choice,
                "message",
                None,
            )

            if message is not None:

                content = getattr(
                    message,
                    "content",
                    None,
                )

                if content is not None:
                    response_text = str(
                        content
                    )

        usage = getattr(
            response,
            "usage",
            None,
        )

        input_tokens = 0
        output_tokens = 0

        if usage is not None:

            input_tokens = int(
                getattr(
                    usage,
                    "prompt_tokens",
                    0,
                )
                or 0
            )

            output_tokens = int(
                getattr(
                    usage,
                    "completion_tokens",
                    0,
                )
                or 0
            )

        metadata = {
            "integration": "openai",
            "response_id": getattr(
                response,
                "id",
                None,
            ),
            "finish_reason": (
                getattr(
                    response.choices[0],
                    "finish_reason",
                    None,
                )
                if getattr(
                    response,
                    "choices",
                    None,
                )
                else None
            ),
        }

        return (
            response_text,
            input_tokens,
            output_tokens,
            metadata,
        )

    def calculate_cost(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
    ) -> float:

        pricing = {
            # GPT-4o
            "gpt-4o": {
                "input": 2.50,
                "output": 10.00,
            },

            # GPT-4.1
            "gpt-4.1": {
                "input": 2.00,
                "output": 8.00,
            },

            # GPT-4.1 Mini
            "gpt-4.1-mini": {
                "input": 0.40,
                "output": 1.60,
            },

            # GPT-4.1 Nano
            "gpt-4.1-nano": {
                "input": 0.10,
                "output": 0.40,
            },

            # GPT-4o Mini
            "gpt-4o-mini": {
                "input": 0.15,
                "output": 0.60,
            },
        }

        model_pricing = pricing.get(
            model
        )

        if model_pricing is None:
            return 0.0

        input_cost = (
            input_tokens / 1_000_000
        ) * model_pricing["input"]

        output_cost = (
            output_tokens / 1_000_000
        ) * model_pricing["output"]

        return round(
            input_cost + output_cost,
            6,
        )

    def extract_error(
        self,
        error: Exception,
    ) -> str:

        return str(error)

    def install( self, patcher, client, ) -> None:
        patcher.patch(
            client.chat.completions,
            "create",
        )