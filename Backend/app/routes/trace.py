from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Trace
from app.schemas import TraceCreate
from app.security.auth_context import APIAuthContext
from app.security.auth import get_current_api_user

router = APIRouter( prefix="/traces", tags=["Traces"] )

@router.post( "/", status_code=status.HTTP_201_CREATED )
async def create_trace(
    trace: TraceCreate,
    auth: APIAuthContext = Depends(get_current_api_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Trace).where(
            Trace.trace_id == trace.trace_id
        )
    )
    existing_trace = result.scalar_one_or_none()
    if existing_trace:
        return {
            "message": "Trace already exists."
        }
    new_trace = Trace(
        **trace.model_dump(),
        user_id=auth.user.id,
        api_key_id=auth.api_key.id
    )

    db.add(new_trace)
    await db.commit()
    await db.refresh(new_trace)
    return {
        "trace_id": new_trace.trace_id,
        "status": "stored"
    }