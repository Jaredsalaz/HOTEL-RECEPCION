from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal

from app.models import Reservation, ReservationStatus, Room, RoomStatus
from app.schemas import ReservationCreate, ReservationCreateAuthenticated, ReservationUpdate, CheckInRequest
from app.services.guest_service import GuestService
from app.services.room_service import RoomService

class ReservationService:
    
    @staticmethod
    def get_all_reservations(db: Session, skip: int = 0, limit: int = 100) -> List[Reservation]:
        """Get all reservations with pagination"""
        return db.query(Reservation).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_reservation_by_id(db: Session, reservation_id: int) -> Optional[Reservation]:
        """Get reservation by ID"""
        return db.query(Reservation).filter(Reservation.id == reservation_id).first()
    
    @staticmethod
    def create_reservation(db: Session, reservation: ReservationCreate) -> Reservation:
        """Create new reservation"""
        # Get or create guest
        guest = GuestService.get_or_create_guest(db, reservation.guest)
        
        # Calculate total price
        room = RoomService.get_room_by_id(db, reservation.room_id)
        if not room:
            raise ValueError("Room not found")
        
        days = (reservation.check_out_date - reservation.check_in_date).days
        total_price = room.price_per_night * days
        
        # Create reservation
        db_reservation = Reservation(
            room_id=reservation.room_id,
            guest_id=guest.id,
            check_in_date=reservation.check_in_date,
            check_out_date=reservation.check_out_date,
            guests_count=reservation.guests_count,
            special_requests=reservation.special_requests,
            total_price=total_price,
            status=ReservationStatus.PENDING
        )
        
        db.add(db_reservation)
        db.commit()
        db.refresh(db_reservation)
        return db_reservation
    
    @staticmethod
    def create_reservation_authenticated(db: Session, reservation: ReservationCreateAuthenticated) -> Reservation:
        """Create new reservation for authenticated user"""
        # Verify room exists
        room = RoomService.get_room_by_id(db, reservation.room_id)
        if not room:
            raise ValueError("Room not found")
        
        # Create reservation
        db_reservation = Reservation(
            room_id=reservation.room_id,
            guest_id=reservation.guest_id,
            check_in_date=reservation.check_in_date,
            check_out_date=reservation.check_out_date,
            guests_count=reservation.guests_count,
            special_requests=reservation.special_requests,
            total_price=reservation.total_price,
            status=reservation.status or ReservationStatus.PENDING,
            payment_method=reservation.payment_method,
            payment_status=reservation.payment_status
        )
        
        db.add(db_reservation)
        db.commit()
        db.refresh(db_reservation)
        return db_reservation
    
    @staticmethod
    def check_in(db: Session, check_in_request: CheckInRequest) -> Reservation:
        """Process check-in"""
        # Check room availability
        is_available = RoomService.check_room_availability(
            db, 
            check_in_request.room_id,
            check_in_request.check_in_date,
            check_in_request.check_out_date
        )
        
        if not is_available:
            raise ValueError("Room is not available for selected dates")
        
        # Create reservation
        reservation = ReservationService.create_reservation(db, check_in_request)
        
        # Update reservation status to ACTIVE and set actual check-in time
        reservation.status = ReservationStatus.ACTIVE
        reservation.actual_check_in = datetime.now()
        
        # Update room status to OCCUPIED
        RoomService.update_room_status(db, check_in_request.room_id, RoomStatus.OCCUPIED)
        
        db.commit()
        db.refresh(reservation)
        return reservation
    
    @staticmethod
    def mark_checkin(db: Session, reservation_id: int) -> Reservation:
        """Mark existing reservation as checked-in (Active)"""
        from datetime import date as date_type
        
        reservation = ReservationService.get_reservation_by_id(db, reservation_id)
        if not reservation:
            raise ValueError("Reservation not found")
        
        if reservation.status == ReservationStatus.ACTIVE:
            raise ValueError("Reservation is already checked-in")
        
        if reservation.status == ReservationStatus.COMPLETED:
            raise ValueError("Cannot check-in a completed reservation")
        
        if reservation.status == ReservationStatus.CANCELLED:
            raise ValueError("Cannot check-in a cancelled reservation")
        
        # Validate check-in date: must be today or earlier
        today = date_type.today()
        check_in_date = reservation.check_in_date
        if isinstance(check_in_date, datetime):
            check_in_date = check_in_date.date()
        
        if check_in_date > today:
            raise ValueError(f"No se puede hacer check-in antes de la fecha programada. Check-in programado para: {check_in_date.strftime('%d/%m/%Y')}")
        
        # Update reservation status to ACTIVE and set actual check-in time
        reservation.status = ReservationStatus.ACTIVE
        reservation.actual_check_in = datetime.now()
        
        # Update room status to OCCUPIED
        RoomService.update_room_status(db, reservation.room_id, RoomStatus.OCCUPIED)
        
        db.commit()
        db.refresh(reservation)
        return reservation
    
    @staticmethod
    def check_out(db: Session, reservation_id: int) -> Reservation:
        """Process check-out"""
        reservation = ReservationService.get_reservation_by_id(db, reservation_id)
        if not reservation:
            raise ValueError("Reservation not found")
        
        if reservation.status != ReservationStatus.ACTIVE:
            raise ValueError("Reservation is not active")
        
        # Update reservation
        reservation.status = ReservationStatus.COMPLETED
        reservation.actual_check_out = datetime.now()
        
        # Update room status to AVAILABLE
        RoomService.update_room_status(db, reservation.room_id, RoomStatus.AVAILABLE)
        
        db.commit()
        db.refresh(reservation)
        return reservation
    
    @staticmethod
    def cancel_reservation(db: Session, reservation_id: int) -> Reservation:
        """Cancel reservation"""
        reservation = ReservationService.get_reservation_by_id(db, reservation_id)
        if not reservation:
            raise ValueError("Reservation not found")
        
        if reservation.status == ReservationStatus.COMPLETED:
            raise ValueError("Cannot cancel completed reservation")
        
        reservation.status = ReservationStatus.CANCELLED
        
        # If reservation was active, free the room
        if reservation.status == ReservationStatus.ACTIVE:
            RoomService.update_room_status(db, reservation.room_id, RoomStatus.AVAILABLE)
        
        db.commit()
        db.refresh(reservation)
        return reservation
    
    @staticmethod
    def update_reservation(db: Session, reservation_id: int, reservation_update: ReservationUpdate) -> Optional[Reservation]:
        """Update reservation"""
        db_reservation = ReservationService.get_reservation_by_id(db, reservation_id)
        if not db_reservation:
            return None
        
        update_data = reservation_update.dict(exclude_unset=True)
        
        # Recalculate price if dates changed
        if 'check_in_date' in update_data or 'check_out_date' in update_data:
            check_in = update_data.get('check_in_date', db_reservation.check_in_date)
            check_out = update_data.get('check_out_date', db_reservation.check_out_date)
            
            room = RoomService.get_room_by_id(db, db_reservation.room_id)
            days = (check_out - check_in).days
            update_data['total_price'] = room.price_per_night * days
        
        for field, value in update_data.items():
            setattr(db_reservation, field, value)
        
        db.commit()
        db.refresh(db_reservation)
        return db_reservation
    
    @staticmethod
    def get_reservations_by_guest(db: Session, guest_id: int) -> List[Reservation]:
        """Get all reservations for a guest"""
        return db.query(Reservation).filter(Reservation.guest_id == guest_id).all()
    
    @staticmethod
    def get_reservations_by_room(db: Session, room_id: int) -> List[Reservation]:
        """Get all reservations for a room"""
        return db.query(Reservation).filter(Reservation.room_id == room_id).all()
    
    @staticmethod
    def get_active_reservations(db: Session) -> List[Reservation]:
        """Get all active reservations"""
        return db.query(Reservation).filter(Reservation.status == ReservationStatus.ACTIVE).all()
    
    @staticmethod
    def get_pending_reservations(db: Session) -> List[Reservation]:
        """Get all pending reservations"""
        return db.query(Reservation).filter(Reservation.status == ReservationStatus.PENDING).all()
    
    @staticmethod
    def get_todays_checkins(db: Session) -> List[Reservation]:
        """Get today's check-ins"""
        today = datetime.now().date()
        return db.query(Reservation).filter(
            and_(
                func.date(Reservation.check_in_date) == today,
                Reservation.status.in_([ReservationStatus.PENDING, ReservationStatus.ACTIVE])
            )
        ).all()
    
    @staticmethod
    def get_todays_checkouts(db: Session) -> List[Reservation]:
        """Get today's check-outs"""
        today = datetime.now().date()
        return db.query(Reservation).filter(
            and_(
                func.date(Reservation.check_out_date) == today,
                Reservation.status == ReservationStatus.ACTIVE
            )
        ).all()
    
    @staticmethod
    def get_reservations_by_date_range(
        db: Session, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Reservation]:
        """Get reservations within date range"""
        return db.query(Reservation).filter(
            and_(
                Reservation.check_in_date >= start_date,
                Reservation.check_out_date <= end_date
            )
        ).all()
    
    @staticmethod
    def auto_cancel_expired_reservations(db: Session) -> int:
        """
        Auto-cancel reservations that are Pending but check-in date has passed
        Returns number of cancelled reservations (No-Show)
        """
        now = datetime.now()
        
        # Find Pending reservations where check-in date has passed (more than 24 hours)
        expired_reservations = db.query(Reservation).filter(
            and_(
                Reservation.status == ReservationStatus.PENDING,
                Reservation.check_in_date < now - timedelta(hours=24)
            )
        ).all()
        
        count = 0
        for reservation in expired_reservations:
            reservation.status = ReservationStatus.CANCELLED
            count += 1
        
        if count > 0:
            db.commit()
        
        return count
    
    @staticmethod
    def auto_complete_overdue_checkouts(db: Session) -> int:
        """
        Auto-complete reservations that are Active but check-out date has passed
        Returns number of completed reservations
        """
        now = datetime.now()
        
        # Find Active reservations where check-out date has passed
        overdue_reservations = db.query(Reservation).filter(
            and_(
                Reservation.status == ReservationStatus.ACTIVE,
                Reservation.check_out_date < now
            )
        ).all()
        
        count = 0
        for reservation in overdue_reservations:
            reservation.status = ReservationStatus.COMPLETED
            reservation.actual_check_out = now
            
            # Free up the room
            if reservation.room:
                RoomService.update_room_status(db, reservation.room_id, RoomStatus.AVAILABLE)
            
            count += 1
        
        if count > 0:
            db.commit()
        
        return count
    
    @staticmethod
    def process_expired_reservations(db: Session) -> dict:
        """
        Process all expired reservations (both no-shows and overdue checkouts)
        Returns summary of actions taken
        """
        cancelled = ReservationService.auto_cancel_expired_reservations(db)
        completed = ReservationService.auto_complete_overdue_checkouts(db)
        
        return {
            'cancelled_no_shows': cancelled,
            'completed_overdue': completed,
            'total_processed': cancelled + completed
        }
