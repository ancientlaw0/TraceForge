import json
from app.core.config import settings
from typing import Any

from aiokafka import AIOKafkaProducer
from dotenv import load_dotenv

load_dotenv()

BOOTSTRAP_SERVERS = (settings.KAFKA_BOOTSTRAP_SERVERS, "localhost:9092")

producer: AIOKafkaProducer | None = None

async def start_producer() -> None:
    """ Creates a single Kafka producer for the entire application. Called once when FastAPI starts. """
    global producer
    producer = AIOKafkaProducer(
        bootstrap_servers=BOOTSTRAP_SERVERS,
        value_serializer=lambda value: json.dumps(value).encode("utf-8"),
        key_serializer=lambda key: str(key).encode("utf-8"),
    )
    await producer.start()


async def stop_producer() -> None:
    """ Closes the Kafka producer. Called once when FastAPI shuts down. """
    global producer
    if producer is not None:
        await producer.stop()
        producer = None

async def publish_event(
    topic: str,
    key: str,
    event: dict[str, Any],
) -> None:

    if producer is None:
        raise RuntimeError("Kafka producer has not been started.")
    await producer.send( topic=topic, key=key, value=event, )