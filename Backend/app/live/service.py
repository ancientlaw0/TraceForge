from datetime import datetime, timedelta
from redis.asyncio import Redis

from app.redis.client import redis_client
from app.redis.keys import totals_key, provider_key, model_key, providers_set_key, models_set_key


class LiveService:

    def __init__(self):
        self.redis: Redis = redis_client

    async def get_live(
        self,
        user_id: int,
        since: datetime,
    ):

        summary = await self._summary( user_id, since, )
        providers = await self._providers( user_id, since, )
        models = await self._models( user_id, since, )
        graph = await self._graph( user_id, since, )
        return {
            "summary": summary,
            "providers": providers,
            "models": models,
            "graph": graph,
        }

    def _minutes(
        self,
        since: datetime,
    ):
        now = datetime.utcnow()
        current = since.replace(
            second=0,
            microsecond=0,
        )
        minutes = []
        while current <= now:
            minutes.append(current)
            current += timedelta(minutes=1)
        return minutes

    async def _summary(
        self,
        user_id,
        since,
    ):
        minutes = self._minutes(since)
        pipe = self.redis.pipeline()
        for minute in minutes:
            pipe.hgetall(
                totals_key(
                    user_id,
                    minute,
                )
            )
        results = await pipe.execute()
        summary = {
            "requests": 0,
            "success": 0,
            "failed": 0,
            "latency_sum": 0,
            "cost": 0,
            "input_tokens": 0,
            "output_tokens": 0,
            "total_tokens": 0,
        }
        for bucket in results:
            if not bucket:
                continue
            summary["requests"] += int(
                bucket.get("requests", 0)
            )
            summary["success"] += int(
                bucket.get("success", 0)
            )
            summary["failed"] += int(
                bucket.get("failed", 0)
            )
            summary["latency_sum"] += float(
                bucket.get("latency_sum", 0)
            )
            summary["cost"] += float(
                bucket.get("cost", 0)
            )
            summary["input_tokens"] += int(
                bucket.get("input_tokens", 0)
            )
            summary["output_tokens"] += int(
                bucket.get("output_tokens", 0)
            )
            summary["total_tokens"] += int(
                bucket.get("total_tokens", 0)
            )
        if summary["requests"]:
            summary["avg_latency"] = (
                summary["latency_sum"]
                / summary["requests"]
            )
        else:
            summary["avg_latency"] = 0
        summary.pop("latency_sum")
        return summary

    async def _graph(
        self,
        user_id,
        since,
    ):
        minutes = self._minutes(since)
        pipe = self.redis.pipeline()
        for minute in minutes:
            pipe.hgetall(
                totals_key(
                    user_id,
                    minute,
                )
            )
        results = await pipe.execute()
        graph = []
        for minute, bucket in zip(
            minutes,
            results,
        ):
            graph.append(
                {
                    "minute": minute.strftime("%H:%M"),
                    "requests": int(
                        bucket.get("requests", 0)
                    ) if bucket else 0,
                }
            )
        return graph

    async def _providers(
        self,
        user_id,
        since,
    ):
        providers = await self.redis.smembers(
            providers_set_key(user_id)
        )
        minutes = self._minutes(since)
        response = []
        for provider in providers:
            pipe = self.redis.pipeline()
            for minute in minutes:
                pipe.hgetall(
                    provider_key(
                        user_id,
                        minute,
                        provider,
                    )
                )
            buckets = await pipe.execute()
            requests = 0
            cost = 0
            for bucket in buckets:
                if not bucket:
                    continue
                requests += int(
                    bucket.get("requests", 0)
                )
                cost += float(
                    bucket.get("cost", 0)
                )
            response.append(
                {
                    "provider": provider,
                    "requests": requests,
                    "cost": cost,
                }
            )
        return response

    async def _models(
        self,
        user_id,
        since,
    ):
        models = await self.redis.smembers(
            models_set_key(user_id)
        )
        minutes = self._minutes(since)
        response = []
        for model in models:
            pipe = self.redis.pipeline()
            for minute in minutes:
                pipe.hgetall(
                    model_key(
                        user_id,
                        minute,
                        model,
                    )
                )
            buckets = await pipe.execute()
            requests = 0
            cost = 0
            for bucket in buckets:
                if not bucket:
                    continue
                requests += int(
                    bucket.get("requests", 0)
                )
                cost += float(
                    bucket.get("cost", 0)
                )
            response.append(
                {
                    "model": model,
                    "requests": requests,
                    "cost": cost,
                }
            )
        return response