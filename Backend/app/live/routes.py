from datetime import datetime
import asyncio
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from app.database import  AsyncSession # <-- your session factory
from app.dependencies.current_user import get_current_user
from app.dependencies.current_websocket import get_current_websocket_user
from app.live.schemas import LiveResponse
from app.live.service import LiveService
from app.models import User

router = APIRouter( prefix="/live", tags=["Live"], )
service = LiveService()
@router.get( "", response_model=LiveResponse, )
async def get_live(
    since: datetime,
    current_user: User = Depends(get_current_user),
):
    return await service.get_live(
        user_id=current_user.id,
        since=since,
    )

@router.websocket("/ws")
async def live_ws(websocket: WebSocket):
    await websocket.accept()
    token = websocket.query_params.get("token")
    since_str = websocket.query_params.get("since")
    if token is None or since_str is None:
        await websocket.close(code=1008)
        return
    since = datetime.fromisoformat(since_str)
    async with AsyncSession() as db:
        current_user = await get_current_websocket_user( token, db, )
        try:
            while True:
                data = await service.get_live( user_id=current_user.id, since=since, )
                await websocket.send_json(data)
                await asyncio.sleep(10)
        except WebSocketDisconnect:
            pass