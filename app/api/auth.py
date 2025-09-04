from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from app.schemas.user import UserCreate, LoginData, Token, UserRead
from app.services.security import hash_password, verify_password, create_access_token
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserRead, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Permitir crear el primer usuario siempre
    if db.query(User).count() > 0:
        raise HTTPException(status_code=403, detail="Registration disabled (admin only)")

    user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password),
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
