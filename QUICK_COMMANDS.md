# 🚀 COMANDOS RÁPIDOS - Sistema Hotel

## 📊 COMANDOS ÚTILES PARA DESARROLLO

### 🗄️ PostgreSQL / Base de Datos

```powershell
# Iniciar PostgreSQL (Windows)
net start postgresql-x64-14

# Detener PostgreSQL
net stop postgresql-x64-14

# Conectar a la base de datos
psql -U postgres -d hotel_db

# Crear base de datos
psql -U postgres -c "CREATE DATABASE hotel_db;"

# Ejecutar schema
psql -U postgres -d hotel_db -f database\schema.sql

# Backup
pg_dump -U postgres hotel_db > backup.sql

# Restore
psql -U postgres -d hotel_db < backup.sql

# Ver todas las tablas
psql -U postgres -d hotel_db -c "\dt"

# Ver datos de ejemplo
psql -U postgres -d hotel_db -c "SELECT * FROM rooms;"
```

### 🐍 Backend (FastAPI)

```powershell
# Navegar a backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Desactivar entorno virtual
deactivate

# Instalar dependencias
pip install -r requirements.txt

# Actualizar pip
python -m pip install --upgrade pip

# Crear .env
copy .env.example .env

# Ejecutar servidor
python main.py

# O con uvicorn directamente
uvicorn main:app --reload --port 8000

# Ejecutar con log detallado
uvicorn main:app --reload --log-level debug

# Verificar sintaxis
python -m py_compile main.py

# Ver dependencias instaladas
pip list

# Congelar dependencias
pip freeze > requirements.txt

# Ver info de paquete
pip show fastapi
```

### ⚛️ Frontend (React)

```powershell
# Navegar a frontend
cd frontend

# Instalar dependencias
npm install

# Crear .env
copy .env.example .env

# Ejecutar en desarrollo
npm run dev

# Ejecutar en puerto específico
npm run dev -- --port 3001

# Build para producción
npm run build

# Preview del build
npm run preview

# Limpiar node_modules
rmdir node_modules -Recurse -Force
del package-lock.json
npm install

# Ver paquetes instalados
npm list --depth=0

# Actualizar paquetes
npm update

# Verificar paquetes desactualizados
npm outdated

# Instalar paquete específico
npm install axios

# Lint
npm run lint
```

### 🧪 Testing y Verificación

```powershell
# Test Backend - Healthcheck
curl http://localhost:8000/health

# Test Backend - Rooms
curl http://localhost:8000/api/rooms

# Test Backend - Login
curl -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/x-www-form-urlencoded" -d "username=admin&password=admin123"

# Abrir API Docs
start http://localhost:8000/api/docs

# Abrir Frontend
start http://localhost:3000

# Abrir Admin Panel
start http://localhost:3000/admin/login
```

### 🔍 Debugging

```powershell
# Backend - Ver logs en tiempo real
# (Los logs aparecen en la consola donde ejecutaste python main.py)

# Frontend - Ver errores
# Abre DevTools en el navegador (F12)

# PostgreSQL - Ver logs
# En Windows: C:\Program Files\PostgreSQL\14\data\log\

# Ver procesos en puerto específico
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Matar proceso en puerto
# 1. Encontrar PID: netstat -ano | findstr :8000
# 2. Matar: taskkill /PID [número] /F
```

### 🗄️ SQL Queries Útiles

```sql
-- Ver todas las habitaciones
SELECT * FROM rooms;

-- Ver habitaciones disponibles
SELECT * FROM rooms WHERE status = 'Available';

-- Ver reservas activas
SELECT * FROM reservations WHERE status = 'Active';

-- Ver ocupación actual
SELECT * FROM occupancy_stats;

-- Ver estado de habitaciones
SELECT * FROM current_room_status;

-- Check-ins de hoy
SELECT * FROM reservations 
WHERE DATE(check_in_date) = CURRENT_DATE 
AND status IN ('Pending', 'Active');

-- Check-outs de hoy
SELECT * FROM reservations 
WHERE DATE(check_out_date) = CURRENT_DATE 
AND status = 'Active';

-- Ver todos los administradores
SELECT * FROM administrators;

-- Crear nuevo admin (password: newpass123)
INSERT INTO administrators (username, password_hash, full_name, email) 
VALUES (
  'newadmin',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eWq5P3K9w1Wm',
  'New Administrator',
  'newadmin@hotel.com'
);

-- Resetear una habitación a disponible
UPDATE rooms SET status = 'Available' WHERE room_number = '101';

-- Ver reservas de un huésped
SELECT r.*, rm.room_number, rm.type 
FROM reservations r
JOIN rooms rm ON r.room_id = rm.id
JOIN guests g ON r.guest_id = g.id
WHERE g.email = 'john.doe@email.com';

-- Estadísticas rápidas
SELECT 
  COUNT(*) as total_rooms,
  COUNT(CASE WHEN status = 'Available' THEN 1 END) as available,
  COUNT(CASE WHEN status = 'Occupied' THEN 1 END) as occupied
FROM rooms;

-- Limpiar reservas antiguas (CUIDADO)
DELETE FROM reservations 
WHERE status = 'Completed' 
AND check_out_date < NOW() - INTERVAL '90 days';

-- Backup de solo datos (INSERT statements)
-- Ejecutar en terminal:
-- pg_dump -U postgres --data-only --inserts hotel_db > data_backup.sql
```

### 🐍 Python Shell Interactivo (Backend)

```powershell
# Activar venv y abrir Python shell
cd backend
.\venv\Scripts\Activate.ps1
python

# Luego en Python:
```

```python
# Crear un nuevo admin
from app.services import AuthService
from app.schemas import AdminCreate
from app.database import SessionLocal

db = SessionLocal()
admin = AdminCreate(
    username="newadmin",
    password="securepass123",
    full_name="Administrator Name",
    email="admin@example.com",
    role="admin"
)
result = AuthService.create_admin(db, admin)
print(f"Admin created: {result.username}")
db.close()

# Listar habitaciones
from app.services import RoomService
from app.database import SessionLocal

db = SessionLocal()
rooms = RoomService.get_all_rooms(db)
for room in rooms:
    print(f"{room.room_number} - {room.type} - ${room.price_per_night}")
db.close()

# Verificar disponibilidad
from app.services import RoomService
from app.database import SessionLocal
from datetime import datetime, timedelta

db = SessionLocal()
tomorrow = datetime.now() + timedelta(days=1)
checkout = tomorrow + timedelta(days=3)

available = RoomService.check_room_availability(db, room_id=1, check_in=tomorrow, check_out=checkout)
print(f"Room available: {available}")
db.close()
```

### 📦 Git Commands

```powershell
# Inicializar repo
git init
git add .
git commit -m "Initial commit"

# Conectar con GitHub
git remote add origin https://github.com/tu-usuario/hotel-reception.git
git branch -M main
git push -u origin main

# Commits diarios
git add .
git commit -m "Add feature X"
git push

# Ver status
git status

# Ver cambios
git diff

# Ver historial
git log --oneline

# Crear branch
git checkout -b feature/nueva-funcionalidad

# Cambiar branch
git checkout main

# Merge branch
git merge feature/nueva-funcionalidad

# Ver branches
git branch -a

# Pull cambios
git pull origin main
```

### 🚀 Deploy en Render

```powershell
# 1. Push a GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. En Render.com:
# - New Web Service (Backend)
# - New Static Site (Frontend)
# - New PostgreSQL (Database)

# 3. Variables de entorno Backend (en Render):
DATABASE_URL=[internal_database_url]
SECRET_KEY=super-secret-key-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=https://tu-frontend.onrender.com
ENVIRONMENT=production
DEBUG=false

# 4. Variables de entorno Frontend (en Render):
VITE_API_URL=https://tu-backend.onrender.com/api

# 5. Ejecutar schema.sql en la base de datos de Render
# Usa el External Database URL con pgAdmin o psql
```

### 🔧 Troubleshooting

```powershell
# Backend no inicia
# 1. Verificar que PostgreSQL está corriendo
net start postgresql-x64-14

# 2. Verificar .env
cat backend\.env

# 3. Verificar conexión a BD
psql -U postgres -d hotel_db -c "SELECT 1;"

# 4. Reinstalar dependencias
cd backend
pip install --force-reinstall -r requirements.txt

# Frontend no conecta
# 1. Verificar que backend está corriendo
curl http://localhost:8000/health

# 2. Verificar .env
cat frontend\.env

# 3. Limpiar caché de Vite
cd frontend
rmdir .vite -Recurse -Force
npm run dev

# Puerto ocupado
# Backend: Cambiar PORT en .env
# Frontend: npm run dev -- --port 3001

# CORS Error
# Verificar ALLOWED_ORIGINS en backend/.env incluye frontend URL
```

### 📊 Monitoring (Producción)

```powershell
# Ver logs en Render
# Dashboard → Tu servicio → Logs

# Verificar health del backend
curl https://tu-backend.onrender.com/health

# Verificar API
curl https://tu-backend.onrender.com/api/rooms

# Test frontend
start https://tu-frontend.onrender.com
```

### 🎯 Comandos One-Liner Útiles

```powershell
# Setup completo (primera vez)
cd HOTEL-RECEPCION; psql -U postgres -c "CREATE DATABASE hotel_db;"; psql -U postgres -d hotel_db -f database\schema.sql; cd backend; python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt; copy .env.example .env

# Iniciar backend (PowerShell nueva)
cd backend; .\venv\Scripts\Activate.ps1; python main.py

# Iniciar frontend (PowerShell nueva)
cd frontend; npm run dev

# Ver todas las habitaciones
psql -U postgres -d hotel_db -c "SELECT room_number, type, status FROM rooms;"

# Ver reservas activas
psql -U postgres -d hotel_db -c "SELECT id, room_id, status, check_in_date FROM reservations WHERE status='Active';"

# Reset habitación a disponible
psql -U postgres -d hotel_db -c "UPDATE rooms SET status='Available' WHERE room_number='101';"
```

### 🎓 Tips de Desarrollo

```powershell
# Backend - Auto reload está activado
# Solo guarda los archivos y uvicorn recargará automáticamente

# Frontend - Hot Module Replacement (HMR)
# Vite recarga automáticamente al guardar

# Usar 2 terminales
# Terminal 1: Backend
# Terminal 2: Frontend

# PostgreSQL siempre debe estar corriendo
# Verifica con: net start postgresql-x64-14

# Para ver errores, siempre revisa:
# - Terminal del backend (para API errors)
# - Browser DevTools Console (para frontend errors)
# - PostgreSQL logs (para DB errors)

# Usa API Docs para probar endpoints
# http://localhost:8000/api/docs
# Es más fácil que usar curl
```

---

## 📚 Referencias Rápidas

### URLs Importantes (Desarrollo)

- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **Frontend**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin/login

### Credenciales Default

- **Admin**: admin / admin123
- **PostgreSQL**: postgres / [tu_password]

### Puertos

- **Backend**: 8000
- **Frontend**: 3000
- **PostgreSQL**: 5432

### Archivos Importantes

- `backend/.env` - Variables de entorno backend
- `frontend/.env` - Variables de entorno frontend
- `database/schema.sql` - Schema de la base de datos
- `backend/main.py` - Entrada del backend
- `frontend/src/App.jsx` - Entrada del frontend

---

<div align="center">

**💡 Guarda este archivo para referencia rápida!**

**🚀 Happy Coding!**

</div>
