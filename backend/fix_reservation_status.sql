-- ============================================================
-- FIX: Actualizar estados de reservaciones incorrectas
-- ============================================================
-- 
-- Problema 1: Reservaciones creadas con status='Active' 
-- cuando deberían ser 'Pending' hasta que el huésped haga check-in
--
-- Problema 2: Reservaciones 'Pending' cuya fecha de check-in ya pasó
-- deberían cancelarse automáticamente (No-Show)
--
-- Solución: 
-- 1. Cambiar a 'Pending' si no tienen actual_check_in
-- 2. Cancelar reservaciones Pending con fecha pasada (más de 24h)
-- ============================================================

-- ============================================================
-- PASO 1: Ver estado actual
-- ============================================================
SELECT 
    id,
    room_id,
    status,
    actual_check_in,
    actual_check_out,
    check_in_date,
    check_out_date,
    payment_status,
    CASE 
        WHEN status = 'Active' AND actual_check_in IS NULL THEN 'Debe ser Pending'
        WHEN status = 'Pending' AND check_in_date < NOW() - INTERVAL '24 hours' THEN 'Debe cancelarse (No-Show)'
        WHEN status = 'Active' AND check_out_date < NOW() THEN 'Debe completarse (Overdue)'
        ELSE 'OK'
    END as accion_requerida
FROM reservations
WHERE 
    (status = 'Active' AND actual_check_in IS NULL)
    OR (status = 'Pending' AND check_in_date < NOW() - INTERVAL '24 hours')
    OR (status = 'Active' AND check_out_date < NOW())
ORDER BY id;

-- ============================================================
-- PASO 2: Actualizar a Pending si no han hecho check-in real
-- ============================================================
UPDATE reservations
SET status = 'Pending'
WHERE status = 'Active' 
  AND actual_check_in IS NULL;

-- ============================================================
-- PASO 3: Cancelar reservaciones Pending con fecha pasada (No-Show)
-- ============================================================
UPDATE reservations
SET status = 'Cancelled'
WHERE status = 'Pending' 
  AND check_in_date < NOW() - INTERVAL '24 hours';

-- ============================================================
-- PASO 4: Completar reservaciones Active con check-out pasado
-- ============================================================
UPDATE reservations
SET 
    status = 'Completed',
    actual_check_out = NOW()
WHERE status = 'Active' 
  AND check_out_date < NOW();

-- ============================================================
-- PASO 5: Verificar el cambio
-- ============================================================
SELECT 
    id,
    room_id,
    status,
    actual_check_in,
    actual_check_out,
    check_in_date,
    check_out_date,
    payment_status
FROM reservations
ORDER BY id DESC;

-- ============================================================
-- RESULTADO ESPERADO:
-- ============================================================
-- Reservación #7: 
--   - Check-in: 24 oct 2025 (hace 5 días)
--   - Check-out: 26 oct 2025 (hace 3 días)
--   - Debería cambiar de 'Pending' → 'Cancelled' (No-Show)
--
-- Futuras reservaciones:
--   - Se crearán como 'Pending' ✅
--   - Cambiarán a 'Active' cuando recepcionista haga check-in ✅
--   - Se cancelarán automáticamente si fecha pasa sin check-in ✅
-- ============================================================
