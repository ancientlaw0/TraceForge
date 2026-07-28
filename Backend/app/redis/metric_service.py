from redis.asyncio import Redis
from app.redis.keys import totals_key,provider_key,    model_key,

from app.redis.client import redis_client
from .schemas import BUCKET_TTL
from .keys import models_set_key, providers_set_key

class RedisMetricsService:

    def __init__(self):
        self.redis: Redis = redis_client

    async def process(self, trace):

        pipe = self.redis.pipeline()

        keys = [
            totals_key(
                trace.user_id,
                trace.created_at,
            ),
            provider_key(
                trace.user_id,
                trace.created_at,
                trace.provider,
            ),
            model_key(
                trace.user_id,
                trace.created_at,
                trace.model,
            ),
        ]

        for key in keys:
            self._update_metrics(pipe, key, trace)

        pipe.sadd(
            providers_set_key(trace.user_id),
            trace.provider,
        )

        pipe.sadd(
            models_set_key(trace.user_id),
            trace.model,
        )
        await pipe.execute()

   
    def _update_metrics(
        self,
        pipe,
        key: str,
        trace,
    ):
        pipe.hincrby(key, "requests", 1)

        pipe.hincrby(
            key,
            trace.status.value,
            1,
        )

        pipe.hincrbyfloat(
            key,
            "latency_sum",
            trace.latency_ms,
        )

        pipe.hincrby(
            key,
            "input_tokens",
            trace.input_tokens,
        )

        pipe.hincrby(
            key,
            "output_tokens",
            trace.output_tokens,
        )

        pipe.hincrby(
            key,
            "total_tokens",
            trace.input_tokens + trace.output_tokens,
        )

        pipe.hincrbyfloat(
            key,
            "cost",
            float(trace.cost),
        )

        pipe.expire(
            key,
            BUCKET_TTL,
        )

        # TODO:
        # Update latency_max atomically

    
redis_metrics = RedisMetricsService()