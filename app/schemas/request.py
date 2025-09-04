from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from enum import Enum
from typing import Optional, Dict

class RequestStatus(str, Enum):
    pending = "pending"
    in_review = "in_review"
    approved = "approved"
    rejected = "rejected"

class RequestCreate(BaseModel):
    company_id: UUID
    risk_inputs: Dict

class RequestUpdate(BaseModel):
    status: Optional[RequestStatus] = None
    risk_inputs: Optional[Dict] = None

class RequestRead(BaseModel):
    id: UUID
    company_id: UUID
    status: RequestStatus
    risk_inputs: Dict
    risk_score: int
    created_at: datetime

    class Config:
        from_attributes = True
