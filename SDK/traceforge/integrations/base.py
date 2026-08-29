from abc import ABC, abstractmethod
from typing import Any


class ProviderIntegration(ABC):

    @property
    @abstractmethod
    def provider(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def extract_request(
        self,
        args: tuple[Any, ...],
        kwargs: dict[str, Any],
    ) -> tuple[str, str]:
        raise NotImplementedError

    @abstractmethod
    def extract_response(
        self,
        response: Any,
    ) -> tuple[str, int, int, dict[str, Any]]:
        raise NotImplementedError

    @abstractmethod
    def calculate_cost(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
    ) -> float:
        raise NotImplementedError

    @abstractmethod
    def extract_error(
        self,
        error: Exception,
    ) -> str:
        raise NotImplementedError

    @abstractmethod
    def install(
        self,
        patcher,
        client,
    ) -> None:
        raise NotImplementedError