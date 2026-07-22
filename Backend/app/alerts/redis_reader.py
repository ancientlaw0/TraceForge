from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal
from redis.asyncio import Redis
from app.redis.keys import totals_key

@dataclass
class AggregatedMetrics:
    requests: int
    errors: int
    timeouts: int
    latency_sum: float
    latency_max: float
    cost: Decimal
    total_tokens: int

class RedisMetricsReader:

    def __init__(self, redis: Redis):
        self.redis = redis

    async def get_window_metrics(
        self,
        user_id: int,
        window_minutes: int,
    ) -> AggregatedMetrics:

        now = datetime.utcnow().replace(
            second=0,
            microsecond=0,
        )

        pipe = self.redis.pipeline()

        for i in range(window_minutes):

            minute = now - timedelta(minutes=i)

            pipe.hgetall(
                totals_key(
                    user_id,
                    minute,
                )
            )

        buckets = await pipe.execute()

        metrics = AggregatedMetrics(
            requests=0,
            errors=0,
            timeouts=0,
            latency_sum=0.0,
            latency_max=0.0,
            cost=Decimal("0"),
            total_tokens=0,
        )

        for bucket in buckets:

            if not bucket:
                continue

            metrics.requests += int(
                bucket.get("requests", 0)
            )

            metrics.errors += int(
                bucket.get("error", 0)
            )

            metrics.timeouts += int(
                bucket.get("timeout", 0)
            )

            metrics.latency_sum += float(
                bucket.get("latency_sum", 0)
            )

            metrics.latency_max = max(
                metrics.latency_max,
                float(bucket.get("latency_max", 0)),
            )

            metrics.cost += Decimal(
                bucket.get("cost", "0")
            )

            metrics.total_tokens += int(
                bucket.get("total_tokens", 0)
            )

        return metrics