from sqlalchemy import Column,Numeric,Enum,UUID, Integer,JSON, String, DateTime,   String, Boolean,DateTime, ForeignKey, func, Text, Float
from app.database import Base
from sqlalchemy.orm import relationship
import enum
import uuid

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    api_keys = relationship( "APIKey", back_populates="owner", cascade="all, delete-orphan" )
    traces = relationship( "Trace", back_populates="user", cascade="all, delete-orphan" )

class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column( Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False )
    name = Column( String(100), nullable=False )
    key_hash = Column( String(255), nullable=False, unique=True )
    is_active = Column( Boolean, default=True, nullable=False )
    last_used_at = Column( DateTime(timezone=True), nullable=True )
    created_at = Column( DateTime(timezone=True), server_default=func.now(), nullable=False )

    owner = relationship( "User", back_populates="api_keys" )
    traces = relationship( "Trace", back_populates="api_key", cascade="all, delete-orphan" )

class TraceStatus(enum.Enum):
    SUCCESS = "success"
    ERROR = "error"
    TIMEOUT = "timeout"


class Trace(Base):
    __tablename__ = "traces"

    id = Column( Integer, primary_key=True, index=True )
    trace_id = Column( UUID(as_uuid=True), unique=True, nullable=False, index=True, default=uuid.uuid4 )
    user_id = Column( Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False )
    api_key_id = Column( Integer, ForeignKey("api_keys.id", ondelete="CASCADE"), nullable=False )
    provider = Column( String(50), nullable=False )
    model = Column( String(100), nullable=False )
    prompt = Column( Text, nullable=False )
    response = Column( Text, nullable=False )
    latency_ms = Column( Float, nullable=False )
    input_tokens = Column( Integer, nullable=False )
    output_tokens = Column( Integer, nullable=False )
    cost = Column( Numeric(10,6), nullable=False )
    status = Column( Enum(TraceStatus), nullable=False )
    error_message = Column( Text, nullable=True )
    metadata_trace = Column( JSON, nullable=True )
    created_at = Column( DateTime(timezone=True), server_default=func.now(), nullable=False )

    user = relationship( "User", back_populates="traces" )
    api_key = relationship( "APIKey", back_populates="traces" )