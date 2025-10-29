"""
Admin Middleware
Verifies that requests are made by authenticated administrators
"""
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.config import settings
from app.database import get_db
from app.models import Administrator

security = HTTPBearer()


def verify_admin_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Administrator:
    """
    Verify that the provided token belongs to an administrator
    
    Args:
        credentials: HTTP Authorization credentials with Bearer token
        db: Database session
        
    Returns:
        Administrator: The authenticated administrator
        
    Raises:
        HTTPException: If token is invalid or user is not an admin
    """
    token = credentials.credentials
    
    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: usuario no encontrado",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify admin exists in database
    admin = db.query(Administrator).filter(
        Administrator.username == username
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: Solo administradores pueden acceder a este recurso",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return admin


def require_admin():
    """
    Dependency to require admin authentication
    Use in route decorators like: dependencies=[Depends(require_admin())]
    """
    return Depends(verify_admin_token)
