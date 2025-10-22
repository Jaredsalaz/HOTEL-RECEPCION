# 🏨 Sistema de Gestión Hotelera - Check-in/Check-out

## 📋 Descripción del Proyecto
Sistema completo de gestión hotelera que permite a los clientes visualizar habitaciones disponibles, realizar check-in y check-out, mientras que los administradores pueden gestionar el inventario y generar reportes.

## 🏗️ Arquitectura

### Stack Tecnológico
- **Backend**: FastAPI (Python) - Alta velocidad y rendimiento
- **Frontend**: React.js - Diseño responsive tipo Airbnb
- **Base de Datos**: PostgreSQL
- **Deployment**: Render (Backend, Frontend, Database)

### Arquitectura MVC Limpia
```
Backend (FastAPI)
├── Models (Modelos de datos)
├── Controllers (Lógica de negocio)
├── Views (Respuestas API)
└── Services (Servicios auxiliares)
```

## 📦 Módulos del Sistema

### 1. **Módulo de Habitaciones** 🛏️
**Funcionalidades:**
- Ver catálogo de habitaciones con imágenes
- Filtrar por disponibilidad, tipo, precio
- Ver detalles completos de cada habitación
- Galería de imágenes

**Endpoints:**
- `GET /api/rooms` - Listar habitaciones
- `GET /api/rooms/{id}` - Detalle de habitación
- `GET /api/rooms/available` - Habitaciones disponibles
- `POST /api/rooms` - Crear habitación (Admin)
- `PUT /api/rooms/{id}` - Actualizar habitación (Admin)
- `DELETE /api/rooms/{id}` - Eliminar habitación (Admin)

### 2. **Módulo de Check-in** ✅
**Funcionalidades:**
- Verificar disponibilidad en tiempo real
- Formulario de registro de huésped
- Selección de fechas de entrada/salida
- Confirmación de reserva

**Endpoints:**
- `POST /api/checkin` - Realizar check-in
- `GET /api/checkin/verify` - Verificar disponibilidad
- `GET /api/checkin/{id}` - Detalle de check-in

### 3. **Módulo de Check-out** 🚪
**Funcionalidades:**
- Finalizar estadía
- Liberar habitación
- Resumen de la estadía

**Endpoints:**
- `POST /api/checkout/{reservation_id}` - Realizar check-out
- `GET /api/checkout/pending` - Check-outs pendientes

### 4. **Módulo de Reservas** 📅
**Funcionalidades:**
- Gestión completa de reservas
- Estados: Activa, Finalizada, Cancelada
- Historial de reservas

**Endpoints:**
- `GET /api/reservations` - Listar reservas
- `GET /api/reservations/{id}` - Detalle de reserva
- `PUT /api/reservations/{id}` - Actualizar reserva
- `DELETE /api/reservations/{id}` - Cancelar reserva

### 5. **Módulo de Clientes** 👤
**Funcionalidades:**
- Perfil de cliente
- Información personal
- Historial de estadías
- Sin necesidad de login/registro previo

**Endpoints:**
- `GET /api/guests/{id}` - Perfil de huésped
- `PUT /api/guests/{id}` - Actualizar perfil
- `GET /api/guests/{id}/history` - Historial de reservas

### 6. **Módulo de Administración** 👨‍💼
**Funcionalidades:**
- Dashboard con estadísticas
- Gestión de habitaciones
- Gestión de reservas
- Generación de reportes

**Endpoints:**
- `GET /api/admin/dashboard` - Estadísticas generales
- `GET /api/admin/occupancy` - Tasa de ocupación
- `GET /api/admin/rooms/status` - Estado de habitaciones

### 7. **Módulo de Reportes** 📊
**Funcionalidades:**
- Reporte de ocupación (PDF/Excel)
- Reporte de ingresos
- Reporte de habitaciones disponibles/ocupadas
- Filtros por fecha

**Endpoints:**
- `GET /api/reports/occupancy/pdf` - Reporte PDF ocupación
- `GET /api/reports/occupancy/excel` - Reporte Excel ocupación
- `GET /api/reports/revenue` - Reporte de ingresos
- `GET /api/reports/rooms-status` - Estado actual de habitaciones

### 8. **Módulo de Imágenes** 🖼️
**Funcionalidades:**
- Upload de imágenes de habitaciones
- Galería de imágenes
- Imagen principal y secundarias

**Endpoints:**
- `POST /api/images/upload` - Subir imagen
- `DELETE /api/images/{id}` - Eliminar imagen
- `GET /api/images/room/{room_id}` - Imágenes de habitación

## 🗄️ Estructura de Base de Datos

### Tablas Principales:

#### 1. **rooms** (Habitaciones)
```sql
- id (PK)
- room_number (UNIQUE)
- type (Single, Double, Suite, Deluxe)
- price_per_night
- capacity
- description
- amenities (JSONB)
- status (Available, Occupied, Maintenance)
- floor
- image_url
- created_at
- updated_at
```

#### 2. **room_images** (Imágenes)
```sql
- id (PK)
- room_id (FK)
- image_url
- is_primary
- created_at
```

#### 3. **guests** (Huéspedes)
```sql
- id (PK)
- first_name
- last_name
- email
- phone
- id_document
- nationality
- created_at
- updated_at
```

#### 4. **reservations** (Reservas)
```sql
- id (PK)
- room_id (FK)
- guest_id (FK)
- check_in_date
- check_out_date
- actual_check_in (Timestamp real)
- actual_check_out (Timestamp real)
- status (Pending, Active, Completed, Cancelled)
- total_price
- guests_count
- special_requests
- created_at
- updated_at
```

#### 5. **administrators** (Administradores)
```sql
- id (PK)
- username
- password_hash
- full_name
- email
- role
- created_at
```

## 🎨 Diseño Frontend (Tipo Airbnb)

### Vistas Cliente:
1. **Home/Búsqueda** - Hero section + búsqueda de fechas
2. **Catálogo de Habitaciones** - Grid con cards de habitaciones
3. **Detalle de Habitación** - Galería + información + reserva
4. **Check-in Form** - Formulario completo de datos
5. **Confirmación** - Resumen de reserva
6. **Perfil** - Datos personales e historial

### Vistas Administrador:
1. **Dashboard** - Métricas y estadísticas
2. **Gestión de Habitaciones** - CRUD de habitaciones
3. **Reservas Activas** - Lista de check-ins/check-outs
4. **Reportes** - Generación y descarga de reportes
5. **Estado de Habitaciones** - Vista de ocupación en tiempo real

## 📱 Features Responsive
- Mobile First Design
- Grid adaptable (1, 2, 3, 4 columnas)
- Navegación hamburguesa en móvil
- Touch-friendly components
- Imágenes optimizadas

## 🚀 Deployment en Render

### Backend (Web Service)
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Static Site)
- Build: `npm run build`
- Publish: `dist` directory

### Database (PostgreSQL)
- Managed PostgreSQL instance
- Auto backups
- Connection pooling

## 📊 Flujo de Trabajo

### Cliente:
1. Entra al sistema (sin login)
2. Busca habitaciones disponibles por fechas
3. Selecciona habitación y ve detalles/imágenes
4. Llena formulario de check-in
5. Sistema verifica disponibilidad
6. Confirmación de reserva
7. Al finalizar estadía: check-out

### Administrador:
1. Login al panel admin
2. Ve dashboard con ocupación actual
3. Gestiona habitaciones (CRUD)
4. Monitorea reservas activas
5. Genera reportes PDF/Excel
6. Exporta datos de ocupación

## 🔒 Seguridad
- CORS configurado para Render
- Variables de entorno para credenciales
- JWT para sesiones admin
- Validación de datos con Pydantic
- SQL Injection prevention con ORM

## 📦 Dependencias Principales

### Backend:
- fastapi
- uvicorn
- sqlalchemy
- psycopg2-binary
- pydantic
- python-jose (JWT)
- python-multipart (uploads)
- reportlab (PDF)
- openpyxl (Excel)
- Pillow (imágenes)

### Frontend:
- react
- react-router-dom
- axios
- date-fns
- react-icons
- tailwindcss
- react-datepicker
- framer-motion

## 📈 Roadmap Futuro (Opcional)
- [ ] Sistema de pagos online
- [ ] Notificaciones por email
- [ ] Sistema de reviews
- [ ] Multi-idioma
- [ ] Integración con calendarios
- [ ] App móvil nativa

---

**Fecha de inicio:** Octubre 2025
**Versión:** 1.0.0
**Estado:** En Desarrollo 🚧
