from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class ChatDatabase:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def execute(self, sql: str):

        result = await self.db.execute(
            text(sql)
        )

        return result.mappings().all()