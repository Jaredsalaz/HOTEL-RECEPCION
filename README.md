# 🏨 Hotel Reception System

Sistema completo de gestión hotelera con check-in/check-out, panel administrativo y generación de reportes.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Descripción

Sistema web completo para la gestión de un hotel que permite:

### 👤 Para Clientes:
- ✅ Ver catálogo de habitaciones con imágenes
- ✅ Buscar disponibilidad por fechas
- ✅ Realizar check-in sin necesidad de registro previo
- ✅ Ver detalles completos de cada habitación
- ✅ Confirmar reservas en tiempo real

### 👨‍💼 Para Administradores:
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de habitaciones (CRUD)
- ✅ Monitoreo de reservas activas
- ✅ Proceso de check-out
- ✅ Generación de reportes en PDF y Excel
- ✅ Visualización de ocupación y métricas

## 🏗️ Arquitectura

```
Sistema Hotelero
├── Backend (FastAPI + Python)
│   ├── Arquitectura MVC limpia
│   ├── PostgreSQL Database
│   └── API RESTful
├── Frontend (React + Vite)
│   ├── Diseño responsive tipo Airbnb
│   ├── TailwindCSS
│   └── React Router DOM
└── Deployment
    └── Render (Backend, Frontend, Database)
```

## 💻 Stack Tecnológico

### Backend
- **FastAPI** - Framework web de alto rendimiento
- **PostgreSQL** - Base de datos relacional
- **SQLAlchemy** - ORM
- **Pydantic** - Validación de datos
- **JWT** - Autenticación
- **ReportLab** - Generación de PDFs
- **OpenPyXL** - Generación de Excel

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool
- **TailwindCSS** - Framework CSS
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Framer Motion** - Animaciones
- **React DatePicker** - Selector de fechas
- **React Hot Toast** - Notificaciones

### Database
- **PostgreSQL 14+** - Base de datos principal
- Triggers automáticos para updated_at
- Vistas para reportes optimizados
- Índices para búsquedas rápidas

## 🚀 Quick Start

### Prerequisitos

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git

### Instalación Rápida

```powershell
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/hotel-reception.git
cd hotel-reception

# 2. Configurar base de datos
psql -U postgres -c "CREATE DATABASE hotel_db;"
psql -U postgres -d hotel_db -f database/schema.sql

# 3. Backend
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# Editar .env con tus credenciales
python main.py

# 4. Frontend (nueva terminal)
cd frontend
npm install
# Crear .env con: VITE_API_URL=http://localhost:8000/api
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

### Credenciales por Defecto

- **Admin Panel**: http://localhost:3000/admin/login
  - Usuario: `admin`
  - Contraseña: `admin123`

## 📚 Documentación

- 📖 **[Guía de Instalación Completa](INSTALLATION_GUIDE.md)** - Instrucciones detalladas paso a paso
- 📖 **[Documentación del Proyecto](PROJECT_DOCUMENTATION.md)** - Arquitectura y módulos
- 📖 **[Backend README](backend/README.md)** - API y configuración del backend
- 📖 **[Frontend README](frontend/README.md)** - Componentes y desarrollo frontend
- 📖 **[Lista de Componentes](frontend/COMPONENTS_TODO.md)** - Guía de componentes a crear

## 📊 Módulos del Sistema

### 1. 🛏️ Gestión de Habitaciones
- Catálogo con imágenes
- Tipos: Single, Double, Suite, Deluxe
- Estados: Available, Occupied, Maintenance
- Amenities y servicios
- CRUD completo (Admin)

### 2. ✅ Check-in / Check-out
- Verificación de disponibilidad en tiempo real
- Formulario de registro sin login previo
- Cálculo automático de precios
- Actualización automática de estados
- Confirmación de reserva

### 3. 📅 Gestión de Reservas
- Estados: Pending, Active, Completed, Cancelled
- Historial completo
- Búsqueda y filtros
- Monitoreo en tiempo real

### 4. 👤 Gestión de Huéspedes
- Registro automático
- Perfil con historial
- Información de contacto
- Sin necesidad de login

### 5. 📊 Reportes y Estadísticas
- Dashboard con métricas en vivo
- Reportes en PDF y Excel
- Análisis de ocupación
- Ingresos y tendencias

### 6. 👨‍💼 Panel Administrativo
- Login seguro con JWT
- Dashboard interactivo
- Gestión completa del hotel
- Generación de reportes

## 🗄️ Estructura de Base de Datos

```sql
Tables:
├── rooms              # Habitaciones
├── room_images        # Galería de imágenes
├── guests             # Huéspedes
├── reservations       # Reservas
└── administrators     # Administradores

Views:
├── current_room_status    # Estado actual de habitaciones
└── occupancy_stats        # Estadísticas de ocupación

Functions:
└── check_room_availability  # Verificar disponibilidad
```

## 🎨 Diseño UI/UX

### Inspiración: Airbnb
- **Clean & Modern** - Diseño minimalista
- **Responsive** - Mobile, Tablet, Desktop
- **Intuitivo** - Navegación simple
- **Visual** - Imágenes de alta calidad
- **Rápido** - Carga optimizada

### Colores
- **Primary**: Blue (#0ea5e9)
- **Secondary**: Purple (#d946ef)
- **Success**: Green (#10b981)
- **Danger**: Red (#ef4444)

## 📱 Screenshots

### Cliente
- Home con búsqueda
- Catálogo de habitaciones
- Detalle de habitación
- Formulario de check-in
- Confirmación

### Admin
- Dashboard con estadísticas
- Gestión de habitaciones
- Gestión de reservas
- Generación de reportes

## 🚀 Deployment en Render

### Backend
```yaml
Type: Web Service
Build: pip install -r requirements.txt
Start: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend
```yaml
Type: Static Site
Build: npm install && npm run build
Publish: dist
```

### Database
```yaml
Type: PostgreSQL
Plan: Free (starter) o Paid (producción)
```

Ver **[INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)** para instrucciones completas de deployment.

## 🧪 Testing

### Backend
```powershell
# Healthcheck
curl http://localhost:8000/health

# Ver documentación interactiva
http://localhost:8000/api/docs
```

### Frontend
```powershell
# Ejecutar en desarrollo
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

## 📈 Features Futuras

- [ ] Sistema de pagos online (Stripe)
- [ ] Notificaciones por email
- [ ] Sistema de reviews y calificaciones
- [ ] Multi-idioma (i18n)
- [ ] Integración con Google Maps
- [ ] Chat en vivo
- [ ] App móvil nativa
- [ ] Reservas recurrentes
- [ ] Programa de fidelidad
- [ ] Integración con OTAs

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la Branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

## 👨‍💻 Autor

**Sistema de Gestión Hotelera**

- Email: contact@hotel-system.com
- GitHub: [@tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- React Community
- FastAPI Documentation
- Tailwind CSS
- Unsplash por las imágenes de ejemplo
- Render por el hosting gratuito

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la [Guía de Instalación](INSTALLATION_GUIDE.md)
2. Consulta la sección de Troubleshooting en los READMEs
3. Crea un Issue en GitHub
4. Contacta al equipo de desarrollo

---

## 🎯 Estado del Proyecto

### ✅ Completado (Backend)
- [x] Modelos de base de datos
- [x] API REST completa
- [x] Autenticación JWT
- [x] Servicios de negocio
- [x] Generación de reportes PDF/Excel
- [x] Documentación Swagger
- [x] Configuración para Render

### ✅ Completado (Database)
- [x] Schema SQL completo
- [x] Triggers y funciones
- [x] Vistas optimizadas
- [x] Datos de ejemplo (seed)
- [x] Índices para rendimiento

### 🚧 En Progreso (Frontend)
- [x] Configuración base (Vite, Tailwind, Router)
- [x] Servicios de API
- [ ] Componentes UI (ver COMPONENTS_TODO.md)
- [ ] Páginas cliente
- [ ] Páginas admin
- [ ] Testing

### 📋 Documentación
- [x] README principal
- [x] Guía de instalación
- [x] Documentación de arquitectura
- [x] READMEs de backend y frontend
- [x] Lista de componentes a crear

---

**⭐ Si te gusta este proyecto, dale una estrella en GitHub!**

**🚀 Ready para producción con deployment en Render**

---

### 📊 Estadísticas

- **Backend**: 15+ endpoints
- **Database**: 5 tablas, 2 vistas, 1 función
- **Frontend**: 30+ componentes a crear
- **Features**: 8 módulos principales
- **Tiempo estimado de desarrollo**: 2-3 semanas

### 🎓 Ideal Para

- ✅ Portfolio de desarrolladores
- ✅ Proyecto de aprendizaje Full Stack
- ✅ Base para sistema real de hotel
- ✅ Demostración de arquitectura limpia
- ✅ Práctica con React + FastAPI

---

<div align="center">

**Made with ❤️ using FastAPI & React**

[Documentación](PROJECT_DOCUMENTATION.md) • [Instalación](INSTALLATION_GUIDE.md) • [API Docs](http://localhost:8000/api/docs)

</div>
