from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Trace, TraceStatus
from app.models import User

from app.analytics.filters import apply_trace_filters
from app.analytics.schemas import ModelAnalyticsResponse,AnalyticsFilter


async def get_models(
    db: AsyncSession,
    user: User,
    filters: AnalyticsFilter,
) -> list[ModelAnalyticsResponse]:

    stmt = select(
        Trace.provider,
        Trace.model,

        func.count(Trace.id).label("requests"),

        func.count(Trace.id)
            .filter(Trace.status == TraceStatus.SUCCESS)
            .label("successful_requests"),

        func.count(Trace.id)
            .filter(Trace.status == TraceStatus.ERROR)
            .label("failed_requests"),

        func.avg(Trace.latency).label("average_latency"),

        func.percentile_cont(0.95)
            .within_group(Trace.latency)
            .label("p95_latency"),

        func.sum(Trace.cost).label("total_cost"),

        func.sum(Trace.input_tokens).label("total_input_tokens"),

        func.sum(Trace.output_tokens).label("total_output_tokens"),
    )

    stmt = apply_trace_filters(
        stmt=stmt,
        user=user,
        filters=filters,
    )

    stmt = (
        stmt.group_by(
            Trace.provider,
            Trace.model,
        )
        .order_by(
            func.count(Trace.id).desc()
        )
    )

    result = await db.execute(stmt)
    rows = result.all()

    response = []

    for row in rows:

        error_rate = (
            row.failed_requests / row.requests * 100
            if row.requests
            else 0
        )

        response.append(
            ModelAnalyticsResponse(
                provider=row.provider,
                model=row.model,

                requests=row.requests,
                successful_requests=row.successful_requests,
                failed_requests=row.failed_requests,

                average_latency=round(
                    float(row.average_latency or 0), 2
                ),

                p95_latency=round(
                    float(row.p95_latency or 0), 2
                ),

                total_cost=round(
                    float(row.total_cost or 0), 4
                ),

                total_input_tokens=row.total_input_tokens or 0,
                total_output_tokens=row.total_output_tokens or 0,

                error_rate=round(error_rate, 2),
            )
        )

    return response