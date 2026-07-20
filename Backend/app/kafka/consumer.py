import asyncio
import json
import logging

from aiokafka import AIOKafkaConsumer
from sqlalchemy.exc import SQLAlchemyError,IntegrityError
from app.handlers import trace_handler
from app.database import SessionLocal
from app.models import Trace
from core.config import settings
from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


consumer = AIOKafkaConsumer(
    settings.TRACE_TOPIC,
    bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
    group_id=settings.TRACE_CONSUMER_GROUP,
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
)


async def handle_event(event: dict): # renamed cause its not only trace but various eevent to handle  
    await trace_handler.process(event)

async def consume():
    await consumer.start()
    logger.info("Consumer started...")

    try:
        async for message in consumer:
            await handle_event(message.value)

    finally:
        await consumer.stop()
        logger.info("Consumer stopped.")


if __name__ == "__main__": # main is used when we are sunning thhe file directly
    # and normalliy its app.kafka.consumer else consumer starts running whenever we import it
    asyncio.run(consume())