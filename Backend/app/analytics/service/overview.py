from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Trace,TraceStatus
from app.models import User

from ..filters import  apply_trace_filters
from ..schemas import LatencyResponse, OverviewResponse, SummaryResponse,AnalyticsFilter


async def get_overview(
    db: AsyncSession,
    user: User,
    filters: AnalyticsFilter,
) -> OverviewResponse:

    stmt = select(
        func.count(Trace.id).label("total_requests"),

        func.count(Trace.id)
        .filter(Trace.status == TraceStatus.SUCCESS)
        .label("successful_requests"),

        func.count(Trace.id)
        .filter(Trace.status == TraceStatus.ERROR)
        .label("failed_requests"),

        func.coalesce(func.avg(Trace.latency), 0).label("average_latency"),

        func.coalesce(func.sum(Trace.cost), 0).label("total_cost"),

        func.sum(Trace.input_tokens).label("total_input_tokens"),

        func.sum(Trace.output_tokens).label("total_output_tokens"),

        func.percentile_cont(0.50)
        .within_group(Trace.latency)
        .label("p50"),

        func.percentile_cont(0.95)
        .within_group(Trace.latency)
        .label("p95"),

        func.percentile_cont(0.99)
        .within_group(Trace.latency)
        .label("p99"),
    )

    stmt = apply_trace_filters(
        stmt=stmt,
        user=user,
        filters=filters,
    )

    result = await db.execute(stmt)
    stats = result.one()

    total_requests = stats.total_requests or 0
    successful_requests = stats.successful_requests or 0
    failed_requests = stats.failed_requests or 0

    total_cost = float(stats.total_cost or 0)

    total_input_tokens = stats.total_input_tokens or 0
    total_output_tokens = stats.total_output_tokens or 0

    average_latency = float(stats.average_latency or 0)

    p50 = float(stats.p50 or 0)
    p95 = float(stats.p95 or 0)
    p99 = float(stats.p99 or 0)

    success_rate = (
        (successful_requests / total_requests) * 100
        if total_requests
        else 0
    )

    return OverviewResponse(
        summary=SummaryResponse(
            total_requests=total_requests,
            successful_requests=successful_requests,
            failed_requests=failed_requests,
            success_rate=round(success_rate, 2),
            total_cost=round(total_cost, 4),
            total_input_tokens=total_input_tokens,
            total_output_tokens=total_output_tokens,
        ),
        latency=LatencyResponse(
            average=round(average_latency, 2),
            p50=round(p50, 2),
            p95=round(p95, 2),
            p99=round(p99, 2),
        ),
    )