from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import CheckInRequest, CheckOutRequest, Reservation, MessageResponse
from app.services import ReservationService
from app.services.email_service import EmailService

router = APIRouter(prefix="/checkin", tags=["Check-in/Check-out"])

@router.post("/", response_model=Reservation, status_code=status.HTTP_201_CREATED)
async def check_in(
    check_in_request: CheckInRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Process check-in (Create new reservation with immediate check-in)
    - Verifies room availability
    - Creates guest if doesn't exist
    - Creates reservation
    - Updates room status to OCCUPIED
    - Sends welcome email to guest
    """
    try:
        reservation = ReservationService.check_in(db, check_in_request)
        
        # Send check-in email in background
        reservation_data = {
            'reservation_id': reservation.id,
            'guest_name': f"{reservation.guest.first_name} {reservation.guest.last_name}",
            'room_number': reservation.room.room_number,
            'room_type': reservation.room.type,
            'check_in_date': reservation.check_in_date.strftime('%d/%m/%Y'),
            'check_out_date': reservation.check_out_date.strftime('%d/%m/%Y'),
            'actual_check_in': reservation.actual_check_in,
            'guests_count': reservation.guests_count
        }
        
        background_tasks.add_task(
            EmailService.send_checkin_email,
            reservation.guest.email,
            reservation_data
        )
        
        return reservation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/mark/{reservation_id}", response_model=Reservation)
async def mark_reservation_checkin(
    reservation_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Mark existing reservation as checked-in
    - Updates reservation status to ACTIVE
    - Records actual check-in time
    - Updates room status to OCCUPIED
    - Sends welcome email to guest
    """
    try:
        reservation = ReservationService.mark_checkin(db, reservation_id)
        
        # Send check-in email in background
        reservation_data = {
            'reservation_id': reservation.id,
            'guest_name': f"{reservation.guest.first_name} {reservation.guest.last_name}",
            'room_number': reservation.room.room_number,
            'room_type': reservation.room.type,
            'check_in_date': reservation.check_in_date.strftime('%d/%m/%Y'),
            'check_out_date': reservation.check_out_date.strftime('%d/%m/%Y'),
            'actual_check_in': reservation.actual_check_in,
            'guests_count': reservation.guests_count
        }
        
        background_tasks.add_task(
            EmailService.send_checkin_email,
            reservation.guest.email,
            reservation_data
        )
        
        return reservation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/checkout", response_model=Reservation)
async def check_out(
    checkout_request: CheckOutRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Process check-out
    - Completes reservation
    - Updates room status to AVAILABLE
    - Records actual check-out time
    - Sends thank you email to guest
    """
    try:
        reservation = ReservationService.check_out(db, checkout_request.reservation_id)
        
        # Calculate nights stayed
        nights = (reservation.check_out_date - reservation.check_in_date).days
        
        # Send check-out email in background
        reservation_data = {
            'reservation_id': reservation.id,
            'guest_name': f"{reservation.guest.first_name} {reservation.guest.last_name}",
            'room_number': reservation.room.room_number,
            'actual_check_out': reservation.actual_check_out,
            'nights': nights
        }
        
        background_tasks.add_task(
            EmailService.send_checkout_email,
            reservation.guest.email,
            reservation_data
        )
        
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
