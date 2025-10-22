from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.schemas import GuestCreate, GuestLogin, Token, GuestResponse
from app.services import GuestAuthService
from app.config import settings

router = APIRouter(prefix="/auth/guest", tags=["Guest Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_guest(guest_data: GuestCreate, db: Session = Depends(get_db)):
    """
    Register a new guest user and return JWT token
    """
    # Check if email already exists
    existing_guest = GuestAuthService.get_guest_by_email(db, guest_data.email)
    if existing_guest:
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado"
        )
    
    # Check if id_document already exists
    existing_doc = GuestAuthService.get_guest_by_document(db, guest_data.id_document)
    if existing_doc:
        raise HTTPException(
            status_code=400,
            detail="El documento de identidad ya está registrado"
        )
    
    # Create new guest
    guest = GuestAuthService.create_guest(db, guest_data)
    
    # Create access token
    access_token = GuestAuthService.create_access_token(
        data={"sub": guest.email, "type": "guest"}
    )
    
    # Return token and user data
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": guest.id,
            "first_name": guest.first_name,
            "last_name": guest.last_name,
            "email": guest.email,
            "phone": guest.phone,
            "id_document": guest.id_document
        }
    }

@router.post("/login", response_model=Token)
def login_guest(credentials: GuestLogin, db: Session = Depends(get_db)):
    """
    Login guest and return JWT token
    """
    guest = GuestAuthService.authenticate_guest(db, credentials.email, credentials.password)
    
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = GuestAuthService.create_access_token(
        data={"sub": guest.email, "type": "guest", "guest_id": guest.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": guest.id,
            "first_name": guest.first_name,
            "last_name": guest.last_name,
            "email": guest.email,
            "phone": guest.phone,
            "id_document": guest.id_document
        }
    }

@router.get("/me", response_model=GuestResponse)
def get_current_guest(
    current_guest = Depends(GuestAuthService.get_current_guest)
):
    """
    Get current authenticated guest
    """
    return current_guest
