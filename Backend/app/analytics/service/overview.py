from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Trace, TraceStatus
from app.models import User

from ..filters import apply_trace_filters
from ..schemas import (
    LatencyResponse,
    OverviewResponse,
    SummaryResponse,
    AnalyticsFilter,
)


async def get_overview(
    db: AsyncSession,
    user: User,
    filters: AnalyticsFilter,
) -> OverviewResponse:

    stmt = select(
        # -------------------------
        # Request counts
        # -------------------------

        func.count(Trace.id).label("total_requests"),

        func.count(Trace.id)
        .filter(
            Trace.status == TraceStatus.SUCCESS
        )
        .label("successful_requests"),

        func.count(Trace.id)
        .filter(
            Trace.status == TraceStatus.ERROR
        )
        .label("error_requests"),

        func.count(Trace.id)
        .filter(
            Trace.status == TraceStatus.TIMEOUT
        )
        .label("timeout_requests"),

        # -------------------------
        # Latency
        # -------------------------

        func.coalesce(
            func.avg(Trace.latency_ms),
            0
        ).label("average_latency"),

        func.percentile_cont(0.50)
        .within_group(Trace.latency_ms)
        .label("p50"),

        func.percentile_cont(0.95)
        .within_group(Trace.latency_ms)
        .label("p95"),

        func.percentile_cont(0.99)
        .within_group(Trace.latency_ms)
        .label("p99"),

        # -------------------------
        # Cost
        # -------------------------

        func.coalesce(
            func.sum(Trace.cost),
            0
        ).label("total_cost"),

        # -------------------------
        # Tokens
        # -------------------------

        func.coalesce(
            func.sum(Trace.input_tokens),
            0
        ).label("total_input_tokens"),

        func.coalesce(
            func.sum(Trace.output_tokens),
            0
        ).label("total_output_tokens"),
    )

    # Apply:
    # provider
    # model
    # status
    # time
    # custom start/end
    stmt = apply_trace_filters(
        stmt=stmt,
        user=user,
        filters=filters,
    )

    result = await db.execute(stmt)
    stats = result.one()

    # =========================================================
    # BASIC COUNTS
    # =========================================================

    total_requests = int(
        stats.total_requests or 0
    )

    successful_requests = int(
        stats.successful_requests or 0
    )

    error_requests = int(
        stats.error_requests or 0
    )

    timeout_requests = int(
        stats.timeout_requests or 0
    )

    # =========================================================
    # COST
    # =========================================================

    total_cost = float(
        stats.total_cost or 0
    )

    # =========================================================
    # TOKENS
    # =========================================================

    total_input_tokens = int(
        stats.total_input_tokens or 0
    )

    total_output_tokens = int(
        stats.total_output_tokens or 0
    )

    # =========================================================
    # LATENCY
    # =========================================================

    average_latency = float(
        stats.average_latency or 0
    )

    p50 = float(
        stats.p50 or 0
    )

    p95 = float(
        stats.p95 or 0
    )

    p99 = float(
        stats.p99 or 0
    )

    # =========================================================
    # RATES
    # =========================================================

    if total_requests > 0:

        success_rate = (
            successful_requests
            / total_requests
            * 100
        )

        error_rate = (
            error_requests
            / total_requests
            * 100
        )

        timeout_rate = (
            timeout_requests
            / total_requests
            * 100
        )

    else:
        # Important:
        # Avoid division by zero when there are
        # no traces matching the filters.

        success_rate = 0.0
        error_rate = 0.0
        timeout_rate = 0.0

    # =========================================================
    # RESPONSE
    # =========================================================

    return OverviewResponse(

        summary=SummaryResponse(

            total_requests=total_requests,

            successful_requests=successful_requests,

            error_requests=error_requests,

            timeout_requests=timeout_requests,

            success_rate=round(
                success_rate,
                2,
            ),

            error_rate=round(
                error_rate,
                2,
            ),

            timeout_rate=round(
                timeout_rate,
                2,
            ),

            total_cost=round(
                total_cost,
                4,
            ),

            total_input_tokens=total_input_tokens,

            total_output_tokens=total_output_tokens,
        ),

        latency=LatencyResponse(

            average=round(
                average_latency,
                2,
            ),

            p50=round(
                p50,
                2,
            ),

            p95=round(
                p95,
                2,
            ),

            p99=round(
                p99,
                2,
            ),
        ),
    )