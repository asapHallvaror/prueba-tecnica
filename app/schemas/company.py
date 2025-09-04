from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class CompanyCreate(BaseModel):
    name: str
    tax_id: str | None = None
    country: str = "CL"

class CompanyUpdate(BaseModel):
    name: str | None = None
    tax_id: str | None = None
    country: str | None = None

class CompanyRead(BaseModel):
    id: UUID
    name: str
    tax_id: str | None
    country: str
    created_at: datetime

    class Config:
        from_attributes = True
