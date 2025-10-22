from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.controllers import (
    room_router,
    guest_router,
    reservation_router,
    checkin_router,
    report_router,
    auth_router,
    guest_auth_router
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Hotel Reception System API",
    description="API for hotel check-in/check-out management system",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(guest_auth_router, prefix="/api")
app.include_router(room_router, prefix="/api")
app.include_router(guest_router, prefix="/api")
app.include_router(reservation_router, prefix="/api")
app.include_router(checkin_router, prefix="/api")
app.include_router(report_router, prefix="/api")

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Hotel Reception System API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "status": "running"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )
