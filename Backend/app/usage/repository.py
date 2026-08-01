from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import UsageLimit
from app.usage.schemas import  UsageLimitCreate,    UsageLimitUpdate

class UsageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user_id(
        self,
        user_id: int,
    ) -> UsageLimit | None:
        stmt = (
            select(UsageLimit)
            .where(UsageLimit.user_id == user_id)
        )

        result = await self.db.execute(stmt)

        return result.scalar_one_or_none()

    async def create(
        self,
        user_id: int,
        data: UsageLimitCreate,
    ) -> UsageLimit:

        usage_limit = UsageLimit(
            user_id=user_id,
            **data.model_dump(),
        )

        self.db.add(usage_limit)

        await self.db.commit()
        await self.db.refresh(usage_limit)

        return usage_limit

    async def update(
        self,
        usage_limit: UsageLimit,
        data: UsageLimitUpdate,
    ) -> UsageLimit:

        update_data = data.model_dump(
            exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(usage_limit, key, value)

        await self.db.commit()
        await self.db.refresh(usage_limit)

        return usage_limit

    async def delete(
        self,
        usage_limit: UsageLimit,
    ) -> None:

        await self.db.delete(usage_limit)
        await self.db.commit()