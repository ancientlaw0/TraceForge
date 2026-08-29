from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Trace, User
from app.analytics.filters import apply_trace_filters
from app.analytics.schemas import ( TraceAnalyticsResponse, AnalyticsFilter, )

async def get_traces(
    db: AsyncSession,
    user: User,
    filters: AnalyticsFilter,
) -> list[TraceAnalyticsResponse]:
    stmt = select(
        Trace
    )
    # Apply the exact same filters
    stmt = apply_trace_filters(
        stmt=stmt,
        user=user,
        filters=filters,
    )
    # Newest traces first
    stmt = stmt.order_by( Trace.created_at.desc() )
    stmt = stmt.limit(100)
    result = await db.execute(stmt)
    traces = result.scalars().all()
    return [
        TraceAnalyticsResponse(
            trace_id=str(
                trace.trace_id
            ),
            provider=trace.provider,
            model=trace.model,
            prompt=trace.prompt,
            response=trace.response,
            latency_ms=float( trace.latency_ms ),
            input_tokens=int( trace.input_tokens ),
            output_tokens=int( trace.output_tokens ),
            cost=float( trace.cost ),
            status=trace.status,
            error_message=( trace.error_message ),
            metadata_trace=( trace.metadata_trace ),
            created_at=trace.created_at,
        )
        for trace in traces
    ]