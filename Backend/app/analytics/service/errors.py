from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Trace, TraceStatus
from app.models import User

from analytics.filters import apply_trace_filters
from analytics.schemas import ErrorAnalyticsResponse,AnalyticsFilter



async def get_error_analytics(
    db: AsyncSession,
    user: User,
    filters: AnalyticsFilter,
) -> list[ErrorAnalyticsResponse]:

    stmt = (
        select(
            Trace.error_message.label("error_message"),
            func.count(Trace.trace_id).label("count"),
        )
        .where(
            Trace.status == TraceStatus.FAILED,
            Trace.error_message.is_not(None),
        )
    )

    stmt = apply_trace_filters(
        stmt=stmt,
        user=user,
        filters=filters,
    )

    stmt = (
        stmt.group_by(Trace.error_message)
        .order_by(desc("count"))
    )

    result = await db.execute(stmt)
    rows = result.all()

    return [
        ErrorAnalyticsResponse(
            error_message=row.error_message,
            count=row.count,
        )
        for row in rows
    ]