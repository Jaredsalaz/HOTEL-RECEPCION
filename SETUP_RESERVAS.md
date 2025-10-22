# Sistema de Reservas con PayPal y Email - Configuración

## 🎉 Características Implementadas

### ✅ Sistema de Autenticación
- Registro de usuarios (guests) con validación
- Login con JWT tokens
- Protección de rutas de reserva
- Menú de usuario en Navbar

### ✅ Validación de Disponibilidad
- Endpoint `/reservations/check-availability`
- Verifica fechas disponibles
- Valida capacidad de habitación
- Previene reservas duplicadas

### ✅ Sistema de Pagos PayPal
- Integración con PayPal SDK
- Proceso de pago seguro
- Soporte para tarjetas de crédito/débito
- Confirmación automática de pago

### ✅ Sistema de Emails
- Envío automático de confirmación
- Template HTML profesional
- Incluye todos los detalles de reserva
- Soporte para cancelaciones

---

## 🚀 Configuración Requerida

### 1. Backend - Configurar SMTP (Email)

Edita el archivo `backend/.env` y configura tu servidor SMTP:

#### Opción A: Gmail (Recomendado para pruebas)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_FROM=noreply@hotelrecepcion.com
```

**⚠️ Importante para Gmail:**
1. Ve a tu cuenta de Google → Seguridad
2. Activa "Verificación en 2 pasos"
3. Genera una "Contraseña de aplicación"
4. Usa esa contraseña en `SMTP_PASSWORD`

#### Opción B: Otros proveedores

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=tu-api-key
```

### 2. Backend - Instalar Dependencias

```bash
cd backend
pip install fastapi-mail paypalrestsdk
```

### 3. Frontend - Configurar PayPal

#### Paso 1: Obtener credenciales de PayPal

1. Ve a https://developer.paypal.com/dashboard/
2. Inicia sesión con tu cuenta de PayPal
3. Ve a "My Apps & Credentials"
4. En "Sandbox", busca tu "Default Application"
5. Copia el "Client ID"

#### Paso 2: Configurar en el frontend

Crea un archivo `frontend/.env` (copiando de `.env.example`):

```env
VITE_API_URL=http://localhost:8001/api
VITE_PAYPAL_CLIENT_ID=tu-client-id-aqui
```

**Ejemplo de Client ID de Sandbox:**
```
AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R
```

### 4. Frontend - Instalar Dependencias

```bash
cd frontend
npm install @paypal/react-paypal-js
```

---

## 🧪 Probar el Sistema

### 1. Iniciar Backend
```bash
cd backend
python -m uvicorn main:app --reload --port 8001
```

### 2. Iniciar Frontend
```bash
cd frontend
npm run dev
```

### 3. Flujo de Prueba

1. **Registrar Usuario**
   - Ir a http://localhost:5173
   - Click en "Reservar Ahora" en cualquier habitación
   - Registrarse con email válido

2. **Reservar Habitación**
   - Seleccionar fechas (entrada/salida)
   - Seleccionar número de huéspedes
   - Click en "Verificar Disponibilidad"

3. **Procesar Pago**
   - En el sandbox de PayPal, usar credenciales de prueba:
     - Email: `sb-buyer@personal.example.com`
     - Password: `test1234`
   - O usar tarjetas de prueba de PayPal

4. **Verificar Email**
   - Revisar el email de confirmación en la bandeja del usuario
   - Verificar que contenga todos los detalles de la reserva

---

## 🔍 Credenciales de Prueba PayPal

### Comprador de Prueba (Sandbox)
PayPal proporciona cuentas de prueba automáticamente. Para crear más:

1. Ve a https://developer.paypal.com/dashboard/
2. Click en "Sandbox" → "Accounts"
3. Usa las credenciales de "Personal (buyer)" account

### Tarjetas de Prueba

| Tarjeta | Número | CVV | Fecha |
|---------|--------|-----|-------|
| Visa | 4032035527269824 | 123 | 12/2025 |
| Mastercard | 5425230000004415 | 123 | 12/2025 |

---

## 📊 Endpoints Nuevos

### Backend

#### 1. Verificar Disponibilidad
```http
POST /api/reservations/check-availability
Params:
  - room_id: int
  - check_in: date (YYYY-MM-DD)
  - check_out: date (YYYY-MM-DD)
  - guests_count: int

Response:
{
  "available": true,
  "message": "La habitación está disponible",
  "room_id": 1,
  "room_number": "101",
  "price_per_night": 900.0,
  "total_nights": 3,
  "total_price": 2700.0
}
```

#### 2. Enviar Confirmación por Email
```http
POST /api/reservations/{reservation_id}/send-confirmation

Response:
{
  "success": true,
  "message": "Email de confirmación enviado exitosamente",
  "email": "usuario@example.com"
}
```

---

## 🐛 Solución de Problemas

### Error: "Import 'fastapi_mail' could not be resolved"
```bash
pip install fastapi-mail
```

### Error: "PayPal Client ID not found"
Verifica que el archivo `frontend/.env` existe y contiene:
```env
VITE_PAYPAL_CLIENT_ID=tu-client-id
```

### Error: "Error al enviar email"
1. Verifica las credenciales SMTP en `backend/.env`
2. Si usas Gmail, asegúrate de usar "App Password"
3. Revisa los logs del backend para más detalles

### Email no llega
1. Revisa la carpeta de SPAM
2. Verifica que el email del usuario sea válido
3. Comprueba la configuración SMTP

---

## 📝 Estructura de Archivos Nuevos

### Backend
```
backend/
├── app/
│   ├── controllers/
│   │   ├── guest_auth_controller.py (nuevo)
│   │   └── reservation_controller.py (actualizado)
│   ├── services/
│   │   ├── guest_auth_service.py (nuevo)
│   │   └── email_service.py (nuevo)
│   └── models/
│       └── models.py (actualizado - password_hash)
└── .env (actualizar con SMTP y PayPal)
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthModal.jsx (nuevo)
│   │   │   ├── LoginForm.jsx (nuevo)
│   │   │   └── RegisterForm.jsx (nuevo)
│   │   ├── PayPalButton.jsx (nuevo)
│   │   └── Navbar.jsx (actualizado)
│   ├── context/
│   │   └── AuthContext.jsx (nuevo)
│   ├── services/
│   │   └── guestAuthService.js (nuevo)
│   ├── pages/
│   │   └── client/
│   │       └── CheckInFormEnhanced.jsx (nuevo)
│   └── App.jsx (actualizado)
└── .env (crear con VITE_PAYPAL_CLIENT_ID)
```

---

## ✨ Siguiente Paso: Testing

Ejecuta el flujo completo para verificar:
- ✅ Autenticación funciona
- ✅ Validación de disponibilidad previene conflictos
- ✅ PayPal procesa pagos correctamente
- ✅ Emails se envían automáticamente
- ✅ Reserva se guarda en la base de datos

---

## 🎯 Flujo Completo Implementado

```
Usuario → Selecciona Habitación 
       → Click "Reservar Ahora"
       → [Si no está autenticado] Registro/Login
       → Selecciona fechas y huéspedes
       → Click "Verificar Disponibilidad"
       → [Backend] Valida disponibilidad
       → [Frontend] Muestra opción de pago PayPal
       → Usuario completa pago
       → [Backend] Crea reserva con status "Confirmed"
       → [Backend] Envía email de confirmación
       → [Frontend] Muestra página de confirmación
       → Usuario recibe email con detalles
```

---

¡Todo listo! 🎉 Ahora puedes probar el sistema completo de reservas.
