#!/usr/bin/env python3
"""
Script para poblar la base de datos con datos iniciales (seed data)
Crea usuario admin, empresas de ejemplo y solicitudes de prueba
"""

import sys
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Agregar el directorio raíz al path para importar los módulos de la app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import get_db
from app.models.user import User
from app.models.company import Company
from app.models.request import Request
from app.schemas.user import UserRole
from app.schemas.request import RequestStatus
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

def create_admin_user(db: Session):
    print("🔑 Creando usuario administrador...")

    existing_admin = db.query(User).filter(User.email == "admin@example.com").first()
    if existing_admin:
        print("   Usuario admin ya existe: admin@example.com")
        return existing_admin

    admin_user = User(
        email="admin@example.com",
        password_hash=pwd_context.hash("Admin123!"),
        role=UserRole.admin
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    print("   Usuario admin creado: admin@example.com / Admin123!")
    return admin_user

def create_companies(db: Session):
    print("\nCreando empresas de ejemplo...")

    companies_data = [
        {"name": "Acme SpA", "tax_id": "76.123.456-7", "country": "CL"},
        {"name": "Globex Ltd.", "tax_id": "20-12345678-9", "country": "AR"},
        {"name": "Initech", "tax_id": "12345678901", "country": "PE"},
        {"name": "Hooli", "tax_id": "98.765.432-1", "country": "CL"}
    ]

    created_companies = []
    for company_data in companies_data:
        existing = db.query(Company).filter(Company.tax_id == company_data["tax_id"]).first()
        if existing:
            print(f"   Empresa ya existe: {company_data['name']}")
            created_companies.append(existing)
            continue

        company = Company(**company_data)
        db.add(company)
        db.commit()
        db.refresh(company)

        created_companies.append(company)
        print(f"   Empresa creada: {company.name} ({company.tax_id})")

    return created_companies

def create_requests(db: Session, companies: list):
    print("\nCreando solicitudes de evaluación...")

    requests_data = [
        {"company": companies[0], "pep_flag": True, "sanction_list": False, "late_payments": 1, "status": RequestStatus.pending, "created_days_ago": 5},
        {"company": companies[1], "pep_flag": False, "sanction_list": True, "late_payments": 0, "status": RequestStatus.approved, "created_days_ago": 10},
        {"company": companies[2], "pep_flag": True, "sanction_list": True, "late_payments": 3, "status": RequestStatus.rejected, "created_days_ago": 3},
        {"company": companies[0], "pep_flag": False, "sanction_list": False, "late_payments": 2, "status": RequestStatus.pending, "created_days_ago": 1},
        {"company": companies[3], "pep_flag": False, "sanction_list": False, "late_payments": 0, "status": RequestStatus.approved, "created_days_ago": 7},
        {"company": companies[2], "pep_flag": True, "sanction_list": False, "late_payments": 1, "status": RequestStatus.pending, "created_days_ago": 2},
    ]

    created_requests = []
    for i, r in enumerate(requests_data, 1):
        score = 0
        if r["pep_flag"]:
            score += 60
        if r["sanction_list"]:
            score += 40
        score += min(r["late_payments"], 3) * 10
        score = min(score, 100)

        created_at = datetime.utcnow() - timedelta(days=r["created_days_ago"])

        request = Request(
            company_id=r["company"].id,
            risk_inputs={
                "pep_flag": r["pep_flag"],
                "sanction_list": r["sanction_list"],
                "late_payments": r["late_payments"]
            },
            risk_score=score,
            status=r["status"],
            created_at=created_at
        )
        db.add(request)
        db.commit()
        db.refresh(request)

        created_requests.append(request)
        print(f"   Solicitud {i} creada: {r['company'].name} "
              f"(Risk Score: {score}, Status: {r['status'].value})")

    return created_requests

def main():
    print("Iniciando seed de datos...")
    db = next(get_db())
    try:
        admin_user = create_admin_user(db)
        companies = create_companies(db)
        requests = create_requests(db, companies)
        print("\n Seed completado!")
    except Exception as e:
        print(f"Error en seed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
