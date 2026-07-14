from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Trace
from app.schemas import TraceCreate
from app.security.auth_context import APIAuthContext
from app.security.auth import get_current_api_user

router = APIRouter( prefix="/traces", tags=["Traces"] )

@router.post( "/", status_code=status.HTTP_201_CREATED )

def create_trace(
    trace: TraceCreate,
    auth: APIAuthContext = Depends(get_current_api_user),
    db: Session = Depends(get_db)
):
    existing_trace = (
        db.query(Trace)
        .filter(Trace.trace_id == trace.trace_id)
        .first()
    )

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
    db.commit()
    db.refresh(new_trace)

    return {
        "trace_id": new_trace.trace_id,
        "status": "stored"
    }