from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyRead, CompanyUpdate
from typing import List

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.post("/", response_model=CompanyRead, status_code=201)
def create_company(company_in: CompanyCreate, db: Session = Depends(get_db)):
    company = Company(**company_in.dict())
    db.add(company)
    db.commit()
    db.refresh(company)
    return company

@router.get("/", response_model=List[CompanyRead])
def list_companies(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    q: str | None = None,
    order_by: str | None = None
):
    query = db.query(Company)
    if q:
        query = query.filter(Company.name.ilike(f"%{q}%"))
    if order_by == "name":
        query = query.order_by(Company.name.asc())
    elif order_by == "-name":
        query = query.order_by(Company.name.desc())

    total = query.count()
    companies = query.offset((page - 1) * page_size).limit(page_size).all()
    return companies

@router.get("/{company_id}", response_model=CompanyRead)
def get_company(company_id: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.put("/{company_id}", response_model=CompanyRead)
def update_company(company_id: str, company_in: CompanyUpdate, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    for field, value in company_in.dict(exclude_unset=True).items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)
    return company

@router.delete("/{company_id}", status_code=204)
def delete_company(company_id: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    if company.requests:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete a company with associated requests"
        )

    db.delete(company)
    db.commit()
    return None