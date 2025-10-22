from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.models import Guest
from app.schemas import GuestCreate
from app.config import settings
from app.database import get_db

# JWT Bearer token
security = HTTPBearer()

class GuestAuthService:
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password using bcrypt"""
        # Convertir a bytes y hashear
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        # Retornar como string
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a bcrypt hash"""
        # Convertir ambos a bytes
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        # Verificar
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def get_guest_by_email(db: Session, email: str) -> Optional[Guest]:
        """Get guest by email"""
        return db.query(Guest).filter(Guest.email == email).first()
    
    @staticmethod
    def get_guest_by_document(db: Session, id_document: str) -> Optional[Guest]:
        """Get guest by ID document"""
        return db.query(Guest).filter(Guest.id_document == id_document).first()
    
    @staticmethod
    def create_guest(db: Session, guest_data: GuestCreate) -> Guest:
        """Create a new guest with hashed password"""
        hashed_password = GuestAuthService.get_password_hash(guest_data.password)
        
        db_guest = Guest(
            first_name=guest_data.first_name,
            last_name=guest_data.last_name,
            email=guest_data.email,
            phone=guest_data.phone,
            id_document=guest_data.id_document,
            nationality=guest_data.nationality,
            date_of_birth=guest_data.date_of_birth,
            address=guest_data.address,
            password_hash=hashed_password
        )
        
        db.add(db_guest)
        db.commit()
        db.refresh(db_guest)
        return db_guest
    
    @staticmethod
    def authenticate_guest(db: Session, email: str, password: str) -> Optional[Guest]:
        """Authenticate guest with email and password"""
        guest = GuestAuthService.get_guest_by_email(db, email)
        if not guest:
            return None
        if not hasattr(guest, 'password_hash') or not guest.password_hash:
            return None
        if not GuestAuthService.verify_password(password, guest.password_hash):
            return None
        return guest
    
    @staticmethod
    def get_current_guest(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)
    ) -> Guest:
        """Get current authenticated guest from JWT token"""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar las credenciales",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        try:
            token = credentials.credentials
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email: str = payload.get("sub")
            token_type: str = payload.get("type")
            
            if email is None or token_type != "guest":
                raise credentials_exception
                
        except JWTError:
            raise credentials_exception
        
        guest = GuestAuthService.get_guest_by_email(db, email=email)
        if guest is None:
            raise credentials_exception
            
        return guest
