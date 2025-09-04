from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.db import get_db
from app.models.request import Request, RequestStatus
from app.models.company import Company
from app.schemas.request import RequestCreate, RequestRead, RequestUpdate
from app.services.risk import calculate_risk

router = APIRouter(prefix="/requests", tags=["Requests"])

@router.post("/", response_model=RequestRead, status_code=201)
def create_request(req_in: RequestCreate, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == req_in.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    score = calculate_risk(req_in.risk_inputs)
    req = Request(company_id=req_in.company_id, risk_inputs=req_in.risk_inputs, risk_score=score)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

@router.get("/", response_model=List[RequestRead])
def list_requests(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    q: str | None = None,
    status: RequestStatus | None = None,
    risk_min: int | None = None,
    risk_max: int | None = None,
    company_id: str | None = None
):
    query = db.query(Request).options(joinedload(Request.company))

    if q:
        query = query.join(Company).filter(Company.name.ilike(f"%{q}%"))
    if status:
        query = query.filter(Request.status == status)
    if company_id:
        query = query.filter(Request.company_id == company_id)
    if risk_min is not None:
        query = query.filter(Request.risk_score >= risk_min)
    if risk_max is not None:
        query = query.filter(Request.risk_score <= risk_max)

    total = query.count()
    requests = query.offset((page - 1) * page_size).limit(page_size).all()
    return requests

@router.get("/{request_id}", response_model=RequestRead)
def get_request(request_id: str, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req

@router.put("/{request_id}", response_model=RequestRead)
def update_request(request_id: str, req_in: RequestUpdate, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req_in.status:
        req.status = req_in.status
    if req_in.risk_inputs:
        req.risk_inputs = req_in.risk_inputs
        req.risk_score = calculate_risk(req_in.risk_inputs)

    db.commit()
    db.refresh(req)
    return req

@router.delete("/{request_id}", status_code=204)
def delete_request(request_id: str, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    db.delete(req)
    db.commit()
    return None
