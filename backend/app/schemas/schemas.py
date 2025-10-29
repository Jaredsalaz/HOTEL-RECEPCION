from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# Room Schemas
class RoomBase(BaseModel):
    room_number: str = Field(..., max_length=10)
    type: str = Field(..., description="Single, Double, Suite, Deluxe")
    price_per_night: Decimal = Field(..., gt=0)
    capacity: int = Field(..., gt=0, le=10)
    description: Optional[str] = None
    amenities: Optional[List[str]] = []
    status: Optional[str] = "Available"
    floor: Optional[int] = None
    image_url: Optional[str] = None

class RoomCreate(RoomBase):
    gallery_images: Optional[List[str]] = []  # URLs for gallery images

class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    type: Optional[str] = None
    price_per_night: Optional[Decimal] = None
    capacity: Optional[int] = None
    description: Optional[str] = None
    amenities: Optional[List[str]] = None
    status: Optional[str] = None
    floor: Optional[int] = None
    image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None  # URLs for gallery images

class RoomImageBase(BaseModel):
    image_url: str
    is_primary: bool = False

class RoomImageCreate(RoomImageBase):
    room_id: int

class RoomImage(RoomImageBase):
    id: int
    room_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Room(RoomBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    images: List[RoomImage] = []
    
    class Config:
        from_attributes = True

# Guest Schemas
class GuestBase(BaseModel):
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    email: EmailStr
    phone: str = Field(..., max_length=20)
    id_document: str = Field(..., max_length=50)
    nationality: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None

class GuestCreate(GuestBase):
    password: str = Field(..., min_length=6)

class GuestLogin(BaseModel):
    email: EmailStr
    password: str

class GuestResponse(GuestBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class GuestUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    nationality: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None

class Guest(GuestBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Reservation Schemas
class ReservationBase(BaseModel):
    room_id: int
    check_in_date: datetime
    check_out_date: datetime
    guests_count: int = Field(default=1, gt=0)
    special_requests: Optional[str] = None
    
    @validator('check_out_date')
    def check_out_after_check_in(cls, v, values):
        if 'check_in_date' in values and v <= values['check_in_date']:
            raise ValueError('check_out_date must be after check_in_date')
        return v

class ReservationCreate(ReservationBase):
    guest: GuestCreate

class ReservationCreateAuthenticated(BaseModel):
    guest_id: int
    room_id: int
    check_in_date: datetime
    check_out_date: datetime
    guests_count: int = Field(default=1, gt=0)
    special_requests: Optional[str] = None
    status: Optional[str] = "Pending"
    total_price: Decimal
    payment_method: Optional[str] = "Cash"
    payment_status: Optional[str] = "Pending"

class ReservationUpdate(BaseModel):
    check_in_date: Optional[datetime] = None
    check_out_date: Optional[datetime] = None
    guests_count: Optional[int] = None
    special_requests: Optional[str] = None
    status: Optional[str] = None

class CheckInRequest(ReservationCreate):
    pass

class CheckOutRequest(BaseModel):
    reservation_id: int

class Reservation(ReservationBase):
    id: int
    guest_id: int
    status: str
    total_price: Decimal
    actual_check_in: Optional[datetime] = None
    actual_check_out: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    guest: Guest
    room: Room
    
    class Config:
        from_attributes = True

# Administrator Schemas
class AdminBase(BaseModel):
    username: str = Field(..., max_length=50)
    full_name: str = Field(..., max_length=200)
    email: EmailStr
    role: str = "admin"

class AdminCreate(AdminBase):
    password: str = Field(..., min_length=6)

class AdminLogin(BaseModel):
    username: str
    password: str

class Admin(AdminBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[dict] = None

class TokenData(BaseModel):
    username: Optional[str] = None

# Availability Check
class AvailabilityCheck(BaseModel):
    room_id: int
    check_in_date: datetime
    check_out_date: datetime

class AvailabilityResponse(BaseModel):
    available: bool
    room: Optional[Room] = None
    message: str

# Dashboard Statistics
class DashboardStats(BaseModel):
    total_rooms: int
    occupied_rooms: int
    available_rooms: int
    maintenance_rooms: int
    occupancy_rate: float
    active_reservations: int
    today_checkins: int
    today_checkouts: int
    total_guests: int
    revenue_today: Decimal
    revenue_month: Decimal

# Response Models
class MessageResponse(BaseModel):
    message: str
    success: bool = True
