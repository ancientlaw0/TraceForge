from typing import Any

from traceforge.integrations.base import ProviderIntegration


class OllamaIntegration(ProviderIntegration):

    @property
    def provider(self) -> str:
        return "ollama"

    def extract_request(
        self,
        args: tuple[Any, ...],
        kwargs: dict[str, Any],
    ) -> tuple[str, str]:

        model = kwargs.get("model", "unknown")

        prompt = kwargs.get("prompt", "")

        if not prompt:
            messages = kwargs.get("messages", [])

            prompt_parts = []

            for message in messages:
                if not isinstance(message, dict):
                    continue

                role = message.get("role", "")
                content = message.get("content", "")

                prompt_parts.append(
                    f"{role}: {content}"
                )

            prompt = "\n".join(prompt_parts)

        return model, str(prompt)

    def extract_response(
        self,
        response: Any,
    ) -> tuple[str, int, int, dict[str, Any]]:

        response_text = getattr(
            response,
            "response",
            "",
        ) or ""

        prompt_eval_count = getattr(
            response,
            "prompt_eval_count",
            0,
        ) or 0

        eval_count = getattr(
            response,
            "eval_count",
            0,
        ) or 0

        input_tokens = int(prompt_eval_count)
        output_tokens = int(eval_count)

        metadata = {
            "integration": "ollama",
            "done": getattr(response, "done", None),
            "done_reason": getattr(
                response,
                "done_reason",
                None,
            ),
            "total_duration": getattr(
                response,
                "total_duration",
                None,
            ),
            "load_duration": getattr(
                response,
                "load_duration",
                None,
            ),
            "prompt_eval_duration": getattr(
                response,
                "prompt_eval_duration",
                None,
            ),
            "eval_duration": getattr(
                response,
                "eval_duration",
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

        # Ollama runs models locally by default,
        # so there is no API token cost.
        return 0.0

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
            client,
            "generate",
        )