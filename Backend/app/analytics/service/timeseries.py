from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Trace, User, TraceStatus

from app.analytics.filters import apply_trace_filters
from app.analytics.schemas import (
    AnalyticsFilter,
    TimeSeriesResponse,
    TimeFilter,
)


async def get_timeseries(
    db: AsyncSession,
    user: User,
    filters: AnalyticsFilter,
) -> list[TimeSeriesResponse]:

    # For hour -> hourly buckets.
    # For day/week/month -> daily buckets.
    bucket = "day"

    if filters.time == TimeFilter.hour:
        bucket = "hour"

    time_bucket = func.date_trunc(
        bucket,
        Trace.created_at,
    ).label("timestamp")

    stmt = select(
        time_bucket,

        # Total requests
        func.count(Trace.id).label("requests"),

        # Successful requests
        func.count(Trace.id)
        .filter(
            Trace.status == TraceStatus.SUCCESS
        )
        .label("successful_requests"),

        # Error requests
        func.count(Trace.id)
        .filter(
            Trace.status == TraceStatus.ERROR
        )
        .label("error_requests"),

        # Timeout requests
        func.count(Trace.id)
        .filter(
            Trace.status == TraceStatus.TIMEOUT
        )
        .label("timeout_requests"),

        # Average latency
        func.coalesce(
            func.avg(Trace.latency_ms),
            0,
        ).label("average_latency"),

        # Total cost
        func.coalesce(
            func.sum(Trace.cost),
            0,
        ).label("total_cost"),

        # Total input tokens
        func.coalesce(
            func.sum(Trace.input_tokens),
            0,
        ).label("total_input_tokens"),

        # Total output tokens
        func.coalesce(
            func.sum(Trace.output_tokens),
            0,
        ).label("total_output_tokens"),
    )

    # Apply user + provider + model + status + time filters
    stmt = apply_trace_filters(
        stmt=stmt,
        user=user,
        filters=filters,
    )

    # One row per time bucket
    stmt = (
        stmt
        .group_by(time_bucket)
        .order_by(time_bucket)
    )

    result = await db.execute(stmt)

    rows = result.all()

    return [
        TimeSeriesResponse(
            timestamp=row.timestamp,

            requests=row.requests or 0,

            successful_requests=row.successful_requests or 0,

            error_requests=row.error_requests or 0,

            timeout_requests=row.timeout_requests or 0,

            average_latency=float(
                row.average_latency or 0
            ),

            total_cost=float(
                row.total_cost or 0
            ),

            total_input_tokens=row.total_input_tokens or 0,

            total_output_tokens=row.total_output_tokens or 0,
        )
        for row in rows
    ]