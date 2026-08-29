from typing import Any
from importlib import import_module
from traceforge.integrations.base import ProviderIntegration

class GeminiIntegration(ProviderIntegration):

    @property
    def provider(self) -> str:
        return "gemini"

    def extract_request(
        self,
        args,
        kwargs,
    ):

        model = kwargs.get(
            "model",
            "unknown",
        )

        contents = kwargs.get(
            "contents",
            "",
        )

        if isinstance(contents, str):

            prompt = contents

        elif isinstance(contents, list):

            prompt = "\n".join(
                str(item)
                for item in contents
            )

        else:

            prompt = str(contents)

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

        response_text = getattr(
            response,
            "text",
            "",
        ) or ""

        usage = getattr(
            response,
            "usage_metadata",
            None,
        )

        input_tokens = 0
        output_tokens = 0

        if usage is not None:

            input_tokens = int(
                getattr(
                    usage,
                    "prompt_token_count",
                    0,
                )
                or 0
            )

            output_tokens = int(
                getattr(
                    usage,
                    "candidates_token_count",
                    0,
                )
                or 0
            )

        finish_reason = None

        candidates = getattr(
            response,
            "candidates",
            None,
        )

        if candidates:

            finish_reason = getattr(
                candidates[0],
                "finish_reason",
                None,
            )

            if finish_reason is not None:
                finish_reason = str(
                    finish_reason
                )

        metadata = {
            "integration": "gemini",
            "finish_reason": finish_reason,
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
# placeholder for Gemini pricing
            "gemini-2.0-flash": {
                "input": 0.10,
                "output": 0.40,
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

    def patch_target(self):

        client_module = import_module(
            "google.genai.client"
        )
        async_client = getattr(
            client_module,
            "AsyncClient",
        )

        models_class = getattr(
            async_client,
            "models",
            None,
        )

        return (
            models_class,
            "generate_content",
        )


    def install(
        self,
        patcher,
        client,
    ) -> None:

        patcher.patch(
            client.aio.models,
            "generate_content",
        )