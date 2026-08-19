# Configuring the databse road bwtween postgre and sql alchemy by creating connections
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker 
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv
from app.core.config import settings

load_dotenv()

DATABASE_URL = settings.DATABASE_URL

engine = create_async_engine(DATABASE_URL, echo=False)# echo is print every sql query later we can put it true for debug

SessionLocal = async_sessionmaker(
    class_=AsyncSession,
    expire_on_commit=False, # after commit it flushes all of the data then it needs reload after commit which isnt needed
    bind=engine # autocommie no more on 2.0
)

Base = declarative_base() # collecting metadata


async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
       await db.close()