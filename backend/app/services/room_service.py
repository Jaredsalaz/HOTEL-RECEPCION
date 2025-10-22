from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta
from typing import List, Optional
from decimal import Decimal

from app.models import Room, RoomImage, RoomStatus, RoomType
from app.schemas import RoomCreate, RoomUpdate

class RoomService:
    
    @staticmethod
    def get_all_rooms(db: Session, skip: int = 0, limit: int = 100) -> List[Room]:
        """Get all rooms with pagination"""
        return db.query(Room).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_room_by_id(db: Session, room_id: int) -> Optional[Room]:
        """Get room by ID"""
        return db.query(Room).filter(Room.id == room_id).first()
    
    @staticmethod
    def get_room_by_number(db: Session, room_number: str) -> Optional[Room]:
        """Get room by room number"""
        return db.query(Room).filter(Room.room_number == room_number).first()
    
    @staticmethod
    def create_room(db: Session, room: RoomCreate) -> Room:
        """Create new room"""
        db_room = Room(
            room_number=room.room_number,
            type=room.type,
            price_per_night=room.price_per_night,
            capacity=room.capacity,
            description=room.description,
            amenities=room.amenities,
            status=room.status,
            floor=room.floor,
            image_url=room.image_url
        )
        db.add(db_room)
        db.commit()
        db.refresh(db_room)
        return db_room
    
    @staticmethod
    def update_room(db: Session, room_id: int, room_update: RoomUpdate) -> Optional[Room]:
        """Update room"""
        db_room = RoomService.get_room_by_id(db, room_id)
        if not db_room:
            return None
        
        update_data = room_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_room, field, value)
        
        db.commit()
        db.refresh(db_room)
        return db_room
    
    @staticmethod
    def delete_room(db: Session, room_id: int) -> bool:
        """Delete room"""
        db_room = RoomService.get_room_by_id(db, room_id)
        if not db_room:
            return False
        
        db.delete(db_room)
        db.commit()
        return True
    
    @staticmethod
    def get_available_rooms(
        db: Session, 
        check_in: datetime, 
        check_out: datetime,
        room_type: Optional[str] = None,
        min_capacity: Optional[int] = None
    ) -> List[Room]:
        """Get available rooms for specific dates"""
        from app.models import Reservation, ReservationStatus
        
        # Base query for available rooms
        query = db.query(Room).filter(Room.status == "Available")
        
        # Filter by room type
        if room_type:
            query = query.filter(Room.type == room_type)
        
        # Filter by exact capacity (not greater than or equal)
        if min_capacity:
            query = query.filter(Room.capacity == min_capacity)
        
        # Get all potentially available rooms
        rooms = query.all()
        
        # Filter out rooms with conflicting reservations
        available_rooms = []
        for room in rooms:
            conflicting_reservation = db.query(Reservation).filter(
                and_(
                    Reservation.room_id == room.id,
                    Reservation.status.in_([ReservationStatus.PENDING, ReservationStatus.ACTIVE]),
                    or_(
                        and_(
                            Reservation.check_in_date <= check_in,
                            Reservation.check_out_date > check_in
                        ),
                        and_(
                            Reservation.check_in_date < check_out,
                            Reservation.check_out_date >= check_out
                        ),
                        and_(
                            Reservation.check_in_date >= check_in,
                            Reservation.check_out_date <= check_out
                        )
                    )
                )
            ).first()
            
            if not conflicting_reservation:
                available_rooms.append(room)
        
        return available_rooms
    
    @staticmethod
    def check_room_availability(
        db: Session, 
        room_id: int, 
        check_in: datetime, 
        check_out: datetime
    ) -> bool:
        """Check if a specific room is available"""
        from app.models import Reservation, ReservationStatus
        
        room = RoomService.get_room_by_id(db, room_id)
        if not room or room.status != RoomStatus.AVAILABLE:
            return False
        
        conflicting_reservation = db.query(Reservation).filter(
            and_(
                Reservation.room_id == room_id,
                Reservation.status.in_([ReservationStatus.PENDING, ReservationStatus.ACTIVE]),
                or_(
                    and_(
                        Reservation.check_in_date <= check_in,
                        Reservation.check_out_date > check_in
                    ),
                    and_(
                        Reservation.check_in_date < check_out,
                        Reservation.check_out_date >= check_out
                    ),
                    and_(
                        Reservation.check_in_date >= check_in,
                        Reservation.check_out_date <= check_out
                    )
                )
            )
        ).first()
        
        return conflicting_reservation is None
    
    @staticmethod
    def get_rooms_by_status(db: Session, status: str) -> List[Room]:
        """Get rooms by status"""
        return db.query(Room).filter(Room.status == status).all()
    
    @staticmethod
    def update_room_status(db: Session, room_id: int, status: str) -> Optional[Room]:
        """Update room status"""
        db_room = RoomService.get_room_by_id(db, room_id)
        if not db_room:
            return None
        
        db_room.status = status
        db.commit()
        db.refresh(db_room)
        return db_room
    
    @staticmethod
    def add_room_image(db: Session, room_id: int, image_url: str, is_primary: bool = False) -> RoomImage:
        """Add image to room"""
        db_image = RoomImage(
            room_id=room_id,
            image_url=image_url,
            is_primary=is_primary
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        return db_image
    
    @staticmethod
    def get_room_images(db: Session, room_id: int) -> List[RoomImage]:
        """Get all images for a room"""
        return db.query(RoomImage).filter(RoomImage.room_id == room_id).all()
    
    @staticmethod
    def delete_room_image(db: Session, image_id: int) -> bool:
        """Delete room image"""
        db_image = db.query(RoomImage).filter(RoomImage.id == image_id).first()
        if not db_image:
            return False
        
        db.delete(db_image)
        db.commit()
        return True
