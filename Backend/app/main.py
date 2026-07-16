from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.routes import auth, api_keys, trace
from app.kafka.producer import start_producer, stop_producer


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await start_producer()

    yield # prt that tells go do your work it is initialised

    # Shutdown
    await stop_producer()


app = FastAPI(
    title="TraceForge API",
    lifespan=lifespan
)

app.include_router(auth.router)
app.include_router(api_keys.router)
app.include_router(trace.router)


@app.get("/")
async def root():
    return {
        "message": "TraceForge Backend Running"
    }