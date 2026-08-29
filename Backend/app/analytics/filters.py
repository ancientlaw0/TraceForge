from datetime import datetime, timedelta, timezone
from sqlalchemy import Select
from app.models import Trace, User
from .schemas import AnalyticsFilter, TimeFilter

def apply_trace_filters(
    stmt: Select,
    user: User,
    filters: AnalyticsFilter,
):
    stmt = stmt.where(
        Trace.user_id == user.id
    )

    TIME_DELTAS = {
        TimeFilter.hour: timedelta(hours=1),
        TimeFilter.day: timedelta(days=1),
        TimeFilter.week: timedelta(days=7),
        TimeFilter.month: timedelta(days=30),
    }

    if filters.time == TimeFilter.all:
        pass

    elif filters.time != TimeFilter.custom:
        stmt = stmt.where(
            Trace.created_at >= (
                datetime.now(timezone.utc)
                - TIME_DELTAS[filters.time]
            )
        )

    else:
        if filters.start:
            stmt = stmt.where(
                Trace.created_at >= filters.start
            )

        if filters.end:
            stmt = stmt.where(
                Trace.created_at <= filters.end
            )

    if filters.provider:
        stmt = stmt.where(
            Trace.provider == filters.provider
        )

    if filters.model:
        stmt = stmt.where(
            Trace.model == filters.model
        )

    if filters.status:
        stmt = stmt.where(
            Trace.status == filters.status
        )

    return stmt