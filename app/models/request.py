from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from app.db import Base

class RequestStatus(str, enum.Enum):
    pending = "pending"
    in_review = "in_review"
    approved = "approved"
    rejected = "rejected"

class Request(Base):
    __tablename__ = "requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    status = Column(Enum(RequestStatus), default=RequestStatus.pending, nullable=False)
    risk_inputs = Column(JSON, nullable=False)
    risk_score = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", backref="requests")
