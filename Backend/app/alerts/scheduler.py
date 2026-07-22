from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import Alert
from app.alerts.redis_reader import RedisMetricsReader
from app.alerts.evaluator import AlertEvaluator
from app.alerts.email import send_alert_email


class AlertScheduler:

    def __init__(
        self,
        db: Session,
        redis_reader: RedisMetricsReader,
    ):
        self.db = db
        self.redis_reader = redis_reader
        self.evaluator = AlertEvaluator()

    async def run(self):

        alerts = (
            self.db.query(Alert)
            .filter(Alert.enabled == True)
            .all()
        )

        for alert in alerts:

            if not self._can_trigger(alert):
                continue

            metrics = await self.redis_reader.get_window_metrics(
                alert.user_id,
                alert.window_minutes.value,
            )

            if not self.evaluator.evaluate(
                alert,
                metrics,
            ):
                continue

            send_alert_email(
                alert.user,
                alert,
                metrics,
            )

            alert.last_triggered_at = datetime.utcnow()

        self.db.commit()