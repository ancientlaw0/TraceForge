from sqlalchemy import Column, Integer, String, DateTime,   String, Boolean,DateTime, ForeignKey, func
from app.database import Base
from sqlalchemy.orm import relationship

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