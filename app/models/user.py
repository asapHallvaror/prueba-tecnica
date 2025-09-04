from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
import enum
from app.db import Base

class UserRole(str, enum.Enum):
    admin = "admin"
    analyst = "analyst"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.analyst, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
