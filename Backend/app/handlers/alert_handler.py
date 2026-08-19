import asyncio

from app.database import SessionLocal
from app.redis.client import redis_client
from app.alerts.redis_reader import RedisMetricsReader
from app.alerts.scheduler import AlertScheduler

async def process():
    redis_reader = RedisMetricsReader( redis_client )

    async with SessionLocal() as db:
        scheduler = AlertScheduler( db=db, redis_reader=redis_reader, )
        await scheduler.run()


async def run():

    while True:
        try:
            await process()
        except Exception:

            await asyncio.sleep(10)

if __name__ == "__main__":
    asyncio.run(run())