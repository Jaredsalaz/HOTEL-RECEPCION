# 🏨 Flujo de Estados de Reservación - Sistema Hotelero

## 📊 Estados Disponibles

```
Pending    → Confirmada   → Active     → Completed
   ↓            ↓             ↓             ↓
Cancelled  Cancelled     Cancelled      ✅ Finalizada
```

---

## 🔄 Flujo Completo del Cliente

### **1. Cliente hace Reservación Online** 
**Página:** `/room/:id/checkin`

**Acción del cliente:**
- Selecciona fechas
- Completa formulario
- Paga con PayPal

**Estado en BD:**
```sql
status = 'Pending'
payment_status = 'Paid'
payment_method = 'PayPal'
actual_check_in = NULL
actual_check_out = NULL
```

**Lo que ve el cliente:**
- Email de confirmación
- En "Mis Reservaciones": Estado "Pendiente"

**Lo que ve el admin:**
- En panel admin: "Pendientes (3)"
- Puede ver detalles y preparar la habitación

---

### **2. Cliente Llega al Hotel (Check-in)**
**Página Admin:** `/secure-admin-xyz789/reservations`

**Acción del recepcionista:**
- Busca la reservación (por ID, nombre, o habitación)
- Clic en botón **"Check-in"**
- Confirma la acción

**Estado en BD:**
```sql
status = 'Active'
actual_check_in = CURRENT_TIMESTAMP
```

**Cambios automáticos:**
- Habitación cambia a `status = 'occupied'`
- Reservación aparece en "Activas"
- El cliente YA ESTÁ hospedado

---

### **2.1. ⚠️ Cliente NO Llega (No-Show)**
**Proceso automático** - Se ejecuta al cargar "Mis Reservaciones"

**Si pasaron más de 24 horas del check-in y está `Pending`:**

**Estado en BD:**
```sql
status = 'Cancelled'  -- Auto-cancelado por No-Show
```

**Lo que ve el cliente:**
- En "Mis Reservaciones": Estado "Cancelada"
- Ya no puede hacer check-in

**Lo que ve el admin:**
- Aparece en "Canceladas"
- Habitación se libera automáticamente

---

### **3. Cliente se Va del Hotel (Check-out)**
**Página Admin:** `/secure-admin-xyz789/reservations`

**Acción del recepcionista:**
- Busca la reservación activa
- Clic en botón **"Check-out"**
- Confirma la acción

**Estado en BD:**
```sql
status = 'Completed'
actual_check_out = CURRENT_TIMESTAMP
```

**Cambios automáticos:**
- Habitación vuelve a `status = 'available'`
- Reservación aparece en "Completadas"
- Liberación de la habitación para nuevas reservas

---

### **3.1. ⚠️ Cliente no hace Check-out a tiempo**
**Proceso automático** - Se ejecuta al cargar "Mis Reservaciones"

**Si pasó la fecha de check-out y está `Active`:**

**Estado en BD:**
```sql
status = 'Completed'
actual_check_out = CURRENT_TIMESTAMP  -- Auto-completado
```

**Cambios automáticos:**
- Habitación se libera: `status = 'available'`
- Reservación pasa a "Completadas"

---

## 🎯 Diferencias Clave

| Estado | `actual_check_in` | `actual_check_out` | Significado |
|--------|------------------|-------------------|-------------|
| **Pending** | `NULL` | `NULL` | Cliente pagó pero NO ha llegado |
| **Active** | `2025-10-22 08:00` | `NULL` | Cliente YA LLEGÓ y está hospedado |
| **Completed** | `2025-10-22 08:00` | `2025-10-25 12:00` | Cliente ya se fue |
| **Cancelled** | `NULL` | `NULL` | Reservación cancelada o No-Show |

### **⚡ Auto-Procesamiento de Estados:**

**Se ejecuta automáticamente cuando:**
- Cliente accede a "Mis Reservaciones"
- Admin accede a panel de reservaciones (futuro)

**Reglas:**
1. **No-Show:** `Pending` + check-in pasado > 24h → `Cancelled`
2. **Overdue:** `Active` + check-out pasado → `Completed` (auto check-out)

**Endpoint:** `POST /api/reservations/process-expired`

---

## 🔧 Problema Anterior vs Solución

### ❌ **Problema:**
```javascript
// CheckInFormEnhanced.jsx (ANTES)
status: 'Active'  // ❌ Incorrecto - cliente no ha llegado
```

### ✅ **Solución:**
```javascript
// CheckInFormEnhanced.jsx (AHORA)
status: 'Pending'  // ✅ Correcto - esperando llegada del cliente
```

---

## 🛠️ Para Tus Reservaciones Actuales

Ejecuta este SQL en tu base de datos para corregir los estados:

```sql
-- 1. Corregir Active → Pending (sin check-in real)
UPDATE reservations
SET status = 'Pending'
WHERE status = 'Active' 
  AND actual_check_in IS NULL;

-- 2. Cancelar Pending con fecha pasada (No-Show)
UPDATE reservations
SET status = 'Cancelled'
WHERE status = 'Pending' 
  AND check_in_date < NOW() - INTERVAL '24 hours';

-- 3. Completar Active con check-out pasado (Overdue)
UPDATE reservations
SET 
    status = 'Completed',
    actual_check_out = NOW()
WHERE status = 'Active' 
  AND check_out_date < NOW();
```

**Resultado esperado para tu reservación #7:**
- Check-in: 24 oct (hace 5 días)
- Check-out: 26 oct (hace 3 días)
- Estado actual: `Pending`
- **Nuevo estado:** `Cancelled` (No-Show)

---

## 📱 Portal del Cliente (Futuro)

Si quieres que el **cliente pueda hacer auto-check-in**, puedes agregar:

### **Opción A: Auto Check-in con QR**
1. Cliente recibe QR en email
2. Escanea QR en recepción
3. Sistema hace check-in automático

### **Opción B: Check-in desde "Mis Reservaciones"**
1. Cliente va a `/my-reservations`
2. Ve botón "Hacer Check-in" si es el día de llegada
3. Clic confirma su llegada
4. Sistema actualiza a `Active`

**Código ejemplo:**
```javascript
// En MisReservaciones.jsx
const handleSelfCheckIn = async (reservationId) => {
  try {
    await checkinService.checkIn({ reservation_id: reservationId });
    toast.success('Check-in realizado exitosamente');
    fetchReservations();
  } catch (error) {
    toast.error('Error al hacer check-in');
  }
};
```

---

## 🎨 UI del Admin Panel

### **Filtros de Estado:**
- **Todas** - Muestra todo
- **Pendientes** - `status = 'Pending'` (clientes que pagaron pero no han llegado)
- **Activas** - `status = 'Active'` (clientes hospedados actualmente)
- **Completadas** - `status = 'Completed'` (check-out realizado)
- **Canceladas** - `status = 'Cancelled'`

### **Botones por Estado:**
| Estado Actual | Botones Disponibles |
|--------------|---------------------|
| Pending | **Check-in**, Cancelar |
| Active | **Check-out** |
| Completed | Ver detalles |

---

## 📝 Resumen

✅ **Cliente hace reservación** → `Pending`  
✅ **Recepcionista hace check-in** → `Active`  
✅ **Recepcionista hace check-out** → `Completed`  

**La lógica actual es CORRECTA, solo necesitas:**
1. Ejecutar el SQL para corregir las 3 reservaciones
2. Las nuevas reservaciones ya se crearán como `Pending` ✅
