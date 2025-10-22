# 📝 Lista de Componentes y Páginas a Crear - Frontend React

Este documento lista todos los archivos que necesitas crear para completar el frontend.

---

## ✅ YA CREADOS

- ✅ `src/main.jsx` - Punto de entrada
- ✅ `src/App.jsx` - Componente principal con rutas
- ✅ `src/index.css` - Estilos globales
- ✅ `src/services/*.js` - Todos los servicios de API
- ✅ `package.json` - Dependencias
- ✅ `vite.config.js` - Configuración Vite
- ✅ `tailwind.config.js` - Configuración Tailwind

---

## 📋 POR CREAR

### 🎯 Layouts (2 archivos)

#### 1. `src/layouts/ClientLayout.jsx`
Layout para las vistas públicas del cliente.

```jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

#### 2. `src/layouts/AdminLayout.jsx`
Layout para el panel administrativo.

```jsx
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/admin/AdminNavbar';
import AdminSidebar from '../components/admin/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

---

### 🧩 Componentes Comunes (10 archivos)

#### 1. `src/components/Navbar.jsx`
Barra de navegación principal para clientes.

**Features:**
- Logo del hotel
- Links: Home, Rooms, Contact
- Botón "Admin Login"
- Responsive (hamburger menu en móvil)

#### 2. `src/components/Footer.jsx`
Footer del sitio.

**Features:**
- Información de contacto
- Links sociales
- Copyright

#### 3. `src/components/ProtectedRoute.jsx`
Componente para proteger rutas admin.

```jsx
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
```

#### 4. `src/components/common/Button.jsx`
Botón reutilizable con variantes.

**Props:**
- variant: 'primary' | 'secondary' | 'danger'
- size: 'sm' | 'md' | 'lg'
- loading: boolean
- onClick, children, className

#### 5. `src/components/common/Card.jsx`
Card reutilizable.

#### 6. `src/components/common/Loading.jsx`
Spinner de carga.

#### 7. `src/components/common/Input.jsx`
Input reutilizable con label y error.

#### 8. `src/components/common/Modal.jsx`
Modal genérico.

#### 9. `src/components/common/DateRangePicker.jsx`
Selector de rango de fechas.

#### 10. `src/components/RoomCard.jsx`
Card para mostrar habitación en el catálogo.

**Features:**
- Imagen
- Tipo y precio
- Capacidad
- Amenities
- Botón "View Details"

---

### 🏢 Componentes Admin (4 archivos)

#### 1. `src/components/admin/AdminNavbar.jsx`
Navbar del panel admin.

**Features:**
- Nombre del admin
- Botón logout
- Notificaciones

#### 2. `src/components/admin/AdminSidebar.jsx`
Sidebar con navegación admin.

**Features:**
- Links: Dashboard, Rooms, Reservations, Reports
- Active state
- Iconos con React Icons

#### 3. `src/components/admin/StatCard.jsx`
Card de estadística para dashboard.

**Props:**
- title: string
- value: number | string
- icon: ReactNode
- color: string

#### 4. `src/components/admin/ReservationTable.jsx`
Tabla de reservas con acciones.

---

### 🎨 Páginas Cliente (5 archivos)

#### 1. `src/pages/client/Home.jsx`
Página de inicio.

**Secciones:**
- Hero con búsqueda de fechas
- Habitaciones destacadas
- Features del hotel
- Call to action

**Ejemplo básico:**
```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DateRangePicker from '../../components/common/DateRangePicker';

export default function Home() {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 opacity-90" />
        <div className="relative container-custom h-full flex flex-col justify-center items-center text-white">
          <h1 className="text-6xl font-bold mb-4">Welcome to Our Hotel</h1>
          <p className="text-xl mb-8">Find your perfect room</p>
          
          {/* Search Box */}
          <div className="bg-white p-6 rounded-xl shadow-2xl">
            <DateRangePicker 
              checkIn={checkIn}
              checkOut={checkOut}
              onCheckInChange={setCheckIn}
              onCheckOutChange={setCheckOut}
            />
            <button onClick={handleSearch} className="btn btn-primary w-full mt-4">
              Search Rooms
            </button>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      {/* Features */}
      {/* CTA */}
    </div>
  );
}
```

#### 2. `src/pages/client/RoomCatalog.jsx`
Catálogo de habitaciones.

**Features:**
- Grid de RoomCard
- Filtros: tipo, precio, capacidad
- Búsqueda por fechas
- Loading state
- Empty state

**API Call:**
```jsx
useEffect(() => {
  const fetchRooms = async () => {
    try {
      setLoading(true);
      let rooms;
      if (checkIn && checkOut) {
        rooms = await roomService.searchAvailableRooms(checkIn, checkOut, roomType, capacity);
      } else {
        rooms = await roomService.getAllRooms();
      }
      setRooms(rooms);
    } catch (error) {
      toast.error('Error loading rooms');
    } finally {
      setLoading(false);
    }
  };
  fetchRooms();
}, [checkIn, checkOut, roomType, capacity]);
```

#### 3. `src/pages/client/RoomDetail.jsx`
Detalle de habitación.

**Features:**
- Galería de imágenes (carousel)
- Información completa
- Amenities con iconos
- Selector de fechas
- Botón "Book Now"
- Verificación de disponibilidad

**API Calls:**
```jsx
const { id } = useParams();

useEffect(() => {
  const fetchRoom = async () => {
    const room = await roomService.getRoomById(id);
    setRoom(room);
  };
  fetchRoom();
}, [id]);

const handleBooking = () => {
  navigate(`/checkin/${id}?checkIn=${checkIn}&checkOut=${checkOut}`);
};
```

#### 4. `src/pages/client/CheckInForm.jsx`
Formulario de check-in.

**Features:**
- Resumen de habitación y fechas
- Form con validación:
  - Nombre
  - Apellido
  - Email
  - Teléfono
  - Documento ID
  - Nacionalidad
  - Número de huéspedes
  - Solicitudes especiales
- Cálculo de precio total
- Botón "Confirm Booking"

**API Call:**
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    const reservation = await checkinService.checkIn({
      room_id: roomId,
      check_in_date: checkIn,
      check_out_date: checkOut,
      guests_count: guestsCount,
      special_requests: specialRequests,
      guest: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        id_document: idDocument,
        nationality,
      }
    });
    toast.success('Booking confirmed!');
    navigate(`/confirmation/${reservation.id}`);
  } catch (error) {
    toast.error(error.response?.data?.detail || 'Booking failed');
  } finally {
    setLoading(false);
  }
};
```

#### 5. `src/pages/client/Confirmation.jsx`
Confirmación de reserva.

**Features:**
- Mensaje de éxito
- Número de confirmación
- Detalles de la reserva
- Información del huésped
- Botón "Print Confirmation"
- Botón "Back to Home"

---

### 👨‍💼 Páginas Admin (5 archivos)

#### 1. `src/pages/admin/AdminLogin.jsx`
Login del administrador.

**Features:**
- Form: username, password
- Validación
- Manejo de errores
- Redirect al dashboard tras login

**API Call:**
```jsx
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    await authService.login(username, password);
    toast.success('Login successful!');
    navigate('/admin');
  } catch (error) {
    toast.error('Invalid credentials');
  } finally {
    setLoading(false);
  }
};
```

#### 2. `src/pages/admin/AdminDashboard.jsx`
Dashboard con estadísticas.

**Features:**
- Grid de StatCards:
  - Total Rooms
  - Occupied Rooms
  - Occupancy Rate
  - Active Reservations
  - Today's Check-ins
  - Today's Check-outs
  - Revenue Today
  - Revenue Month
- Lista de check-ins de hoy
- Lista de check-outs de hoy
- Gráfico de ocupación (opcional)

**API Call:**
```jsx
useEffect(() => {
  const fetchStats = async () => {
    const stats = await reportService.getDashboardStats();
    setStats(stats);
  };
  fetchStats();
}, []);
```

#### 3. `src/pages/admin/RoomManagement.jsx`
CRUD de habitaciones.

**Features:**
- Tabla de habitaciones
- Botón "Add Room"
- Modal para crear/editar
- Acciones: Edit, Delete
- Status badges
- Filtros por status y tipo

**API Calls:**
```jsx
// Get rooms
const fetchRooms = async () => {
  const rooms = await roomService.getAllRooms();
  setRooms(rooms);
};

// Create room
const handleCreate = async (roomData) => {
  await roomService.createRoom(roomData);
  toast.success('Room created!');
  fetchRooms();
};

// Update room
const handleUpdate = async (id, roomData) => {
  await roomService.updateRoom(id, roomData);
  toast.success('Room updated!');
  fetchRooms();
};

// Delete room
const handleDelete = async (id) => {
  if (confirm('Delete room?')) {
    await roomService.deleteRoom(id);
    toast.success('Room deleted!');
    fetchRooms();
  }
};
```

#### 4. `src/pages/admin/ReservationManagement.jsx`
Gestión de reservas.

**Features:**
- Tabs: All, Active, Pending, Completed
- Tabla con ReservationTable component
- Búsqueda por nombre/email
- Filtros por fecha y status
- Acciones:
  - View details
  - Check-out (si activa)
  - Cancel (si pending)

**API Calls:**
```jsx
// Get reservations
const fetchReservations = async () => {
  const reservations = await reservationService.getAllReservations();
  setReservations(reservations);
};

// Check-out
const handleCheckOut = async (id) => {
  await checkinService.checkOut(id);
  toast.success('Check-out completed!');
  fetchReservations();
};

// Cancel
const handleCancel = async (id) => {
  await reservationService.cancelReservation(id);
  toast.success('Reservation cancelled!');
  fetchReservations();
};
```

#### 5. `src/pages/admin/Reports.jsx`
Generación de reportes.

**Features:**
- Selector de rango de fechas
- Botones:
  - Download PDF
  - Download Excel
- Vista previa de estadísticas
- Tabla de habitaciones por status
- Gráfico de ocupación

**API Calls:**
```jsx
const handleDownloadPDF = async () => {
  try {
    await reportService.downloadOccupancyPDF(startDate, endDate);
    toast.success('PDF downloaded!');
  } catch (error) {
    toast.error('Download failed');
  }
};

const handleDownloadExcel = async () => {
  try {
    await reportService.downloadOccupancyExcel(startDate, endDate);
    toast.success('Excel downloaded!');
  } catch (error) {
    toast.error('Download failed');
  }
};
```

---

### 🛠️ Utilidades (2 archivos)

#### 1. `src/utils/formatters.js`
Funciones de formato.

```jsx
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateNights = (checkIn, checkOut) => {
  const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
```

#### 2. `src/utils/validators.js`
Funciones de validación.

```jsx
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[\d\s\-\+\(\)]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateDates = (checkIn, checkOut) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  if (checkInDate < today) {
    return 'Check-in date cannot be in the past';
  }
  
  if (checkOutDate <= checkInDate) {
    return 'Check-out date must be after check-in date';
  }
  
  return null;
};
```

---

## 📦 Archivos Adicionales Opcionales

### `src/hooks/useRooms.js`
Custom hook para gestionar habitaciones.

### `src/hooks/useReservations.js`
Custom hook para gestionar reservas.

### `src/context/AuthContext.jsx`
Context para autenticación global.

### `src/components/common/SearchBar.jsx`
Barra de búsqueda reutilizable.

### `src/components/common/FilterPanel.jsx`
Panel de filtros.

### `src/components/common/Pagination.jsx`
Componente de paginación.

---

## 🎨 Iconos Recomendados (React Icons)

```jsx
import {
  FaBed,           // Habitaciones
  FaUsers,         // Huéspedes
  FaCalendarCheck, // Check-in
  FaCalendarTimes, // Check-out
  FaDollarSign,    // Precio
  FaWifi,          // WiFi
  FaTv,            // TV
  FaSnowflake,     // AC
  FaCoffee,        // Minibar
  FaParking,       // Parking
  FaSwimmingPool,  // Pool
  FaDumbbell,      // Gym
  FaUtensils,      // Restaurant
  FaBars,          // Menu
  FaTimes,         // Close
  FaUser,          // Usuario
  FaSignOutAlt,    // Logout
  FaChartBar,      // Dashboard
  FaFileAlt,       // Reportes
  FaEdit,          // Editar
  FaTrash,         // Eliminar
  FaPlus,          // Agregar
  FaDownload,      // Descargar
  FaSearch,        // Buscar
  FaFilter,        // Filtrar
} from 'react-icons/fa';
```

---

## 💡 Tips de Implementación

1. **Comienza con los layouts** - Son la base de todo
2. **Crea componentes comunes primero** - Button, Card, Input, etc.
3. **Implementa las páginas cliente** - Son más simples que las admin
4. **Usa React DevTools** - Para debugging
5. **Prueba cada componente** - Antes de pasar al siguiente
6. **Mantén consistencia** - Usa los mismos estilos y patterns
7. **Maneja errores** - Siempre usa try-catch y toast.error()
8. **Loading states** - Muestra spinners mientras carga
9. **Responsive** - Usa clases de Tailwind: sm:, md:, lg:
10. **Accesibilidad** - Usa labels, alt text, aria-labels

---

## ✅ Checklist de Implementación

### Layouts
- [ ] ClientLayout
- [ ] AdminLayout

### Componentes Comunes
- [ ] Navbar
- [ ] Footer
- [ ] ProtectedRoute
- [ ] Button
- [ ] Card
- [ ] Loading
- [ ] Input
- [ ] Modal
- [ ] DateRangePicker
- [ ] RoomCard

### Componentes Admin
- [ ] AdminNavbar
- [ ] AdminSidebar
- [ ] StatCard
- [ ] ReservationTable

### Páginas Cliente
- [ ] Home
- [ ] RoomCatalog
- [ ] RoomDetail
- [ ] CheckInForm
- [ ] Confirmation

### Páginas Admin
- [ ] AdminLogin
- [ ] AdminDashboard
- [ ] RoomManagement
- [ ] ReservationManagement
- [ ] Reports

### Utilidades
- [ ] formatters.js
- [ ] validators.js

---

## 🚀 Orden Sugerido de Implementación

1. ✅ Layouts (ClientLayout, AdminLayout)
2. ✅ Componentes comunes básicos (Button, Card, Loading, Input)
3. ✅ Navbar y Footer
4. ✅ ProtectedRoute
5. ✅ Páginas cliente básicas (Home con UI estática)
6. ✅ RoomCard
7. ✅ RoomCatalog con integración API
8. ✅ RoomDetail
9. ✅ DateRangePicker
10. ✅ CheckInForm
11. ✅ Confirmation
12. ✅ AdminLogin
13. ✅ AdminNavbar y AdminSidebar
14. ✅ StatCard
15. ✅ AdminDashboard
16. ✅ RoomManagement
17. ✅ ReservationTable
18. ✅ ReservationManagement
19. ✅ Reports
20. ✅ Refinamiento y testing

---

**Total de archivos a crear: ~31 archivos**

¡Buena suerte con la implementación! 🎉
