from fastapi import APIRouter, Depends, status
from app.kafka.producer import publish_event
from app.core.config import settings
from app.schemas.traces import TraceCreate
from app.security.auth_context import AuthContext
from app.dependencies.current_api_user import get_current_api_user

router = APIRouter( prefix="/traces", tags=["Traces"] )

@router.post( "/", status_code=status.HTTP_202_ACCEPTED )
async def create_trace(
    trace: TraceCreate,
    auth: AuthContext = Depends(get_current_api_user),
):

    trace_event = { **trace.model_dump(), "user_id": auth.user, "api_key_id": auth.api_key, }

    await publish_event( topic=settings.TRACE_TOPIC, key=trace.trace_id, event=trace_event, )
    
    return {
        "trace_id": trace.trace_id,
        "status": "accepted",
    }