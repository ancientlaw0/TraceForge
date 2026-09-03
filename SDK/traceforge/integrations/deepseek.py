from typing import Any
from importlib import import_module

from traceforge.integrations.base import ProviderIntegration


class DeepSeekIntegration(ProviderIntegration):

    @property
    def provider(self) -> str:
        return "deepseek"

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

        prompt = "\n".join(prompt_parts)

        return model, prompt

    def extract_response(
        self,
        response: Any,
    ) -> tuple[str, int, int, dict[str, Any]]:

        response_text = ""

        choices = getattr(
            response,
            "choices",
            [],
        )

        if choices:

            choice = choices[0]

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
                    response_text = str(content)

        usage = getattr(
            response,
            "usage",
            None,
        )

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
            "integration": "deepseek",
            "response_id": getattr(
                response,
                "id",
                None,
            ),
            "finish_reason": (
                getattr(
                    choices[0],
                    "finish_reason",
                    None,
                )
                if choices
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

        # USD per 1M tokens.
        pricing = {
            "deepseek-v4-flash": {
                "input": 0.22,
                "output": 0.66,
            },
            "deepseek-v4-pro": {
                "input": 0.66,
                "output": 1.98,
            },
            "deepseek-v4-flash-vision-exp": {
                "input": 0.22,
                "output": 0.66,
            },
        }

        model_pricing = pricing.get(model)

        if model_pricing is None:
            return 0.0

        input_cost = (
            input_tokens
            / 1_000_000
            * model_pricing["input"]
        )

        output_cost = (
            output_tokens
            / 1_000_000
            * model_pricing["output"]
        )

        return input_cost + output_cost

    def extract_error(
        self,
        error: Exception,
    ) -> str:
        return str(error)

    def patch_target(self):

        resources = import_module(
            "openai.resources.chat.completions"
        )

        return (
            resources.AsyncCompletions,
            "create",
        )