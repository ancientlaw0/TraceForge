from fastapi import APIRouter, Depends, status

from app.kafka.producer import publish_event
from app.core.config import settings
from app.schemas.traces import TraceCreate
from app.security.auth_context import AuthContext
from app.dependencies.current_api_user import get_current_api_user
from app.usage.limiter import usage_limiter
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/traces",
    tags=["Traces"],
)
@router.post(
    "/",
    status_code=status.HTTP_202_ACCEPTED,
)
async def create_trace(
    trace: TraceCreate,
    auth: AuthContext = Depends(get_current_api_user),
    db: AsyncSession = Depends(get_db),
):
    trace_event = {
        **trace.model_dump(mode="json"),
        "user_id": auth.user.id,
        "api_key_id": auth.api_key.id,
    }

    await usage_limiter.check(
        db=db,
        user_id=auth.user.id,
    )

    await publish_event(
        topic=settings.TRACE_TOPIC,
        key=trace.trace_id,
        event=trace_event,
    )

    return {
        "trace_id": trace.trace_id,
        "status": "accepted",
    }