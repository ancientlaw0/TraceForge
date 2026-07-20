from redis.asyncio import Redis

from app.redis.client import redis_client


class RedisMetricsService:

    def __init__(self):
        self.redis: Redis = redis_client

    async def process(self, trace):

        pipe = self.redis.pipeline()

        self._update_totals(pipe, trace)
        self._update_provider(pipe, trace)
        self._update_model(pipe, trace)
        self._update_status(pipe, trace)

        await pipe.execute()
        
    def _update_totals(self, pipe, trace):

        key = totals_key(
            trace.user_id,
            trace.created_at,
        )
    
    def _update_provider(self, pipe, trace):

        key = provider_key(
            trace.user_id,
            trace.created_at,
            trace.provider,
        )

    def _update_model(self, pipe, trace):

        key = model_key(
            trace.user_id,
            trace.created_at,
            trace.model,
        )

    def _update_status(self, pipe, trace):

        key = status_key(
            trace.user_id,
            trace.created_at,
        )


    
redis_metrics = RedisMetricsService()