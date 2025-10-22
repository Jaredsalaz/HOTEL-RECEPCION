# Hotel Reception System - Frontend

Frontend construido con React y Vite, diseño responsive tipo Airbnb.

## 🚀 Tecnologías

- **React 18** - Biblioteca UI
- **React Router DOM** - Enrutamiento
- **Axios** - Cliente HTTP
- **TailwindCSS** - Estilos
- **Framer Motion** - Animaciones
- **React DatePicker** - Selector de fechas
- **React Icons** - Iconos
- **React Hot Toast** - Notificaciones
- **Vite** - Build tool

## 📦 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del frontend:

```env
VITE_API_URL=http://localhost:8000/api
```

Para producción en Render:
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

### 4. Build para producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 🏗️ Estructura del Proyecto

```
frontend/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── common/      # Botones, Cards, Loading, etc
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── ProtectedRoute.jsx
│   ├── layouts/         # Layouts de página
│   │   ├── ClientLayout.jsx
│   │   └── AdminLayout.jsx
│   ├── pages/          # Páginas de la app
│   │   ├── client/     # Vistas del cliente
│   │   │   ├── Home.jsx
│   │   │   ├── RoomCatalog.jsx
│   │   │   ├── RoomDetail.jsx
│   │   │   ├── CheckInForm.jsx
│   │   │   └── Confirmation.jsx
│   │   └── admin/      # Vistas del admin
│   │       ├── AdminLogin.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── RoomManagement.jsx
│   │       ├── ReservationManagement.jsx
│   │       └── Reports.jsx
│   ├── services/       # Servicios API
│   │   ├── api.js
│   │   ├── roomService.js
│   │   ├── checkinService.js
│   │   ├── reservationService.js
│   │   ├── reportService.js
│   │   └── authService.js
│   ├── utils/          # Utilidades
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.jsx         # Componente principal
│   ├── main.jsx        # Punto de entrada
│   └── index.css       # Estilos globales
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Componentes Principales

### Vistas Cliente

1. **Home** - Hero section con búsqueda de fechas
2. **RoomCatalog** - Grid de habitaciones con filtros
3. **RoomDetail** - Detalles de habitación con galería
4. **CheckInForm** - Formulario de check-in
5. **Confirmation** - Confirmación de reserva

### Vistas Admin

1. **AdminDashboard** - Estadísticas y métricas
2. **RoomManagement** - CRUD de habitaciones
3. **ReservationManagement** - Gestión de reservas
4. **Reports** - Generación y descarga de reportes

## 🔒 Autenticación

El sistema usa JWT para autenticación de administradores:

```javascript
// Login
import { authService } from './services/authService';

const login = async (username, password) => {
  const data = await authService.login(username, password);
  // Token guardado automáticamente en localStorage
};

// Logout
authService.logout();
```

## 📱 Responsive Design

El diseño es completamente responsive:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Utiliza Tailwind breakpoints:
- `sm:` - Small devices
- `md:` - Medium devices
- `lg:` - Large devices
- `xl:` - Extra large devices

## 🚀 Deploy en Render

### Opción 1: Static Site

1. **Crear nuevo Static Site en Render**
   - Connect tu repositorio
   - Name: `hotel-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Configurar Variables de Entorno**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

3. **Deploy**
   - Render automáticamente construye y despliega
   - URL: `https://hotel-frontend.onrender.com`

### Opción 2: Con Web Service

Si necesitas server-side rendering o funcionalidades adicionales.

## 🎯 Flujo de Usuario

### Cliente:
1. Entra a la home
2. Selecciona fechas de check-in/check-out
3. Ve catálogo de habitaciones disponibles
4. Selecciona habitación y ve detalles
5. Llena formulario de check-in
6. Confirma reserva
7. Recibe número de confirmación

### Admin:
1. Login en `/admin/login`
2. Ve dashboard con estadísticas
3. Gestiona habitaciones (CRUD)
4. Monitorea reservas activas
5. Genera reportes PDF/Excel
6. Realiza check-outs

## 🎨 Personalización

### Colores

Edita `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#yourcolor',
    // ...
  }
}
```

### Tipografía

Cambia la fuente en `tailwind.config.js`:

```javascript
fontFamily: {
  sans: ['Your Font', 'sans-serif'],
}
```

Importa la fuente en `index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font&display=swap');
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

## 📊 Features Implementadas

- ✅ Búsqueda de habitaciones por fechas
- ✅ Filtros por tipo y capacidad
- ✅ Galería de imágenes
- ✅ Formulario de check-in
- ✅ Validación de disponibilidad en tiempo real
- ✅ Dashboard administrativo
- ✅ CRUD de habitaciones
- ✅ Gestión de reservas
- ✅ Generación de reportes PDF/Excel
- ✅ Diseño responsive
- ✅ Animaciones suaves
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling

## 🐛 Troubleshooting

### Error de conexión API

Verifica que:
1. El backend esté corriendo
2. La URL en `.env` sea correcta
3. CORS esté configurado en el backend

### Build error

Limpia la caché:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Estilos no aplicados

Regenera TailwindCSS:
```bash
npm run dev
```

## 📝 Buenas Prácticas

1. **Componentes Pequeños** - Mantén componentes enfocados y reutilizables
2. **Manejo de Estados** - Usa hooks de React apropiadamente
3. **Loading States** - Siempre muestra feedback visual
4. **Error Handling** - Maneja errores gracefully
5. **Responsive** - Prueba en múltiples dispositivos
6. **Accesibilidad** - Usa semantic HTML y ARIA labels

## 🔄 Próximas Features

- [ ] Búsqueda avanzada con más filtros
- [ ] Sistema de favoritos
- [ ] Reviews y calificaciones
- [ ] Integración con Google Maps
- [ ] Chat en vivo
- [ ] Multi-idioma (i18n)
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)

## 📧 Soporte

Para problemas o preguntas, crea un issue en el repositorio.

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025
