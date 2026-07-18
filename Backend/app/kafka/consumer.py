import asyncio
import json
import logging

from aiokafka import AIOKafkaConsumer
from sqlalchemy.exc import SQLAlchemyError,IntegrityError

from app.database import SessionLocal
from app.models import Trace
from app.kafka.topics import TRACE_TOPIC
import os
from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


consumer = AIOKafkaConsumer(
    TRACE_TOPIC,
    bootstrap_servers="KAFKA_BOOTSTRAP_SERVERS",
    group_id="TRACE_CONSUMER_GROUP",
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
)


async def process_trace(event: dict):
    async with SessionLocal() as db:
        try:
            trace = Trace(**event)

            db.add(trace)
            await db.commit()

            logger.info(f"Stored trace: {trace.trace_id}")

        except SQLAlchemyError as e:
            await db.rollback()
            logger.exception(f"Database error: {e}")

        except IntegrityError as e:
            await db.rollback()

            if "trace_id" in str(e.orig): # checks if we have actually the trace id error or just normal integrity error
                logger.warning(
                    f"Duplicate trace ignored: {event['trace_id']}"
                )
            else:
                logger.exception(f"Integrity error: {e}")

        except Exception as e:
            logger.exception(f"Unexpected error: {e}")


async def consume():
    await consumer.start()
    logger.info("Consumer started...")

    try:
        async for message in consumer:
            await process_trace(message.value)

    finally:
        await consumer.stop()
        logger.info("Consumer stopped.")


if __name__ == "__main__": # main is used when we are sunning thhe file directly
    # and normalliy its app.kafka.consumer else consumer starts running whenever we import it
    asyncio.run(consume())