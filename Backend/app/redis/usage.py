from redis.asyncio import Redis

from app.models import Trace
from app.redis.client import redis_client
from app.redis.keys import (
    usage_day_key,
    usage_hour_key,
    usage_minute_key,
)

from app.redis.keys import rate_limit_minute_key
from app.redis.schemas import (
    DAY_BUCKET_TTL,
    HOUR_BUCKET_TTL,
    MINUTE_BUCKET_TTL,
)


class RedisUsageService:

    def __init__(self):
        self.redis: Redis = redis_client

    async def increment(
        self,
        trace: Trace,
    ):

        pipe = self.redis.pipeline()

        self._update_bucket(
            pipe=pipe,
            key=usage_minute_key(
                trace.user_id,
                trace.created_at,
            ),
            ttl=MINUTE_BUCKET_TTL,
            requests=1,
        )

        self._update_bucket(
            pipe=pipe,
            key=usage_hour_key(
                trace.user_id,
                trace.created_at,
            ),
            ttl=HOUR_BUCKET_TTL,
            requests=1,
        )

        self._update_bucket(
            pipe=pipe,
            key=usage_day_key(
                trace.user_id,
                trace.created_at,
            ),
            ttl=DAY_BUCKET_TTL,
            requests=1,
            input_tokens=trace.input_tokens,
            output_tokens=trace.output_tokens,
            cost=float(trace.cost),
        )

        await pipe.execute()

    def _update_bucket(
        self,
        pipe,
        key: str,
        ttl: int,
        requests: int = 0,
        input_tokens: int = 0,
        output_tokens: int = 0,
        cost: float = 0,
    ):

        if requests != 0:
            pipe.hincrby(
                key,
                "requests",
                requests,
            )

        if input_tokens != 0:
            pipe.hincrby(
                key,
                "input_tokens",
                input_tokens,
            )

        if output_tokens != 0:
            pipe.hincrby(
                key,
                "output_tokens",
                output_tokens,
            )

        if cost != 0:
            pipe.hincrbyfloat(
                key,
                "cost",
                cost,
            )

        pipe.expire(
            key,
            ttl,
        )

    async def get_usage(
        self,
        user_id: int,
        timestamp,
    ):

        pipe = self.redis.pipeline()

        pipe.hgetall(
            usage_minute_key(
                user_id,
                timestamp,
            )
        )

        pipe.hgetall(
            usage_hour_key(
                user_id,
                timestamp,
            )
        )

        pipe.hgetall(
            usage_day_key(
                user_id,
                timestamp,
            )
        )

        minute, hour, day = await pipe.execute()

        return {
            "minute": self._parse_bucket(
                minute,
            ),
            "hour": self._parse_bucket(
                hour,
            ),
            "day": self._parse_bucket(
                day,
            ),
        }

    def _parse_bucket(
        self,
        bucket: dict,
    ):

        return {
            "requests": int(
                bucket.get(
                    "requests",
                    0,
                )
            ),
            "input_tokens": int(
                bucket.get(
                    "input_tokens",
                    0,
                )
            ),
            "output_tokens": int(
                bucket.get(
                    "output_tokens",
                    0,
                )
            ),
            "cost": float(
                bucket.get(
                    "cost",
                    0,
                )
            ),
        }

    async def reserve_minute_request(
        self,
        user_id: int,
        timestamp,
        limit: int,
    ) -> bool:

        key = rate_limit_minute_key(
            user_id,
            timestamp,
        )

        script = """
        local count = redis.call(
            'INCR',
            KEYS[1]
        )

        if count == 1 then
            redis.call(
                'EXPIRE',
                KEYS[1],
                60
            )
        end

        if count > tonumber(ARGV[1]) then
            redis.call(
                'DECR',
                KEYS[1]
            )

            return 0
        end

        return 1
        """

        result = await self.redis.eval(
            script,
            1,
            key,
            limit,
        )

        return bool(result)


redis_usage = RedisUsageService()