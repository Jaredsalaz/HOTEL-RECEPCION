/**
 * Formatters - Funciones de formateo de datos
 */

/**
 * Formatea un número como moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (default: MXN)
 * @returns {string} - Cantidad formateada
 */
export const formatCurrency = (amount, currency = 'MXN') => {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Formatea una fecha
 * @param {string|Date} date - Fecha a formatear
 * @param {string} format - Formato (short, long, full)
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const formats = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }
  };
  
  return new Intl.DateTimeFormat('es-MX', formats[format]).format(dateObj);
};

/**
 * Formatea una fecha y hora
 * @param {string|Date} datetime - Fecha y hora a formatear
 * @returns {string} - Fecha y hora formateada
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '';
  
  const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime;
  
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

/**
 * Formatea un número de teléfono
 * @param {string} phone - Número a formatear
 * @returns {string} - Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Elimina todo excepto números
  const cleaned = ('' + phone).replace(/\D/g, '');
  
  // Formatea (XXX) XXX-XXXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  
  return phone;
};

/**
 * Formatea un email (oculta parte del email)
 * @param {string} email - Email a formatear
 * @returns {string} - Email parcialmente oculto
 */
export const formatEmailPrivate = (email) => {
  if (!email) return '';
  
  const [name, domain] = email.split('@');
  
  if (name.length <= 3) {
    return email;
  }
  
  const visibleChars = 2;
  const hidden = '*'.repeat(name.length - visibleChars);
  
  return name.substring(0, visibleChars) + hidden + '@' + domain;
};

/**
 * Formatea el tipo de habitación
 * @param {string} type - Tipo de habitación
 * @returns {string} - Tipo formateado
 */
export const formatRoomType = (type) => {
  const types = {
    single: 'Individual',
    double: 'Doble',
    suite: 'Suite',
    deluxe: 'Deluxe',
    presidential: 'Presidencial'
  };
  
  return types[type] || type;
};

/**
 * Formatea el estado de habitación
 * @param {string} status - Estado
 * @returns {string} - Estado formateado
 */
export const formatRoomStatus = (status) => {
  const statuses = {
    available: 'Disponible',
    occupied: 'Ocupada',
    cleaning: 'Limpieza',
    maintenance: 'Mantenimiento'
  };
  
  return statuses[status] || status;
};

/**
 * Formatea el estado de reservación
 * @param {string} status - Estado
 * @returns {string} - Estado formateado
 */
export const formatReservationStatus = (status) => {
  const statuses = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    active: 'Activa',
    completed: 'Completada',
    cancelled: 'Cancelada'
  };
  
  return statuses[status] || status;
};

/**
 * Calcula la cantidad de noches entre dos fechas
 * @param {string|Date} checkIn - Fecha de entrada
 * @param {string|Date} checkOut - Fecha de salida
 * @returns {number} - Número de noches
 */
export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  
  const start = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Decimales a mostrar
 * @returns {string} - Porcentaje formateado
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} str - String a capitalizar
 * @returns {string} - String capitalizado
 */
export const capitalize = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Trunca un texto a cierta longitud
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto truncado
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};
