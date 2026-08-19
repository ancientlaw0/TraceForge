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
    alerts = relationship( "Alert", back_populates="user", cascade="all, delete-orphan", )
    usage_limit = relationship( "UsageLimit", back_populates="user", uselist=False, cascade="all, delete-orphan", )

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
    status = Column(
        Enum( TraceStatus, values_callable=lambda enum_class: [ member.value for member in enum_class ], ),
        nullable=False,
    )
    error_message = Column( Text, nullable=True )
    metadata_trace = Column( JSON, nullable=True )
    created_at = Column( DateTime(timezone=True), server_default=func.now(), nullable=False )

    user = relationship( "User", back_populates="traces" )
    api_key = relationship( "APIKey", back_populates="traces" )


class AlertMetric(enum.Enum):
    LATENCY_AVG = "latency_avg"
    LATENCY_MAX = "latency_max"
    ERROR_RATE = "error_rate"
    TIMEOUT_RATE = "timeout_rate"
    COST = "cost"
    TOTAL_TOKENS = "total_tokens"


class AlertOperator(enum.Enum):
    GREATER_THAN = ">"
    GREATER_THAN_EQUAL = ">="
    LESS_THAN = "<"
    LESS_THAN_EQUAL = "<="


class AlertWindow(int, enum.Enum):
    FIVE = 5
    FIFTEEN = 15
    THIRTY = 30
    SIXTY = 60
    ONE_TWENTY = 120


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column( Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, )
    metric = Column( Enum(AlertMetric), nullable=False, )
    operator = Column( Enum(AlertOperator), nullable=False, default=AlertOperator.GREATER_THAN, )
    threshold_value = Column( Numeric(12, 2), nullable=False, )
    window_minutes = Column(Integer, nullable=False)
    enabled = Column( Boolean, default=True, nullable=False, )
    cooldown_minutes = Column( Integer, default=30, nullable=False, )
    last_triggered_at = Column( DateTime(timezone=True), nullable=True, )
    created_at = Column( DateTime(timezone=True), server_default=func.now(), nullable=False, )

    user = relationship( "User", back_populates="alerts", )


class UsageLimit(Base):
    __tablename__ = "usage_limits"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column( Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True, )
    enabled = Column( Boolean, nullable=False, default=True, )
    max_requests_per_minute = Column( Integer, nullable=True, )
    max_requests_per_hour = Column( Integer, nullable=True, )
    max_requests_per_day = Column( Integer, nullable=True, )
    max_input_tokens_per_day = Column( Integer, nullable=True, )
    max_output_tokens_per_day = Column( Integer, nullable=True, )
    max_cost_per_day = Column( Numeric(10, 4), nullable=True, )
    block_on_limit = Column( Boolean, nullable=False, default=True, )
    created_at = Column( DateTime(timezone=True), server_default=func.now(), nullable=False, )
    updated_at = Column( DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False, )

    user = relationship( "User", back_populates="usage_limit", )