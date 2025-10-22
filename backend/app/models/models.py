from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, Enum, DECIMAL
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.database import Base

class RoomType(str, enum.Enum):
    SINGLE = "Single"
    DOUBLE = "Double"
    SUITE = "Suite"
    DELUXE = "Deluxe"

class RoomStatus(str, enum.Enum):
    AVAILABLE = "Available"
    OCCUPIED = "Occupied"
    MAINTENANCE = "Maintenance"

class ReservationStatus(str, enum.Enum):
    PENDING = "Pending"
    ACTIVE = "Active"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String(10), unique=True, nullable=False, index=True)
    type = Column(String(20), nullable=False)  # Changed from Enum to String
    price_per_night = Column(DECIMAL(10, 2), nullable=False)
    capacity = Column(Integer, nullable=False)
    description = Column(Text)
    amenities = Column(JSONB)  # JSON: ["WiFi", "TV", "AC", "Minibar"]
    status = Column(String(20), default="Available")  # Changed from Enum to String
    floor = Column(Integer)
    image_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    images = relationship("RoomImage", back_populates="room", cascade="all, delete-orphan")
    reservations = relationship("Reservation", back_populates="room")

class RoomImage(Base):
    __tablename__ = "room_images"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    room = relationship("Room", back_populates="images")

class Guest(Base):
    __tablename__ = "guests"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=False)
    id_document = Column(String(50), unique=True, nullable=False)
    nationality = Column(String(100))
    date_of_birth = Column(DateTime)
    address = Column(Text)
    password_hash = Column(String(255))  # For guest authentication
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    reservations = relationship("Reservation", back_populates="guest")

class Reservation(Base):
    __tablename__ = "reservations"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=False)
    check_in_date = Column(DateTime, nullable=False)
    check_out_date = Column(DateTime, nullable=False)
    actual_check_in = Column(DateTime)  # Real check-in timestamp
    actual_check_out = Column(DateTime)  # Real check-out timestamp
    status = Column(String(50), default="Pending")
    total_price = Column(DECIMAL(10, 2), nullable=False)
    guests_count = Column(Integer, default=1)
    special_requests = Column(Text)
    payment_method = Column(String(50), default="Cash")
    payment_status = Column(String(50), default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    room = relationship("Room", back_populates="reservations")
    guest = relationship("Guest", back_populates="reservations")

class Administrator(Base):
    __tablename__ = "administrators"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    role = Column(String(50), default="admin")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
