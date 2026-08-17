from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.database import SessionLocal
from app.models import Trace
from app.redis.metric_service import redis_metrics
import logging

logger = logging.getLogger(__name__)


async def process(event: dict):
    async with SessionLocal() as db:
        try:
            trace = Trace(**event)

            db.add(trace)
            await db.commit()
            await db.refresh(trace)
            await redis_metrics.process(trace)

            logger.info(f"Stored trace: {trace.trace_id}")

        except SQLAlchemyError as e:
            await db.rollback()
            logger.exception(f"Database error: {e}")

        except IntegrityError as e:
            await db.rollback()

            if "trace_id" in str(e.orig):
                logger.warning(
                    f"Duplicate trace ignored: {event['trace_id']}"
                )
            else:
                logger.exception(f"Integrity error: {e}")

        except Exception as e:
            logger.exception(f"Unexpected error: {e}")