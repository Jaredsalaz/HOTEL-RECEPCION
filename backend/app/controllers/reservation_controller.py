from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date

from app.database import get_db
from app.schemas import (
    Reservation, ReservationCreate, ReservationCreateAuthenticated, ReservationUpdate, 
    CheckInRequest, CheckOutRequest, MessageResponse
)
from app.services import ReservationService
from app.services.email_service import EmailService
from app.models import Reservation as ReservationModel

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.get("/", response_model=List[Reservation])
def get_reservations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all reservations"""
    reservations = ReservationService.get_all_reservations(db, skip=skip, limit=limit)
    return reservations

@router.get("/{reservation_id}", response_model=Reservation)
def get_reservation(reservation_id: int, db: Session = Depends(get_db)):
    """Get reservation by ID"""
    reservation = ReservationService.get_reservation_by_id(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation

@router.post("/", response_model=Reservation, status_code=status.HTTP_201_CREATED)
def create_reservation(reservation: ReservationCreateAuthenticated, db: Session = Depends(get_db)):
    """Create new reservation for authenticated user"""
    try:
        return ReservationService.create_reservation_authenticated(db, reservation)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{reservation_id}", response_model=Reservation)
def update_reservation(
    reservation_id: int, 
    reservation_update: ReservationUpdate, 
    db: Session = Depends(get_db)
):
    """Update reservation"""
    reservation = ReservationService.update_reservation(db, reservation_id, reservation_update)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation

@router.delete("/{reservation_id}", response_model=MessageResponse)
def cancel_reservation(reservation_id: int, db: Session = Depends(get_db)):
    """Cancel reservation"""
    try:
        ReservationService.cancel_reservation(db, reservation_id)
        return MessageResponse(message="Reservation cancelled successfully")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status/active", response_model=List[Reservation])
def get_active_reservations(db: Session = Depends(get_db)):
    """Get all active reservations"""
    return ReservationService.get_active_reservations(db)

@router.get("/status/pending", response_model=List[Reservation])
def get_pending_reservations(db: Session = Depends(get_db)):
    """Get all pending reservations"""
    return ReservationService.get_pending_reservations(db)

@router.get("/today/checkins", response_model=List[Reservation])
def get_todays_checkins(db: Session = Depends(get_db)):
    """Get today's check-ins"""
    return ReservationService.get_todays_checkins(db)

@router.get("/today/checkouts", response_model=List[Reservation])
def get_todays_checkouts(db: Session = Depends(get_db)):
    """Get today's check-outs"""
    return ReservationService.get_todays_checkouts(db)

@router.get("/room/{room_id}", response_model=List[Reservation])
def get_room_reservations(room_id: int, db: Session = Depends(get_db)):
    """Get all reservations for a specific room"""
    return ReservationService.get_reservations_by_room(db, room_id)

@router.get("/room/{room_id}/blocked-dates")
def get_room_blocked_dates(room_id: int, db: Session = Depends(get_db)):
    """Get all blocked dates for a specific room (dates with active reservations)"""
    from app.models import Room
    from datetime import timedelta
    
    # Check if room exists
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")
    
    # Get all active and pending reservations for this room
    reservations = db.query(ReservationModel).filter(
        ReservationModel.room_id == room_id,
        ReservationModel.status.in_(["Active", "Pending"]),
        ReservationModel.check_out_date >= date.today()
    ).all()
    
    # Build list of all blocked dates
    blocked_dates = []
    for reservation in reservations:
        current_date = reservation.check_in_date
        while current_date < reservation.check_out_date:
            blocked_dates.append(current_date.isoformat())
            current_date += timedelta(days=1)
    
    return {
        "room_id": room_id,
        "blocked_dates": blocked_dates
    }

@router.get("/guest/{guest_id}", response_model=List[Reservation])
def get_guest_reservations(guest_id: int, db: Session = Depends(get_db)):
    """Get all reservations for a specific guest"""
    return ReservationService.get_reservations_by_guest(db, guest_id)

@router.post("/check-availability")
def check_room_availability(
    room_id: int,
    check_in: date,
    check_out: date,
    guests_count: int,
    db: Session = Depends(get_db)
):
    """
    Check if a room is available for the specified dates and capacity
    Returns availability status and any conflict details
    """
    try:
        # Validate dates
        if check_in >= check_out:
            raise HTTPException(
                status_code=400, 
                detail="La fecha de salida debe ser posterior a la fecha de entrada"
            )
        
        if check_in < date.today():
            raise HTTPException(
                status_code=400,
                detail="La fecha de entrada no puede ser en el pasado"
            )
        
        # Get room from database
        from app.models import Room
        room = db.query(Room).filter(Room.id == room_id).first()
        
        if not room:
            raise HTTPException(status_code=404, detail="Habitación no encontrada")
        
        # Check room status
        if room.status != "Available":
            return {
                "available": False,
                "reason": f"La habitación está actualmente en estado: {room.status}",
                "room_id": room_id
            }
        
        # Check capacity
        if guests_count > room.capacity:
            return {
                "available": False,
                "reason": f"La habitación tiene capacidad para {room.capacity} personas. Solicitaste {guests_count}",
                "room_id": room_id,
                "max_capacity": room.capacity
            }
        
        # Check for conflicting reservations
        from app.models import Reservation as ReservationModel
        conflicting_reservations = db.query(ReservationModel).filter(
            ReservationModel.room_id == room_id,
            ReservationModel.status.in_(["Pending", "Active"]),
            ReservationModel.check_in_date < check_out,
            ReservationModel.check_out_date > check_in
        ).all()
        
        if conflicting_reservations:
            conflicts = [
                {
                    "check_in": str(res.check_in_date),
                    "check_out": str(res.check_out_date),
                    "status": res.status
                }
                for res in conflicting_reservations
            ]
            return {
                "available": False,
                "reason": "La habitación ya está reservada para estas fechas",
                "room_id": room_id,
                "conflicts": conflicts
            }
        
        # Room is available
        return {
            "available": True,
            "message": "La habitación está disponible para las fechas seleccionadas",
            "room_id": room_id,
            "room_number": room.room_number,
            "price_per_night": float(room.price_per_night),
            "total_nights": (check_out - check_in).days,
            "total_price": float(room.price_per_night) * (check_out - check_in).days
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al verificar disponibilidad: {str(e)}")

@router.post("/{reservation_id}/send-confirmation")
async def send_reservation_confirmation(
    reservation_id: int,
    db: Session = Depends(get_db)
):
    """
    Send confirmation email for a reservation
    """
    try:
        # Get reservation with related data
        from app.models import Reservation as ReservationModel, Guest, Room
        
        reservation = db.query(ReservationModel)\
            .filter(ReservationModel.id == reservation_id)\
            .first()
        
        if not reservation:
            raise HTTPException(status_code=404, detail="Reserva no encontrada")
        
        # Get guest and room info
        guest = db.query(Guest).filter(Guest.id == reservation.guest_id).first()
        room = db.query(Room).filter(Room.id == reservation.room_id).first()
        
        if not guest or not room:
            raise HTTPException(status_code=404, detail="Información de huésped o habitación no encontrada")
        
        # Prepare email data
        reservation_data = {
            'reservation_id': reservation.id,
            'guest_name': f"{guest.first_name} {guest.last_name}",
            'room_number': room.room_number,
            'room_type': room.type,
            'check_in': reservation.check_in_date.strftime('%d/%m/%Y'),
            'check_out': reservation.check_out_date.strftime('%d/%m/%Y'),
            'guests_count': reservation.guests_count,
            'total_nights': (reservation.check_out_date - reservation.check_in_date).days,
            'total_price': float(reservation.total_price)
        }
        
        # Send email
        email_sent = await EmailService.send_confirmation_email(
            recipient_email=guest.email,
            reservation_data=reservation_data
        )
        
        if email_sent:
            return {
                "success": True,
                "message": "Email de confirmación enviado exitosamente",
                "email": guest.email
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Error al enviar el email de confirmación"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al enviar confirmación: {str(e)}"
        )
