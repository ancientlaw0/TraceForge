from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Trace, TraceStatus, User

from app.analytics.filters import apply_trace_filters
from app.analytics.schemas import (
    ModelAnalyticsResponse,
    AnalyticsFilter,
)


async def get_models(
    db: AsyncSession,
    user: User,
    filters: AnalyticsFilter,
) -> list[ModelAnalyticsResponse]:

    stmt = select(
        Trace.provider,
        Trace.model,

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

        # Latency
        func.coalesce(
            func.avg(Trace.latency_ms),
            0,
        ).label("average_latency"),

        func.coalesce(
            func.percentile_cont(0.95)
            .within_group(Trace.latency_ms),
            0,
        ).label("p95_latency"),

        # Cost
        func.coalesce(
            func.sum(Trace.cost),
            0,
        ).label("total_cost"),

        # Tokens
        func.coalesce(
            func.sum(Trace.input_tokens),
            0,
        ).label("total_input_tokens"),

        func.coalesce(
            func.sum(Trace.output_tokens),
            0,
        ).label("total_output_tokens"),
    )

    # Apply user/time/provider/model/status filters
    stmt = apply_trace_filters(
        stmt=stmt,
        user=user,
        filters=filters,
    )

    # One row per provider + model
    stmt = (
        stmt
        .group_by(
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

        requests = int(
            row.requests or 0
        )

        successful_requests = int(
            row.successful_requests or 0
        )

        error_requests = int(
            row.error_requests or 0
        )

        timeout_requests = int(
            row.timeout_requests or 0
        )

        # -----------------------------------------
        # Rates
        # -----------------------------------------

        if requests > 0:

            error_rate = (
                error_requests
                / requests
                * 100
            )

            timeout_rate = (
                timeout_requests
                / requests
                * 100
            )

        else:

            error_rate = 0.0
            timeout_rate = 0.0

        # -----------------------------------------
        # Response
        # -----------------------------------------

        response.append(
            ModelAnalyticsResponse(

                provider=row.provider,

                model=row.model,

                requests=requests,

                successful_requests=successful_requests,

                error_requests=error_requests,

                timeout_requests=timeout_requests,

                average_latency=round(
                    float(
                        row.average_latency or 0
                    ),
                    2,
                ),

                p95_latency=round(
                    float(
                        row.p95_latency or 0
                    ),
                    2,
                ),

                total_cost=round(
                    float(
                        row.total_cost or 0
                    ),
                    4,
                ),

                total_input_tokens=int(
                    row.total_input_tokens or 0
                ),

                total_output_tokens=int(
                    row.total_output_tokens or 0
                ),

                error_rate=round(
                    error_rate,
                    2,
                ),

                timeout_rate=round(
                    timeout_rate,
                    2,
                ),
            )
        )

    return response