from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.schemas import AdminCreate, AdminLogin, Admin, Token
from app.services import AuthService
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/register", response_model=Admin, status_code=status.HTTP_201_CREATED)
def register_admin(admin: AdminCreate, db: Session = Depends(get_db)):
    """Register new administrator"""
    # Check if username already exists
    existing_admin = AuthService.get_admin_by_username(db, admin.username)
    if existing_admin:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    return AuthService.create_admin(db, admin)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login administrator"""
    admin = AuthService.authenticate_admin(db, form_data.username, form_data.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": admin.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current authenticated administrator"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    username = AuthService.verify_token(token)
    if username is None:
        raise credentials_exception
    
    admin = AuthService.get_admin_by_username(db, username)
    if admin is None:
        raise credentials_exception
    
    return admin

@router.get("/me", response_model=Admin)
async def read_admin_me(current_admin: Admin = Depends(get_current_admin)):
    """Get current admin profile"""
    return current_admin
