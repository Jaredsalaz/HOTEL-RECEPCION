from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import CheckInRequest, CheckOutRequest, Reservation, MessageResponse
from app.services import ReservationService

router = APIRouter(prefix="/checkin", tags=["Check-in/Check-out"])

@router.post("/", response_model=Reservation, status_code=status.HTTP_201_CREATED)
def check_in(check_in_request: CheckInRequest, db: Session = Depends(get_db)):
    """
    Process check-in
    - Verifies room availability
    - Creates guest if doesn't exist
    - Creates reservation
    - Updates room status to OCCUPIED
    """
    try:
        reservation = ReservationService.check_in(db, check_in_request)
        return reservation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/checkout", response_model=Reservation)
def check_out(checkout_request: CheckOutRequest, db: Session = Depends(get_db)):
    """
    Process check-out
    - Completes reservation
    - Updates room status to AVAILABLE
    - Records actual check-out time
    """
    try:
        reservation = ReservationService.check_out(db, checkout_request.reservation_id)
        return reservation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/verify/{room_id}")
def verify_availability(
    room_id: int,
    check_in: str,
    check_out: str,
    db: Session = Depends(get_db)
):
    """Verify if room is available for check-in"""
    from datetime import datetime
    
    try:
        check_in_date = datetime.fromisoformat(check_in)
        check_out_date = datetime.fromisoformat(check_out)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)")
    
    if check_out_date <= check_in_date:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")
    
    from app.services import RoomService
    
    is_available = RoomService.check_room_availability(db, room_id, check_in_date, check_out_date)
    room = RoomService.get_room_by_id(db, room_id)
    
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return {
        "available": is_available,
        "room": room,
        "message": "Room is available" if is_available else "Room is not available for selected dates"
    }
