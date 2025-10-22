-- Agregar columnas de pago a la tabla reservations
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'Cash',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Pending';

-- Actualizar registros existentes
UPDATE reservations 
SET payment_method = 'Cash', payment_status = 'Pending'
WHERE payment_method IS NULL OR payment_status IS NULL;
