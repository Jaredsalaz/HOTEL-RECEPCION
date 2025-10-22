from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.models import Guest
from app.schemas import GuestCreate, GuestUpdate

class GuestService:
    
    @staticmethod
    def get_all_guests(db: Session, skip: int = 0, limit: int = 100) -> List[Guest]:
        """Get all guests with pagination"""
        return db.query(Guest).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_guest_by_id(db: Session, guest_id: int) -> Optional[Guest]:
        """Get guest by ID"""
        return db.query(Guest).filter(Guest.id == guest_id).first()
    
    @staticmethod
    def get_guest_by_email(db: Session, email: str) -> Optional[Guest]:
        """Get guest by email"""
        return db.query(Guest).filter(Guest.email == email).first()
    
    @staticmethod
    def get_guest_by_document(db: Session, id_document: str) -> Optional[Guest]:
        """Get guest by ID document"""
        return db.query(Guest).filter(Guest.id_document == id_document).first()
    
    @staticmethod
    def create_guest(db: Session, guest: GuestCreate) -> Guest:
        """Create new guest"""
        db_guest = Guest(
            first_name=guest.first_name,
            last_name=guest.last_name,
            email=guest.email,
            phone=guest.phone,
            id_document=guest.id_document,
            nationality=guest.nationality,
            date_of_birth=guest.date_of_birth,
            address=guest.address
        )
        db.add(db_guest)
        db.commit()
        db.refresh(db_guest)
        return db_guest
    
    @staticmethod
    def update_guest(db: Session, guest_id: int, guest_update: GuestUpdate) -> Optional[Guest]:
        """Update guest"""
        db_guest = GuestService.get_guest_by_id(db, guest_id)
        if not db_guest:
            return None
        
        update_data = guest_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_guest, field, value)
        
        db.commit()
        db.refresh(db_guest)
        return db_guest
    
    @staticmethod
    def delete_guest(db: Session, guest_id: int) -> bool:
        """Delete guest"""
        db_guest = GuestService.get_guest_by_id(db, guest_id)
        if not db_guest:
            return False
        
        db.delete(db_guest)
        db.commit()
        return True
    
    @staticmethod
    def search_guests(db: Session, query: str) -> List[Guest]:
        """Search guests by name, email or document"""
        search_pattern = f"%{query}%"
        return db.query(Guest).filter(
            Guest.first_name.ilike(search_pattern) |
            Guest.last_name.ilike(search_pattern) |
            Guest.email.ilike(search_pattern) |
            Guest.id_document.ilike(search_pattern)
        ).all()
    
    @staticmethod
    def get_or_create_guest(db: Session, guest_data: GuestCreate) -> Guest:
        """Get existing guest or create new one"""
        # Check by email first
        existing_guest = GuestService.get_guest_by_email(db, guest_data.email)
        if existing_guest:
            return existing_guest
        
        # Check by document
        existing_guest = GuestService.get_guest_by_document(db, guest_data.id_document)
        if existing_guest:
            return existing_guest
        
        # Create new guest
        return GuestService.create_guest(db, guest_data)
