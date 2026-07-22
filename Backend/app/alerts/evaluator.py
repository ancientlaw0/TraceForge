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

    def evaluate(
        self,
        alert: Alert,
        metrics: AggregatedMetrics,
    ) -> bool:

        metric_value = self.metric_handlers[alert.metric](metrics)

        return self.operator_handlers[
            alert.operator
        ](
            metric_value,
            float(alert.threshold_value),
        )

    def _latency_avg(
        self,
        metrics: AggregatedMetrics,
    ) -> float:

        if metrics.requests == 0:
            return 0

        return metrics.latency_sum / metrics.requests

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

        return (
            metrics.errors
            / metrics.requests
            * 100
        )

    def _timeout_rate(
        self,
        metrics: AggregatedMetrics,
    ) -> float:

        if metrics.requests == 0:
            return 0

        return (
            metrics.timeouts
            / metrics.requests
            * 100
        )

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



#  from decimal import Decimal

# from app.alerts.schemas import (
#     AlertMetric,
#     AlertOperator,
# )
# from app.models import Alert
# from app.alerts.redis_reader import AggregatedMetrics


# class AlertEvaluator:

#     def evaluate(
#         self,
#         alert: Alert,
#         metrics: AggregatedMetrics,
#     ) -> bool:

#         metric_value = self._calculate_metric(
#             alert.metric,
#             metrics,
#         )

#         return self._compare(
#             metric_value,
#             float(alert.threshold_value),
#             alert.operator,
#         )

#     def _calculate_metric(
#         self,
#         metric: AlertMetric,
#         metrics: AggregatedMetrics,
#     ) -> float:

#         if metric == AlertMetric.LATENCY_AVG:

#             if metrics.requests == 0:
#                 return 0

#             return (
#                 metrics.latency_sum
#                 / metrics.requests
#             )

#         if metric == AlertMetric.LATENCY_MAX:
#             return metrics.latency_max

#         if metric == AlertMetric.ERROR_RATE:

#             if metrics.requests == 0:
#                 return 0

#             return (
#                 metrics.errors
#                 / metrics.requests
#                 * 100
#             )

#         if metric == AlertMetric.TIMEOUT_RATE:

#             if metrics.requests == 0:
#                 return 0

#             return (
#                 metrics.timeouts
#                 / metrics.requests
#                 * 100
#             )

#         if metric == AlertMetric.COST:
#             return float(metrics.cost)

#         if metric == AlertMetric.TOTAL_TOKENS:
#             return float(metrics.total_tokens)

#         raise ValueError(f"Unsupported metric: {metric}")

#     def _compare(
#         self,
#         value: float,
#         threshold: float,
#         operator: AlertOperator,
#     ) -> bool:

#         if operator == AlertOperator.GREATER_THAN:
#             return value > threshold

#         if operator == AlertOperator.GREATER_THAN_EQUAL:
#             return value >= threshold

#         if operator == AlertOperator.LESS_THAN:
#             return value < threshold

#         if operator == AlertOperator.LESS_THAN_EQUAL:
#             return value <= threshold

#         raise ValueError(f"Unsupported operator: {operator}")