/**
 * Validators - Funciones de validación de datos
 */

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida un teléfono (formato mexicano o internacional)
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} - true si es válido
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  
  // Elimina caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Acepta 10 dígitos (México) o más para internacional
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Valida un password (mínimo 6 caracteres)
 * @param {string} password - Password a validar
 * @returns {object} - { valid, message }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'La contraseña es requerida' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
  }
  
  if (password.length > 50) {
    return { valid: false, message: 'La contraseña es muy larga' };
  }
  
  // Opcional: Validar que tenga letras y números
  // const hasLetter = /[a-zA-Z]/.test(password);
  // const hasNumber = /[0-9]/.test(password);
  // if (!hasLetter || !hasNumber) {
  //   return { valid: false, message: 'La contraseña debe contener letras y números' };
  // }
  
  return { valid: true, message: 'Contraseña válida' };
};

/**
 * Valida que una fecha no sea pasada
 * @param {Date|string} date - Fecha a validar
 * @returns {boolean} - true si es válida (futura o hoy)
 */
export const isValidFutureDate = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return dateObj >= today;
};

/**
 * Valida que el check-out sea después del check-in
 * @param {Date|string} checkIn - Fecha de entrada
 * @param {Date|string} checkOut - Fecha de salida
 * @returns {boolean} - true si es válido
 */
export const isValidDateRange = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return false;
  
  const start = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  
  return end > start;
};

/**
 * Valida un número de documento (DNI, Pasaporte, etc)
 * @param {string} document - Documento a validar
 * @returns {boolean} - true si es válido
 */
export const isValidDocument = (document) => {
  if (!document) return false;
  
  // Mínimo 5 caracteres, alfanumérico
  const cleaned = document.trim();
  return cleaned.length >= 5 && cleaned.length <= 20;
};

/**
 * Valida un número de habitación
 * @param {string|number} roomNumber - Número de habitación
 * @returns {boolean} - true si es válido
 */
export const isValidRoomNumber = (roomNumber) => {
  if (!roomNumber) return false;
  
  const num = String(roomNumber);
  return num.length >= 1 && num.length <= 10 && /^[0-9A-Za-z-]+$/.test(num);
};

/**
 * Valida un precio
 * @param {number} price - Precio a validar
 * @returns {boolean} - true si es válido
 */
export const isValidPrice = (price) => {
  if (price === null || price === undefined) return false;
  
  const num = Number(price);
  return !isNaN(num) && num >= 0 && num <= 999999;
};

/**
 * Valida una capacidad de habitación
 * @param {number} capacity - Capacidad a validar
 * @returns {boolean} - true si es válida
 */
export const isValidCapacity = (capacity) => {
  if (capacity === null || capacity === undefined) return false;
  
  const num = Number(capacity);
  return !isNaN(num) && num >= 1 && num <= 20 && Number.isInteger(num);
};

/**
 * Valida un nombre
 * @param {string} name - Nombre a validar
 * @returns {boolean} - true si es válido
 */
export const isValidName = (name) => {
  if (!name) return false;
  
  const cleaned = name.trim();
  return cleaned.length >= 2 && cleaned.length <= 50 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(cleaned);
};

/**
 * Valida un formulario de huésped
 * @param {object} data - Datos del huésped
 * @returns {object} - { valid, errors }
 */
export const validateGuestForm = (data) => {
  const errors = {};
  
  if (!isValidName(data.first_name)) {
    errors.first_name = 'Nombre inválido';
  }
  
  if (!isValidName(data.last_name)) {
    errors.last_name = 'Apellido inválido';
  }
  
  if (!isValidEmail(data.email)) {
    errors.email = 'Email inválido';
  }
  
  if (!isValidPhone(data.phone)) {
    errors.phone = 'Teléfono inválido';
  }
  
  if (!isValidDocument(data.id_document)) {
    errors.id_document = 'Documento inválido';
  }
  
  if (!data.nationality || data.nationality.length < 2) {
    errors.nationality = 'Nacionalidad requerida';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida un formulario de reservación
 * @param {object} data - Datos de la reservación
 * @returns {object} - { valid, errors }
 */
export const validateReservationForm = (data) => {
  const errors = {};
  
  if (!data.room_id) {
    errors.room_id = 'Habitación requerida';
  }
  
  if (!isValidFutureDate(data.check_in_date)) {
    errors.check_in_date = 'Fecha de entrada inválida';
  }
  
  if (!isValidFutureDate(data.check_out_date)) {
    errors.check_out_date = 'Fecha de salida inválida';
  }
  
  if (!isValidDateRange(data.check_in_date, data.check_out_date)) {
    errors.date_range = 'El check-out debe ser después del check-in';
  }
  
  if (!data.guests_count || data.guests_count < 1) {
    errors.guests_count = 'Número de huéspedes inválido';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida campos requeridos
 * @param {object} data - Objeto con datos
 * @param {array} requiredFields - Array con nombres de campos requeridos
 * @returns {object} - { valid, errors }
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = `${field} es requerido`;
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitiza un string (elimina caracteres peligrosos)
 * @param {string} str - String a sanitizar
 * @returns {string} - String sanitizado
 */
export const sanitizeString = (str) => {
  if (!str) return '';
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Elimina < y >
    .substring(0, 500); // Limita longitud
};

/**
 * Valida una URL
 * @param {string} url - URL a validar
 * @returns {boolean} - true si es válida
 */
export const isValidURL = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};
