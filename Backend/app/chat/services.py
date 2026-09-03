from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.llm.client import LLMClient

from .database import ChatDatabase
from .prompts import get_sql_prompt, get_response_prompt
from .validator import validate_sql


class ChatService:
    def __init__(self):
        self.llm = LLMClient()

    async def chat(
        self,
        db: AsyncSession,
        user_id: int,
        message: str,
    ) -> str:

        sql = await self.generate_sql(
            user_id=user_id,
            question=message,
        )

        if sql.strip() == "NOT_DATABASE_QUERY":
            return await self.llm.generate(
                system_prompt=get_response_prompt(),
                user_prompt=f"""
User Question:
{message}

This question is not related to TraceForge database data.

Explain politely that you can only answer questions related
to the user's TraceForge traces, analytics, usage, alerts,
latency, tokens, costs, errors, or other available data.

Keep the answer concise.
""",
            )
        try:
            validate_sql(
                sql=sql,
                user_id=user_id,
            )
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )


        database = ChatDatabase(db)

        rows = await database.execute(sql)

        answer = await self.summarize(
            question=message,
            rows=rows,
        )

        return answer

    async def generate_sql(
        self,
        user_id: int,
        question: str,
    ) -> str:

        return await self.llm.generate(
            system_prompt=get_sql_prompt(user_id),
            user_prompt=question,
        )

    async def summarize(
        self,
        question: str,
        rows,
    ) -> str:

        return await self.llm.generate(
            system_prompt=get_response_prompt(),
            user_prompt=f"""
User Question:
{question}

Database Result:
{rows}

Answer the user's question naturally.

Do not mention SQL.

If the result is empty, politely tell the user
no matching data was found.
""",
        )