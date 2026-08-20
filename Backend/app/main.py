from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.routes import api_keys, auth
from app.auth.routes import trace
from app.kafka.producer import start_producer, stop_producer
from app.redis.client import redis_client
from app.alerts.routes import router as alert_router
from app.live.routes import router as live_router
from app.chat.routes import router as chat_router
from app.analytics.routes import router as analytics_router
from app.usage.routes import router as usage_router


@asynccontextmanager
async def lifespan(app: FastAPI):

    # Startup
    await start_producer()

    await redis_client.ping()
    print(" Redis Connected")

    yield  #prt that tells go do your work it is initialised


    # Shutdown
    await stop_producer()
    await redis_client.close()


app = FastAPI(
    title="TraceForge API",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(api_keys.router)
app.include_router(trace.router)
app.include_router(alert_router)
app.include_router(live_router)
app.include_router(chat_router)
app.include_router(analytics_router)
app.include_router(usage_router)

for route in app.routes:
    print(
        "ROUTE:",
        getattr(route, "path", None),
        type(route).__name__,
    )

@app.get("/")
async def root():
    return {
        "message": "TraceForge Backend Running"
    }