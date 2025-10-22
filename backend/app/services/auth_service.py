import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.models import Administrator
from app.schemas import AdminCreate
from app.config import settings

class AuthService:
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password using bcrypt"""
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash password using bcrypt"""
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[str]:
        """Verify JWT token and return username"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                return None
            return username
        except JWTError:
            return None
    
    @staticmethod
    def authenticate_admin(db: Session, username: str, password: str) -> Optional[Administrator]:
        """Authenticate administrator"""
        admin = db.query(Administrator).filter(Administrator.username == username).first()
        if not admin:
            return None
        if not AuthService.verify_password(password, admin.password_hash):
            return None
        return admin
    
    @staticmethod
    def create_admin(db: Session, admin: AdminCreate) -> Administrator:
        """Create new administrator"""
        hashed_password = AuthService.get_password_hash(admin.password)
        db_admin = Administrator(
            username=admin.username,
            password_hash=hashed_password,
            full_name=admin.full_name,
            email=admin.email,
            role=admin.role
        )
        db.add(db_admin)
        db.commit()
        db.refresh(db_admin)
        return db_admin
    
    @staticmethod
    def get_admin_by_username(db: Session, username: str) -> Optional[Administrator]:
        """Get admin by username"""
        return db.query(Administrator).filter(Administrator.username == username).first()
