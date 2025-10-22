from .room_controller import router as room_router
from .guest_controller import router as guest_router
from .reservation_controller import router as reservation_router
from .checkin_controller import router as checkin_router
from .report_controller import router as report_router
from .auth_controller import router as auth_router
from .guest_auth_controller import router as guest_auth_router

__all__ = [
    "room_router",
    "guest_router",
    "reservation_router",
    "checkin_router",
    "report_router",
    "auth_router",
    "guest_auth_router"
]
