from app.alerts.redis_reader import AggregatedMetrics
from app.alerts.schemas import AlertMetric, AlertOperator
from app.models import Alert


class AlertEvaluator:

    def __init__(self):

        self.metric_handlers = {
            AlertMetric.LATENCY_AVG: self._latency_avg,
            AlertMetric.LATENCY_MAX: self._latency_max,
            AlertMetric.ERROR_RATE: self._error_rate,
            AlertMetric.TIMEOUT_RATE: self._timeout_rate,
            AlertMetric.COST: self._cost,
            AlertMetric.TOTAL_TOKENS: self._total_tokens,
        }

        self.operator_handlers = {
            AlertOperator.GREATER_THAN: lambda x, y: x > y,
            AlertOperator.GREATER_THAN_EQUAL: lambda x, y: x >= y,
            AlertOperator.LESS_THAN: lambda x, y: x < y,
            AlertOperator.LESS_THAN_EQUAL: lambda x, y: x <= y,
        }

    def get_metric_value(
        self,
        alert: Alert,
        metrics: AggregatedMetrics,
    ) -> float:

        return self.metric_handlers[ alert.metric ](metrics)

    def evaluate(
        self,
        alert: Alert,
        metrics: AggregatedMetrics,
    ) -> bool:

        metric_value = self.get_metric_value( alert, metrics, )

        return self.operator_handlers[ alert.operator ]( metric_value, float(alert.threshold_value), )

    def _latency_avg(
        self,
        metrics: AggregatedMetrics,
    ) -> float:

        if metrics.requests == 0:
            return 0

        return ( metrics.latency_sum / metrics.requests )

    def _latency_max(
        self,
        metrics: AggregatedMetrics,
    ) -> float:

        return metrics.latency_max

    def _error_rate(
        self,
        metrics: AggregatedMetrics,
    ) -> float:

        if metrics.requests == 0:
            return 0

        return ( metrics.errors / metrics.requests * 100 )

    def _timeout_rate(
        self,
        metrics: AggregatedMetrics,
    ) -> float:

        if metrics.requests == 0:
            return 0

        return ( metrics.timeouts / metrics.requests * 100 )

    def _cost(
        self,
        metrics: AggregatedMetrics,
    ) -> float:

        return float(metrics.cost)

    def _total_tokens(
        self,
        metrics: AggregatedMetrics,
    ) -> float:

        return float(metrics.total_tokens)