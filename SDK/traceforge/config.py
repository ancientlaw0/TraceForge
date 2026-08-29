class Config:

    def __init__(
        self,
        api_key: str,
        endpoint: str = "http://localhost:8000",
    ):
        self.api_key = api_key
        self.endpoint = endpoint.rstrip("/")


_config: Config | None = None


def configure(
    api_key: str,
    endpoint: str = "http://localhost:8000",
):
    global _config

    _config = Config(
        api_key=api_key,
        endpoint=endpoint,
    )


def get_config() -> Config:

    if _config is None:
        raise RuntimeError(
            "TraceForge has not been initialized."
        )

    return _config