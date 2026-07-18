from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Trace, User
from app.models import TraceStatus

from filters import apply_trace_filters
from analytics.schemas import (
    AnalyticsFilter,
    TimeSeriesResponse,
    TimeFilter,
)


async def get_timeseries(
    db: AsyncSession,
    user: User,
    filters: AnalyticsFilter,
) -> list[TimeSeriesResponse]:

    bucket = "day"

    if filters.time == TimeFilter.hour:
        bucket = "hour"

    time_bucket = func.date_trunc(
        bucket,
        Trace.created_at,
    ).label("timestamp")

    stmt = select(
        time_bucket,

        func.count(Trace.id).label("requests"),

        func.count()
        .filter(Trace.status == TraceStatus.SUCCESS)
        .label("successful_requests"),

        func.count()
        .filter(Trace.status == TraceStatus.FAILED)
        .label("failed_requests"),

        func.coalesce(
            func.avg(Trace.latency_ms),
            0,
        ).label("average_latency"),

        func.coalesce(
            func.sum(Trace.cost),
            0,
        ).label("total_cost"),

        func.coalesce(
            func.sum(Trace.input_tokens),
            0,
        ).label("total_input_tokens"),

        func.coalesce(
            func.sum(Trace.output_tokens),
            0,
        ).label("total_output_tokens"),
    )

    stmt = apply_trace_filters(
        stmt=stmt,
        user=user,
        filters=filters,
    )

    stmt = (
        stmt.group_by(time_bucket)
        .order_by(time_bucket)
    )

    result = await db.execute(stmt)

    rows = result.all()

    return [
        TimeSeriesResponse(
            timestamp=row.timestamp,
            requests=row.requests,
            successful_requests=row.successful_requests,
            failed_requests=row.failed_requests,
            average_latency=float(row.average_latency),
            total_cost=float(row.total_cost),
            total_input_tokens=row.total_input_tokens,
            total_output_tokens=row.total_output_tokens,
        )
        for row in rows
    ]