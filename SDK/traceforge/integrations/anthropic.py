from typing import Any
from importlib import import_module

from traceforge.integrations.base import ProviderIntegration


class AnthropicIntegration(ProviderIntegration):

    @property
    def provider(self) -> str:
        return "anthropic"

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

        system = kwargs.get("system")

        if system:
            if isinstance(system, str):
                prompt_parts.append(
                    f"system: {system}"
                )
            elif isinstance(system, list):
                for block in system:
                    if isinstance(block, dict):
                        if block.get("type") == "text":
                            prompt_parts.append(
                                f"system: {block.get('text', '')}"
                            )

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

            elif isinstance(content, list):

                for block in content:

                    if not isinstance(block, dict):
                        continue

                    if block.get("type") == "text":
                        prompt_parts.append(
                            f"{role}: {block.get('text', '')}"
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

        response_parts = []

        content = getattr(
            response,
            "content",
            [],
        )

        for block in content:

            if getattr(
                block,
                "type",
                None,
            ) == "text":

                text = getattr(
                    block,
                    "text",
                    "",
                )

                if text:
                    response_parts.append(text)

        response_text = "\n".join(
            response_parts
        )

        usage = getattr(
            response,
            "usage",
            None,
        )

        input_tokens = int(
            getattr(
                usage,
                "input_tokens",
                0,
            )
            or 0
        )

        output_tokens = int(
            getattr(
                usage,
                "output_tokens",
                0,
            )
            or 0
        )

        metadata = {
            "integration": "anthropic",
            "response_id": getattr(
                response,
                "id",
                None,
            ),
            "stop_reason": getattr(
                response,
                "stop_reason",
                None,
            ),
            "stop_sequence": getattr(
                response,
                "stop_sequence",
                None,
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
            # USD per 1M tokens

            "claude-opus-4-8": {
                "input": 5.00,
                "output": 25.00,
            },

            "claude-opus-4-7": {
                "input": 5.00,
                "output": 25.00,
            },

            "claude-opus-4-6": {
                "input": 5.00,
                "output": 25.00,
            },

            "claude-sonnet-5": {
                "input": 2.00,
                "output": 10.00,
            },

            "claude-sonnet-4-6": {
                "input": 3.00,
                "output": 15.00,
            },

            "claude-haiku-4-5": {
                "input": 1.00,
                "output": 5.00,
            },

            "claude-fable-5": {
                "input": 10.00,
                "output": 50.00,
            },

            "claude-fable-5-1": {
                "input": 10.00,
                "output": 50.00,
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
            "anthropic.resources.messages"
        )

        return (
            resources.AsyncMessages,
            "create",
        )