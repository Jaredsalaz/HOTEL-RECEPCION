# 🏨 GUÍA DE INSTALACIÓN COMPLETA - Sistema de Gestión Hotelera

## 📋 Resumen del Proyecto

Sistema completo de gestión hotelera con:
- ✅ Backend FastAPI (Python)
- ✅ Frontend React (JavaScript)
- ✅ Base de Datos PostgreSQL
- ✅ Arquitectura MVC limpia
- ✅ Diseño responsive tipo Airbnb
- ✅ Check-in/Check-out funcional
- ✅ Panel administrativo
- ✅ Generación de reportes PDF/Excel
- ✅ Listo para deploy en Render

---

## 🚀 PASO 1: Configurar Base de Datos PostgreSQL

### Instalación de PostgreSQL

#### Windows:
1. Descarga PostgreSQL desde: https://www.postgresql.org/download/windows/
2. Ejecuta el instalador
3. Anota la contraseña del usuario `postgres`
4. Por defecto usa puerto `5432`

#### pgAdmin:
1. Viene incluido con PostgreSQL
2. Abre pgAdmin 4
3. Conecta con usuario `postgres`

### Crear Base de Datos

#### Opción 1: Desde pgAdmin

1. Abre pgAdmin
2. Right-click en "Databases" → "Create" → "Database"
3. Name: `hotel_db`
4. Save

5. Ejecutar el schema:
   - Right-click en `hotel_db` → "Query Tool"
   - Abre el archivo: `database/schema.sql`
   - Click "Execute" (F5)
   - Verás "Database schema created successfully!"

#### Opción 2: Desde línea de comandos

```powershell
# Crear base de datos
psql -U postgres -c "CREATE DATABASE hotel_db;"

# Ejecutar schema
psql -U postgres -d hotel_db -f database\schema.sql
```

### Verificar Instalación

```sql
-- En pgAdmin Query Tool o psql
SELECT * FROM rooms;
SELECT * FROM administrators;
```

Deberías ver:
- 8 habitaciones de ejemplo
- 1 administrador (username: admin, password: admin123)

---

## 🐍 PASO 2: Configurar Backend (FastAPI)

### Instalar Python

1. Descarga Python 3.10+ desde: https://www.python.org/downloads/
2. ✅ Marca "Add Python to PATH" durante instalación
3. Verifica: `python --version`

### Configurar Backend

```powershell
# Navegar a la carpeta backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Si da error de permisos, ejecuta:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Instalar dependencias
pip install -r requirements.txt

# Copiar configuración de entorno
copy .env.example .env
```

### Configurar .env

Edita el archivo `backend\.env`:

```env
DEBUG=True
ENVIRONMENT=development

# Ajusta estos valores según tu configuración de PostgreSQL
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/hotel_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
DB_NAME=hotel_db

# Genera una clave secreta (puedes usar cualquier string largo)
SECRET_KEY=super-secret-key-change-this-in-production-12345678
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads/images
PORT=8000
```

### Ejecutar Backend

```powershell
# Asegúrate de estar en /backend con venv activo
python main.py

# O con uvicorn:
uvicorn main:app --reload --port 8000
```

Verifica que funciona:
- http://localhost:8000 → {"message": "Hotel Reception System API"}
- http://localhost:8000/api/docs → Documentación Swagger
- http://localhost:8000/health → {"status": "healthy"}

---

## ⚛️ PASO 3: Configurar Frontend (React)

### Instalar Node.js

1. Descarga Node.js LTS desde: https://nodejs.org/
2. Ejecuta el instalador
3. Verifica: `node --version` y `npm --version`

### Configurar Frontend

```powershell
# Abrir NUEVA terminal (deja el backend corriendo)
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Crear archivo de entorno
New-Item .env -ItemType File

# Editar .env y agregar:
# VITE_API_URL=http://localhost:8000/api
```

Edita `frontend\.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

### Ejecutar Frontend

```powershell
# En /frontend
npm run dev
```

Abre tu navegador en: http://localhost:3000

---

## ✅ PASO 4: Verificar que Todo Funciona

### Test Backend

1. Abre http://localhost:8000/api/docs
2. Prueba estos endpoints:
   - GET `/api/rooms` → Debe retornar 8 habitaciones
   - GET `/api/reports/dashboard` → Estadísticas
   - POST `/api/auth/login` → Login con admin/admin123

### Test Frontend

1. Abre http://localhost:3000
2. Deberías ver la página de inicio
3. Prueba:
   - Ver catálogo de habitaciones
   - Click en una habitación para ver detalles
   - Ir a `/admin/login` → Login: admin / admin123
   - Ver dashboard administrativo

### Test Check-in Completo

1. En frontend, ve a "Rooms"
2. Selecciona una habitación
3. Click "Book Now"
4. Llena el formulario:
   ```
   First Name: John
   Last Name: Doe
   Email: john@test.com
   Phone: +1234567890
   ID Document: TEST123
   Check-in: [fecha futura]
   Check-out: [fecha posterior]
   ```
5. Submit → Deberías ver confirmación

6. En admin panel:
   - Ve a "Reservations"
   - Deberías ver la nueva reserva
   - Puedes hacer check-out

---

## 🎯 PASO 5: Deploy en Render (Opcional)

### Preparar Repositorio

```powershell
# En la raíz del proyecto
git init
git add .
git commit -m "Initial commit"

# Crear repositorio en GitHub y subir código
git remote add origin https://github.com/tu-usuario/hotel-reception.git
git branch -M main
git push -u origin main
```

### Deploy Base de Datos

1. Ve a https://render.com (crea cuenta gratis)
2. New → PostgreSQL
   - Name: `hotel-db`
   - Database: `hotel_db`
   - User: `hotel_user`
   - Region: Oregon (o el más cercano)
   - Plan: Free
3. Crear
4. Espera a que esté disponible
5. Copia la "Internal Database URL"
6. Conecta con pgAdmin usando la URL externa
7. Ejecuta el `schema.sql` en Query Tool

### Deploy Backend

1. En Render: New → Web Service
2. Connect Repository (GitHub)
3. Configuración:
   - Name: `hotel-backend`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   ```
   DATABASE_URL=[Internal Database URL de Render]
   SECRET_KEY=genera-una-clave-segura-aqui
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ALLOWED_ORIGINS=https://tu-frontend.onrender.com
   ENVIRONMENT=production
   DEBUG=false
   ```
5. Create Web Service
6. Espera el deploy (5-10 minutos)
7. Anota la URL: `https://hotel-backend.onrender.com`

### Deploy Frontend

1. En Render: New → Static Site
2. Connect Repository
3. Configuración:
   - Name: `hotel-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Environment Variables:
   ```
   VITE_API_URL=https://hotel-backend.onrender.com/api
   ```
5. Create Static Site
6. Espera el deploy
7. Abre la URL: `https://hotel-frontend.onrender.com`

### Actualizar CORS en Backend

En Render, edita la variable de entorno del backend:
```
ALLOWED_ORIGINS=https://hotel-frontend.onrender.com,https://hotel-frontend.onrender.com
```

Redeploy el backend.

---

## 📊 Credenciales por Defecto

### Administrador
- **URL**: http://localhost:3000/admin/login (o tu URL de Render)
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Base de Datos
- **Host**: localhost
- **Port**: 5432
- **Database**: hotel_db
- **User**: postgres
- **Password**: [tu contraseña de postgres]

---

## 🐛 Solución de Problemas Comunes

### Backend no inicia

```powershell
# Verifica que PostgreSQL está corriendo
# En Services (services.msc), busca "postgresql"

# Verifica la conexión a la base de datos
psql -U postgres -d hotel_db -c "SELECT 1;"

# Reinstala dependencias
pip install --force-reinstall -r requirements.txt
```

### Frontend no conecta con Backend

1. Verifica que el backend esté corriendo en http://localhost:8000
2. Revisa la variable VITE_API_URL en frontend/.env
3. Abre las Dev Tools del navegador y revisa la consola
4. Verifica CORS en el backend

### Error de CORS

Edita `backend/app/config.py` y asegúrate que `ALLOWED_ORIGINS` incluye tu frontend URL.

### Puerto en uso

Cambia el puerto:

Backend:
```powershell
uvicorn main:app --reload --port 8001
```

Frontend:
```powershell
npm run dev -- --port 3001
```

### Error de base de datos "relation does not exist"

Ejecuta nuevamente el schema.sql:
```powershell
psql -U postgres -d hotel_db -f database\schema.sql
```

---

## 📚 Comandos Útiles

### Backend

```powershell
# Activar entorno virtual
cd backend
.\venv\Scripts\Activate.ps1

# Ejecutar servidor
python main.py

# Ver logs en tiempo real
# Los logs aparecen en la consola

# Crear nuevo admin (ejecutar en Python shell)
python
>>> from app.services import AuthService
>>> from app.schemas import AdminCreate
>>> from app.database import SessionLocal
>>> db = SessionLocal()
>>> admin = AdminCreate(username="newadmin", password="pass123", full_name="Admin Name", email="admin@test.com")
>>> AuthService.create_admin(db, admin)
```

### Frontend

```powershell
# Ejecutar desarrollo
cd frontend
npm run dev

# Build producción
npm run build

# Preview build
npm run preview

# Limpiar y reinstalar
rmdir node_modules -Recurse
del package-lock.json
npm install
```

### Base de Datos

```sql
-- Ver todas las habitaciones
SELECT * FROM rooms;

-- Ver reservas activas
SELECT * FROM reservations WHERE status = 'Active';

-- Ver estadísticas
SELECT * FROM occupancy_stats;

-- Resetear base de datos (CUIDADO: Borra todo)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Luego ejecuta schema.sql nuevamente
```

---

## 🎓 Próximos Pasos

1. **Personaliza el diseño**: Edita colores en `tailwind.config.js`
2. **Agrega más habitaciones**: Usa el panel admin o inserta en la BD
3. **Carga imágenes reales**: Reemplaza las URLs de Unsplash
4. **Configura email**: Agrega notificaciones por correo
5. **Agrega pagos**: Integra Stripe o PayPal
6. **Mejora reportes**: Agrega más métricas y gráficos

---

## 📖 Documentación Adicional

- **Backend**: `backend/README.md`
- **Frontend**: `frontend/README.md`
- **Arquitectura**: `PROJECT_DOCUMENTATION.md`
- **API Docs**: http://localhost:8000/api/docs (cuando esté corriendo)

---

## 💡 Tips de Desarrollo

1. Mantén el backend y frontend corriendo en terminales separadas
2. Usa las DevTools del navegador para debugging
3. Revisa los logs del backend para errores de API
4. Usa Thunder Client o Postman para probar la API
5. Commit frecuentemente mientras desarrollas
6. Prueba en múltiples navegadores y dispositivos

---

## ✅ Checklist de Verificación

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `hotel_db` creada
- [ ] Schema.sql ejecutado exitosamente
- [ ] Python 3.10+ instalado
- [ ] Backend dependencies instaladas
- [ ] Backend .env configurado
- [ ] Backend corriendo en :8000
- [ ] Node.js instalado
- [ ] Frontend dependencies instaladas
- [ ] Frontend .env configurado
- [ ] Frontend corriendo en :3000
- [ ] Puedo ver habitaciones en el frontend
- [ ] Puedo hacer login como admin
- [ ] Puedo crear una reserva
- [ ] Puedo generar reportes

---

**¡Listo! Tu sistema hotelero está funcionando.** 🎉

Si tienes problemas, revisa la sección de troubleshooting o consulta los README individuales.
