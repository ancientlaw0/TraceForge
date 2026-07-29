from fastapi import APIRouter, Depends
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.current_user import get_current_user
from app.models import User  # adjust import if your User model is elsewhere

from .schemas import ChatRequest, ChatResponse
from .services import ChatService

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)

service = ChatService()


@router.post(
    "",
    response_model=ChatResponse,
)
async def chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    response = await service.chat(
        user_id=current_user.id,
        message=body.message,
        db=db,
    )

    return ChatResponse(
        response=response,
    )