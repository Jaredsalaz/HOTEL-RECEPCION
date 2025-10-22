from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.schemas import Room, RoomCreate, RoomUpdate, AvailabilityCheck, AvailabilityResponse, MessageResponse
from app.services import RoomService

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("/", response_model=List[Room])
def get_rooms(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all rooms"""
    rooms = RoomService.get_all_rooms(db, skip=skip, limit=limit)
    return rooms

@router.get("/{room_id}", response_model=Room)
def get_room(room_id: int, db: Session = Depends(get_db)):
    """Get room by ID"""
    room = RoomService.get_room_by_id(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.get("/number/{room_number}", response_model=Room)
def get_room_by_number(room_number: str, db: Session = Depends(get_db)):
    """Get room by room number"""
    room = RoomService.get_room_by_number(db, room_number)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.post("/", response_model=Room, status_code=status.HTTP_201_CREATED)
def create_room(room: RoomCreate, db: Session = Depends(get_db)):
    """Create new room (Admin only)"""
    # Check if room number already exists
    existing_room = RoomService.get_room_by_number(db, room.room_number)
    if existing_room:
        raise HTTPException(status_code=400, detail="Room number already exists")
    
    return RoomService.create_room(db, room)

@router.put("/{room_id}", response_model=Room)
def update_room(room_id: int, room_update: RoomUpdate, db: Session = Depends(get_db)):
    """Update room (Admin only)"""
    room = RoomService.update_room(db, room_id, room_update)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.delete("/{room_id}", response_model=MessageResponse)
def delete_room(room_id: int, db: Session = Depends(get_db)):
    """Delete room (Admin only)"""
    success = RoomService.delete_room(db, room_id)
    if not success:
        raise HTTPException(status_code=404, detail="Room not found")
    return MessageResponse(message="Room deleted successfully")

@router.get("/available/search", response_model=List[Room])
def search_available_rooms(
    check_in: datetime,
    check_out: datetime,
    room_type: Optional[str] = None,
    min_capacity: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Search available rooms for specific dates"""
    if check_out <= check_in:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")
    
    rooms = RoomService.get_available_rooms(
        db, 
        check_in, 
        check_out, 
        room_type, 
        min_capacity
    )
    return rooms

@router.post("/check-availability", response_model=AvailabilityResponse)
def check_availability(availability: AvailabilityCheck, db: Session = Depends(get_db)):
    """Check if a specific room is available"""
    if availability.check_out_date <= availability.check_in_date:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")
    
    is_available = RoomService.check_room_availability(
        db,
        availability.room_id,
        availability.check_in_date,
        availability.check_out_date
    )
    
    room = None
    message = ""
    
    if is_available:
        room = RoomService.get_room_by_id(db, availability.room_id)
        message = "Room is available for selected dates"
    else:
        message = "Room is not available for selected dates"
    
    return AvailabilityResponse(
        available=is_available,
        room=room,
        message=message
    )

@router.get("/status/{status}", response_model=List[Room])
def get_rooms_by_status(status: str, db: Session = Depends(get_db)):
    """Get rooms by status (Available, Occupied, Maintenance)"""
    # Validate status value
    valid_statuses = ["Available", "Occupied", "Maintenance"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid room status. Must be one of: {', '.join(valid_statuses)}")
    
    rooms = RoomService.get_rooms_by_status(db, status)
    return rooms

@router.patch("/{room_id}/status", response_model=Room)
def update_room_status(room_id: int, status: str, db: Session = Depends(get_db)):
    """Update room status (Admin only)"""
    # Validate status value
    valid_statuses = ["Available", "Occupied", "Maintenance"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid room status. Must be one of: {', '.join(valid_statuses)}")
    
    room = RoomService.update_room_status(db, room_id, status)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room
