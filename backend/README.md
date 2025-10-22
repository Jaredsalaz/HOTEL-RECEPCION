# Hotel Reception System - Backend

Backend API construido con FastAPI para el sistema de gestión hotelera.

## 🚀 Tecnologías

- **FastAPI** - Framework web de alto rendimiento
- **PostgreSQL** - Base de datos
- **SQLAlchemy** - ORM
- **Pydantic** - Validación de datos
- **JWT** - Autenticación
- **ReportLab** - Generación de PDFs
- **OpenPyXL** - Generación de Excel

## 📦 Instalación Local

### 1. Crear entorno virtual

```bash
python -m venv venv
```

### 2. Activar entorno virtual

Windows:
```bash
venv\Scripts\activate
```

Linux/Mac:
```bash
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

Copia `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de PostgreSQL.

### 5. Crear base de datos

En pgAdmin o psql, ejecuta el script:

```bash
psql -U postgres -f ../database/schema.sql
```

O importa el archivo `schema.sql` desde pgAdmin.

### 6. Ejecutar servidor

```bash
python main.py
```

O con uvicorn directamente:

```bash
uvicorn main:app --reload --port 8000
```

El servidor estará disponible en: `http://localhost:8000`

## 📚 Documentación API

Una vez que el servidor esté corriendo, accede a:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## 🏗️ Estructura del Proyecto

```
backend/
├── app/
│   ├── controllers/        # Endpoints de la API
│   │   ├── auth_controller.py
│   │   ├── room_controller.py
│   │   ├── guest_controller.py
│   │   ├── reservation_controller.py
│   │   ├── checkin_controller.py
│   │   └── report_controller.py
│   ├── models/            # Modelos de base de datos
│   │   └── models.py
│   ├── schemas/           # Schemas de Pydantic
│   │   └── schemas.py
│   ├── services/          # Lógica de negocio
│   │   ├── room_service.py
│   │   ├── guest_service.py
│   │   ├── reservation_service.py
│   │   ├── auth_service.py
│   │   └── report_service.py
│   ├── config.py          # Configuración
│   └── database.py        # Conexión a BD
├── main.py               # Punto de entrada
├── requirements.txt      # Dependencias
└── .env.example         # Variables de entorno ejemplo
```

## 🔐 Autenticación

El sistema usa JWT para autenticación de administradores.

### Login

```bash
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=admin&password=admin123
```

Respuesta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Uso del Token

Incluye el token en las peticiones protegidas:

```bash
Authorization: Bearer <token>
```

## 📡 Endpoints Principales

### Habitaciones

- `GET /api/rooms` - Listar habitaciones
- `GET /api/rooms/{id}` - Detalle de habitación
- `GET /api/rooms/available/search` - Buscar habitaciones disponibles
- `POST /api/rooms` - Crear habitación (Admin)
- `PUT /api/rooms/{id}` - Actualizar habitación (Admin)
- `DELETE /api/rooms/{id}` - Eliminar habitación (Admin)

### Check-in / Check-out

- `POST /api/checkin` - Realizar check-in
- `POST /api/checkin/checkout` - Realizar check-out
- `GET /api/checkin/verify/{room_id}` - Verificar disponibilidad

### Reservas

- `GET /api/reservations` - Listar reservas
- `GET /api/reservations/{id}` - Detalle de reserva
- `POST /api/reservations` - Crear reserva
- `GET /api/reservations/status/active` - Reservas activas
- `GET /api/reservations/today/checkins` - Check-ins de hoy

### Reportes

- `GET /api/reports/dashboard` - Estadísticas del dashboard
- `GET /api/reports/occupancy/pdf` - Descargar reporte PDF
- `GET /api/reports/occupancy/excel` - Descargar reporte Excel
- `GET /api/reports/rooms-status` - Estado de habitaciones

### Huéspedes

- `GET /api/guests` - Listar huéspedes
- `GET /api/guests/{id}` - Detalle de huésped
- `POST /api/guests` - Crear huésped
- `PUT /api/guests/{id}` - Actualizar huésped
- `GET /api/guests/{id}/history` - Historial de reservas

## 🚀 Deploy en Render

### 1. Conectar Repositorio

- Crea una cuenta en [Render](https://render.com)
- Conecta tu repositorio de GitHub

### 2. Crear PostgreSQL Database

- New → PostgreSQL
- Name: `hotel-db`
- Plan: Free
- Guarda la URL de conexión

### 3. Crear Web Service

- New → Web Service
- Conecta el repositorio
- Name: `hotel-backend`
- Root Directory: `backend`
- Environment: Python 3
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 4. Configurar Variables de Entorno

En el dashboard de Render, añade:

```
DATABASE_URL=<postgresql_url_from_render>
SECRET_KEY=<generate_random_key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=https://your-frontend.onrender.com
ENVIRONMENT=production
DEBUG=false
```

### 5. Deploy

- Click "Create Web Service"
- Render automáticamente desplegará tu aplicación
- La URL será: `https://hotel-backend.onrender.com`

## 🧪 Testing

Para probar la API localmente:

```bash
# Healthcheck
curl http://localhost:8000/health

# Listar habitaciones
curl http://localhost:8000/api/rooms

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

## 📊 Base de Datos

### Credenciales por defecto

- **Admin**: 
  - Username: `admin`
  - Password: `admin123`

### Habitaciones de ejemplo

El script `schema.sql` incluye 8 habitaciones de ejemplo:
- 2 Single (€50/noche)
- 2 Double (€80/noche)
- 2 Suite (€150/noche)
- 2 Deluxe (€200/noche)

## 🔧 Mantenimiento

### Crear nuevo admin

```python
from app.services import AuthService
from app.schemas import AdminCreate
from app.database import SessionLocal

db = SessionLocal()
admin = AdminCreate(
    username="newadmin",
    password="securepassword",
    full_name="New Administrator",
    email="newadmin@hotel.com",
    role="admin"
)
AuthService.create_admin(db, admin)
```

### Limpiar reservas antiguas

```sql
DELETE FROM reservations 
WHERE status = 'Completed' 
AND check_out_date < NOW() - INTERVAL '90 days';
```

## 🐛 Troubleshooting

### Error de conexión a base de datos

Verifica que PostgreSQL esté corriendo:
```bash
# Windows
net start postgresql-x64-14

# Linux
sudo systemctl start postgresql
```

### Error de importación

Reinstala las dependencias:
```bash
pip install --force-reinstall -r requirements.txt
```

### Puerto en uso

Cambia el puerto en `.env`:
```
PORT=8001
```

## 📝 Licencia

MIT License

## 👨‍💻 Autor

Sistema de Gestión Hotelera - 2025
