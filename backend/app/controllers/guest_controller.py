from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import Guest, GuestCreate, GuestUpdate, MessageResponse, Reservation
from app.services import GuestService

router = APIRouter(prefix="/guests", tags=["Guests"])

@router.get("/", response_model=List[Guest])
def get_guests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all guests"""
    guests = GuestService.get_all_guests(db, skip=skip, limit=limit)
    return guests

@router.get("/{guest_id}", response_model=Guest)
def get_guest(guest_id: int, db: Session = Depends(get_db)):
    """Get guest by ID"""
    guest = GuestService.get_guest_by_id(db, guest_id)
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    return guest

@router.get("/email/{email}", response_model=Guest)
def get_guest_by_email(email: str, db: Session = Depends(get_db)):
    """Get guest by email"""
    guest = GuestService.get_guest_by_email(db, email)
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    return guest

@router.post("/", response_model=Guest, status_code=status.HTTP_201_CREATED)
def create_guest(guest: GuestCreate, db: Session = Depends(get_db)):
    """Create new guest"""
    # Check if email already exists
    existing_guest = GuestService.get_guest_by_email(db, guest.email)
    if existing_guest:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if document already exists
    existing_guest = GuestService.get_guest_by_document(db, guest.id_document)
    if existing_guest:
        raise HTTPException(status_code=400, detail="ID document already registered")
    
    return GuestService.create_guest(db, guest)

@router.put("/{guest_id}", response_model=Guest)
def update_guest(guest_id: int, guest_update: GuestUpdate, db: Session = Depends(get_db)):
    """Update guest information"""
    guest = GuestService.update_guest(db, guest_id, guest_update)
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    return guest

@router.delete("/{guest_id}", response_model=MessageResponse)
def delete_guest(guest_id: int, db: Session = Depends(get_db)):
    """Delete guest (Admin only)"""
    success = GuestService.delete_guest(db, guest_id)
    if not success:
        raise HTTPException(status_code=404, detail="Guest not found")
    return MessageResponse(message="Guest deleted successfully")

@router.get("/search/{query}", response_model=List[Guest])
def search_guests(query: str, db: Session = Depends(get_db)):
    """Search guests by name, email or document"""
    guests = GuestService.search_guests(db, query)
    return guests

@router.get("/{guest_id}/history", response_model=List)
def get_guest_history(guest_id: int, db: Session = Depends(get_db)):
    """Get guest reservation history"""
    guest = GuestService.get_guest_by_id(db, guest_id)
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    from app.services import ReservationService
    reservations = ReservationService.get_reservations_by_guest(db, guest_id)
    return reservations

@router.get("/{guest_id}/reservations", response_model=List[Reservation])
def get_guest_reservations(guest_id: int, db: Session = Depends(get_db)):
    """Get all reservations for a specific guest with full details (room, etc.)"""
    guest = GuestService.get_guest_by_id(db, guest_id)
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    from app.services import ReservationService
    reservations = ReservationService.get_reservations_by_guest(db, guest_id)
    return reservations
