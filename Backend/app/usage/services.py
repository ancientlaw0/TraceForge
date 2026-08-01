from app.usage.repository import UsageRepository
from app.usage.schemas import  UsageLimitCreate, UsageLimitUpdate 
from app.models import UsageLimit

class UsageService:
    def __init__(self, repository: UsageRepository):
        self.repository = repository
    async def get_limits(
        self,
        user_id: int,
    ) -> UsageLimit:
        usage = await self.repository.get_by_user_id(user_id)
        if usage is None:
            usage = await self.repository.create(
                user_id,
                UsageLimitCreate(),
            )
        return usage

    async def update_limits(
        self,
        user_id: int,
        data: UsageLimitUpdate,
    ) -> UsageLimit:
        usage = await self.repository.get_by_user_id(user_id)
        if usage is None:
            usage = await self.repository.create(
                user_id,
                UsageLimitCreate(),
            )
        usage = await self.repository.update(
            usage,
            data,
        )
        return usage

    async def delete_limits(
        self,
        user_id: int,
    ) -> None:
        usage = await self.repository.get_by_user_id(user_id)
        if usage is None:
            return
        await self.repository.delete(usage)