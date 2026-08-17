from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.redis.usage import redis_usage
from app.usage.repository import UsageRepository


class UsageLimiter:

    async def check(
        self,
        db: AsyncSession,
        user_id: int,
    ):
        repository = UsageRepository(db)

        limits = await repository.get_by_user_id(
            user_id,
        )

        if limits is None:
            return

        if not limits.enabled:
            return

        now = datetime.now(timezone.utc)

        # -------------------------
        # Request admission
        # -------------------------

        if limits.max_requests_per_minute is not None:

            allowed = await redis_usage.reserve_minute_request(
                user_id=user_id,
                timestamp=now,
                limit=limits.max_requests_per_minute,
            )

            if not allowed:
                self._raise(
                    "Minute request limit exceeded.",
                    limits,
                )

        # -------------------------
        # Existing usage accounting
        # -------------------------

        usage = await redis_usage.get_usage(
            user_id=user_id,
            timestamp=now,
        )

        self._check_requests(
            limits,
            usage,
        )

        self._check_tokens(
            limits,
            usage,
        )

        self._check_cost(
            limits,
            usage,
        )

    def _check_requests(
        self,
        limits,
        usage,
    ):
        # Hourly limit
        if (
            limits.max_requests_per_hour is not None
            and usage["hour"]["requests"]
            >= limits.max_requests_per_hour
        ):
            self._raise(
                "Hourly request limit exceeded.",
                limits,
            )

        # Daily limit
        if (
            limits.max_requests_per_day is not None
            and usage["day"]["requests"]
            >= limits.max_requests_per_day
        ):
            self._raise(
                "Daily request limit exceeded.",
                limits,
            )

    def _check_tokens(
        self,
        limits,
        usage,
    ):
        if (
            limits.max_input_tokens_per_day is not None
            and usage["day"]["input_tokens"]
            >= limits.max_input_tokens_per_day
        ):
            self._raise(
                "Daily input token limit exceeded.",
                limits,
            )

        if (
            limits.max_output_tokens_per_day is not None
            and usage["day"]["output_tokens"]
            >= limits.max_output_tokens_per_day
        ):
            self._raise(
                "Daily output token limit exceeded.",
                limits,
            )

    def _check_cost(
        self,
        limits,
        usage,
    ):
        if (
            limits.max_cost_per_day is not None
            and Decimal(str(usage["day"]["cost"]))
            >= limits.max_cost_per_day
        ):
            self._raise(
                "Daily cost limit exceeded.",
                limits,
            )

    def _raise(
        self,
        message: str,
        limits,
    ):
        if not limits.block_on_limit:
            return

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=message,
        )


usage_limiter = UsageLimiter()