import logging
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.database import SessionLocal
from app.models import Trace
from app.redis.metric_service import redis_metrics

logger = logging.getLogger(__name__)

async def process(event: dict):

    async with SessionLocal() as db:

        try:
            trace = Trace(**event)

            db.add(trace)

            await db.commit()

            await db.refresh(trace)

            await redis_metrics.process(trace)

        except IntegrityError:
            await db.rollback()

            logger.warning(
                "Integrity error while processing trace: %s",
                event.get("trace_id"),
            )

        except SQLAlchemyError:
            await db.rollback()

            logger.exception(
                "Database error while processing trace: %s",
                event.get("trace_id"),
            )

        except Exception:
            await db.rollback()

            logger.exception(
                "Unexpected error while processing trace: %s",
                event.get("trace_id"),
            )