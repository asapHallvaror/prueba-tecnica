from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, LoginData, Token, UserRead
from app.services.security import hash_password, verify_password, create_access_token
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserRead, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Solo bloquear cuando se intenta registrar admin y ya existe uno
    if user_in.role == UserRole.admin:
        existing_admin = db.query(User).filter(User.role == UserRole.admin).first()
        if existing_admin:
            raise HTTPException(status_code=403, detail="Ya existe un administrador")

    # Crear usuario normalmente
    hashed_pw = get_password_hash(user_in.password)
    user = User(
        id=uuid.uuid4(),
        email=user_in.email,
        password_hash=hashed_pw,
        role=user_in.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(data: LoginData, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)}, expires_delta=timedelta(minutes=60))
    return {"access_token": token, "token_type": "bearer"}
