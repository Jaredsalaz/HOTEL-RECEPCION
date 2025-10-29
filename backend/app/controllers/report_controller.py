from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db
from app.schemas import DashboardStats
from app.services import ReportService
from app.middleware.admin_middleware import verify_admin_token
from app.config import settings

router = APIRouter(
    prefix=f"{settings.ADMIN_ROUTE_PREFIX}/reports", 
    tags=["Admin Reports"],
    dependencies=[Depends(verify_admin_token)]  # Todas las rutas requieren admin
)

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    return ReportService.get_dashboard_stats(db)

@router.get("/occupancy/pdf")
def download_occupancy_pdf(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db)
):
    """Download occupancy report as PDF"""
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD)")
    
    if end <= start:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    
    pdf_buffer = ReportService.generate_occupancy_pdf(db, start, end)
    
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=occupancy_report_{start_date}_to_{end_date}.pdf"
        }
    )

@router.get("/occupancy/excel")
def download_occupancy_excel(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db)
):
    """Download occupancy report as Excel"""
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD)")
    
    if end <= start:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    
    excel_buffer = ReportService.generate_occupancy_excel(db, start, end)
    
    return Response(
        content=excel_buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename=occupancy_report_{start_date}_to_{end_date}.xlsx"
        }
    )

@router.get("/rooms-status")
def get_room_status_report(db: Session = Depends(get_db)):
    """Get current status of all rooms"""
    return ReportService.get_room_status_report(db)

@router.get("/occupancy-rate")
def get_occupancy_rate(db: Session = Depends(get_db)):
    """Get current occupancy rate"""
    stats = ReportService.get_dashboard_stats(db)
    return {
        "occupancy_rate": stats.occupancy_rate,
        "occupied_rooms": stats.occupied_rooms,
        "total_rooms": stats.total_rooms,
        "available_rooms": stats.available_rooms
    }
