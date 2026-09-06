from datetime import datetime, timezone, timedelta
import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Alert
from app.alerts.redis_reader import RedisMetricsReader
from app.alerts.evaluator import AlertEvaluator
from app.utils.email import send_email


class AlertScheduler:

    def __init__(
        self,
        db: AsyncSession,
        redis_reader: RedisMetricsReader,
    ):
        self.db = db
        self.redis_reader = redis_reader
        self.evaluator = AlertEvaluator()

    def _can_trigger(
        self,
        alert: Alert,
    ) -> bool:

        if alert.last_triggered_at is None:
            return True

        now = datetime.now(timezone.utc)

        elapsed = (
            now - alert.last_triggered_at
        )

        return elapsed >= timedelta(
            minutes=alert.cooldown_minutes
        )

    async def run(self):

        while True:
            result = await self.db.execute(
                select(Alert)
                .options(
                    selectinload(Alert.user)
                )
                .where(
                    Alert.enabled.is_(True)
                )
            )

            alerts = result.scalars().all()

            for alert in alerts:

                if not self._can_trigger(alert):
                    continue

                metrics = (
                    await self.redis_reader.get_window_metrics(
                        alert.user_id,
                        alert.window_minutes,
                    )
                )

                metric_value = (
                    self.evaluator.get_metric_value(
                        alert,
                        metrics,
                    )
                )

                if not self.evaluator.evaluate(
                    alert,
                    metrics,
                ):
                    continue

                send_email(
                    to=alert.user.email,
                    subject=f"TraceForge Alert - {alert.metric.value}",
                    body=f"""
    Hello,

    One of your TraceForge alerts has been triggered.

    Metric: {alert.metric.value}
    Current Value: {metric_value}
    Threshold: {alert.threshold_value}
    Window: {alert.window_minutes} minutes

    Regards,
    TraceForge
    """,
                )

                alert.last_triggered_at = datetime.now(timezone.utc)

            await self.db.commit()

            await asyncio.sleep(5)