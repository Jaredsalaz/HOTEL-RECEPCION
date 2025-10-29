# 🔒 GUÍA DE SEGURIDAD - PANEL ADMINISTRATIVO

## 📋 Resumen de Implementación

El sistema implementa **Opción 2: Ruta Oculta + Middleware + ProtectedRoute** para proteger el acceso al panel administrativo.

---

## 🎯 Características de Seguridad Implementadas

### 1. **Ruta Oculta (Security by Obscurity)**
- ❌ Ruta antigua (insegura): `/admin`
- ✅ Ruta nueva (oculta): `/secure-admin-xyz789`

**Beneficios:**
- No es obvia para atacantes
- Reduce ataques automatizados
- Fácil de cambiar si se compromete

### 2. **Middleware de Verificación de Admin** (`admin_middleware.py`)

**Ubicación:** `backend/app/middleware/admin_middleware.py`

**Funcionalidad:**
```python
def verify_admin_token(credentials, db):
    """
    1. Extrae el token del header Authorization
    2. Decodifica y valida el JWT
    3. Verifica que el usuario existe en la tabla Administrator
    4. Retorna el objeto Administrator si es válido
    5. Lanza HTTPException si hay cualquier error
    """
```

**Aplicación:**
- Se aplica automáticamente a todas las rutas de reportes
- Protege endpoints críticos del sistema

### 3. **ProtectedRoute Frontend** (Mejorado)

**Ubicación:** `frontend/src/components/ProtectedRoute.jsx`

**Mejoras:**
```javascript
- Loading state mientras valida autenticación
- Llamada a API para verificar token válido
- Logout automático si token expiró
- Redirección a ruta oculta de login
```

### 4. **Interceptor de API con Autenticación**

**Ubicación:** `frontend/src/services/api.js`

**Funcionalidad:**
```javascript
// Request interceptor: Agrega token automáticamente
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: Detecta 401 y redirige
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 && 
            window.location.pathname.startsWith('/secure-admin-xyz789')) {
            localStorage.removeItem('token');
            window.location.href = '/secure-admin-xyz789/login';
        }
        return Promise.reject(error);
    }
);
```

---

## 🗂️ Archivos Modificados

### Backend (6 archivos)

1. **`backend/app/config.py`**
   - Agregado: `ADMIN_ROUTE_PREFIX = "/secure-admin-xyz789"`
   - Agregado: `ADMIN_SESSION_TIMEOUT = 30`
   - Agregado: `ADMIN_MAX_LOGIN_ATTEMPTS = 5`
   - Agregado: `ADMIN_LOCKOUT_DURATION = 15`

2. **`backend/app/middleware/__init__.py`** ✨ NUEVO
   - Exporta funciones del middleware

3. **`backend/app/middleware/admin_middleware.py`** ✨ NUEVO
   - `verify_admin_token()` - Verifica JWT y admin
   - `require_admin()` - Dependency para FastAPI

4. **`backend/app/controllers/auth_controller.py`**
   - Cambio: `router.prefix = "/secure-admin-xyz789/auth"`
   - `/me` ahora usa `verify_admin_token`

5. **`backend/app/controllers/report_controller.py`**
   - Cambio: `router.prefix = "/secure-admin-xyz789/reports"`
   - **Todas las rutas** protegidas con `dependencies=[Depends(verify_admin_token)]`

### Frontend (7 archivos)

1. **`frontend/src/App.jsx`**
   - Cambio: `/admin/*` → `/secure-admin-xyz789/*`
   - Agregado: Redirect de rutas antiguas

2. **`frontend/src/components/ProtectedRoute.jsx`**
   - Mejorado: Validación asíncrona de token
   - Agregado: Loading state
   - Agregado: Logout automático si token inválido

3. **`frontend/src/components/admin/AdminSidebar.jsx`**
   - Cambio: Todas las rutas actualizadas

4. **`frontend/src/components/admin/AdminNavbar.jsx`**
   - Cambio: Logout redirige a `/secure-admin-xyz789/login`

5. **`frontend/src/pages/admin/AdminLogin.jsx`**
   - Cambio: Redirect exitoso a `/secure-admin-xyz789`

6. **`frontend/src/services/authService.js`**
   - Agregado: `const ADMIN_PREFIX = '/secure-admin-xyz789'`
   - Actualizado: Todas las rutas usan el prefijo

7. **`frontend/src/services/reportService.js`**
   - Agregado: `const ADMIN_PREFIX = '/secure-admin-xyz789'`
   - Actualizado: Todas las rutas usan el prefijo

8. **`frontend/src/services/api.js`**
   - Cambio: Interceptor detecta `/secure-admin-xyz789`

---

## 🚀 Cómo Usar

### 1. **Acceso Normal al Admin**

```
1. Ir a: http://localhost:3000/secure-admin-xyz789/login
2. Ingresar credenciales:
   - Usuario: admin
   - Contraseña: admin123
3. Sistema valida y redirige a dashboard
```

### 2. **Si Intentan Acceder con Ruta Antigua**

```
URL: http://localhost:3000/admin/login
Resultado: Redirige automáticamente a /secure-admin-xyz789/login
```

### 3. **Si Token Expira Durante Sesión**

```
1. Usuario hace request a API protegida
2. Backend retorna 401 Unauthorized
3. Frontend detecta 401
4. Logout automático
5. Redirige a /secure-admin-xyz789/login
```

---

## 🔐 Configuración de Seguridad

### Variables en `backend/app/config.py`

```python
class Settings(BaseSettings):
    # Admin Security
    ADMIN_ROUTE_PREFIX: str = "/secure-admin-xyz789"  # ⚠️ CAMBIAR EN PRODUCCIÓN
    ADMIN_SESSION_TIMEOUT: int = 30  # minutos
    ADMIN_MAX_LOGIN_ATTEMPTS: int = 5  # intentos antes de bloqueo
    ADMIN_LOCKOUT_DURATION: int = 15  # minutos de bloqueo
```

### ⚠️ **IMPORTANTE PARA PRODUCCIÓN**

1. **Cambiar la ruta oculta:**
   ```python
   ADMIN_ROUTE_PREFIX: str = "/admin-tu-codigo-secreto-aqui"
   ```

2. **Usar HTTPS obligatorio:**
   ```python
   # En main.py, agregar middleware
   app.add_middleware(HTTPSRedirectMiddleware)
   ```

3. **Agregar rate limiting:**
   ```python
   # Usar slowapi o similar
   from slowapi import Limiter
   
   limiter = Limiter(key_func=get_remote_address)
   
   @app.post("/secure-admin-xyz789/auth/login")
   @limiter.limit("5/minute")
   async def login(...):
       pass
   ```

4. **IP Whitelisting (opcional):**
   ```python
   ADMIN_ALLOWED_IPS = ["192.168.1.100", "203.0.113.45"]
   
   # En middleware
   if request.client.host not in ADMIN_ALLOWED_IPS:
       raise HTTPException(403)
   ```

---

## 🧪 Testing de Seguridad

### Test 1: Acceso sin token
```bash
curl -X GET http://localhost:8000/api/secure-admin-xyz789/reports/dashboard

# Esperado: 401 Unauthorized
```

### Test 2: Token inválido
```bash
curl -X GET http://localhost:8000/api/secure-admin-xyz789/reports/dashboard \
  -H "Authorization: Bearer token_invalido"

# Esperado: 401 Unauthorized
```

### Test 3: Token de guest en ruta admin
```bash
# Login como guest
curl -X POST http://localhost:8000/api/auth/guest/login \
  -d '{"email": "guest@test.com", "password": "123"}'

# Usar token de guest en ruta admin
curl -X GET http://localhost:8000/api/secure-admin-xyz789/reports/dashboard \
  -H "Authorization: Bearer {guest_token}"

# Esperado: 403 Forbidden
```

### Test 4: Token válido de admin
```bash
# Login como admin
curl -X POST http://localhost:8000/api/secure-admin-xyz789/auth/login \
  -d "username=admin&password=admin123"

# Usar token en ruta protegida
curl -X GET http://localhost:8000/api/secure-admin-xyz789/reports/dashboard \
  -H "Authorization: Bearer {admin_token}"

# Esperado: 200 OK + Datos del dashboard
```

---

## 📝 Checklist de Seguridad

- [x] Ruta oculta implementada
- [x] Middleware de verificación admin
- [x] ProtectedRoute con validación async
- [x] Interceptores de API configurados
- [x] Logout automático en errores 401
- [x] Redirecciones de rutas antiguas
- [ ] Rate limiting en login (pendiente)
- [ ] IP whitelisting (opcional)
- [ ] 2FA (mejora futura)
- [ ] Logging de intentos fallidos (mejora futura)

---

## 🎓 Mejoras Futuras Recomendadas

### 1. **Two-Factor Authentication (2FA)**
```python
import pyotp

secret = pyotp.random_base32()
totp = pyotp.TOTP(secret)
token = totp.now()  # Código de 6 dígitos
```

### 2. **Rate Limiting con slowapi**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(...):
    pass
```

### 3. **Logging de Seguridad**
```python
import logging

security_logger = logging.getLogger("security")

# En cada intento fallido
security_logger.warning(
    f"Failed login attempt for user {username} from IP {request.client.host}"
)
```

### 4. **CAPTCHA en Login**
```javascript
import ReCAPTCHA from "react-google-recaptcha";

<ReCAPTCHA
  sitekey="tu-site-key"
  onChange={handleCaptchaChange}
/>
```

---

## 📚 Referencias

- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Última actualización:** Octubre 29, 2025
**Versión:** 1.0.0
**Autor:** Sistema de Recepción Hotelera
