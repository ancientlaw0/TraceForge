from typing import Any

from traceforge.integrations.base import ProviderIntegration


class GroqIntegration(ProviderIntegration):

    # =========================================================
    # PROVIDER
    # =========================================================

    @property
    def provider(self) -> str:
        return "groq"

    # =========================================================
    # REQUEST EXTRACTION
    # =========================================================

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

        prompt_parts: list[str] = []

        if isinstance(messages, list):

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

        else:

            prompt_parts.append(
                str(messages)
            )

        prompt = "\n".join(
            prompt_parts
        )

        return (
            str(model),
            prompt,
        )

    # =========================================================
    # RESPONSE EXTRACTION
    # =========================================================

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

        choices = getattr(
            response,
            "choices",
            None,
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

        finish_reason = None

        if choices:

            finish_reason = getattr(
                choices[0],
                "finish_reason",
                None,
            )

            if finish_reason is not None:

                finish_reason = str(
                    finish_reason
                )

        metadata: dict[str, Any] = {

            "integration": "groq",

            "response_id": getattr(
                response,
                "id",
                None,
            ),

            "response_model": getattr(
                response,
                "model",
                None,
            ),

            "finish_reason": finish_reason,

            "system_fingerprint": getattr(
                response,
                "system_fingerprint",
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

        # Prices are USD per 1 million tokens.

        pricing = {

            "llama-3.1-8b-instant": {
                "input": 0.05,
                "output": 0.08,
            },

            "openai/gpt-oss-120b": {
                "input": 0.15,
                "output": 0.60,
            },

            "llama-3.3-70b-versatile": {
                "input": 0.59,
                "output": 0.79,
            },

               "qwen/qwen3.6-27b": {
                "input": 0.60,
                "output": 3.00,
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


    def install(
        self,
        patcher,
        client,
    ) -> None:

        patcher.patch(
            client.chat.completions,
            "create",
        )