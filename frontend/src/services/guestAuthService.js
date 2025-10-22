/**
 * Guest Authentication Service
 * Handles all authentication-related API calls for guests
 */
import api from './api';

const TOKEN_KEY = 'guest_token';
const USER_KEY = 'guest_user';

/**
 * Register a new guest
 * @param {Object} guestData - Guest registration data
 * @returns {Promise<Object>} Token and user data
 */
export const register = async (guestData) => {
  const response = await api.post('/auth/guest/register', guestData);
  
  // Store token and user data
  if (response.data.access_token) {
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
  }
  
  return response.data;
};

/**
 * Login an existing guest
 * @param {string} email - Guest email
 * @param {string} password - Guest password
 * @returns {Promise<Object>} Token and user data
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/guest/login', { email, password });
  
  // Store token and user data
  if (response.data.access_token) {
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
  }
  
  return response.data;
};

/**
 * Logout current guest
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Get current authenticated guest
 * @returns {Promise<Object>} Current guest data
 */
export const getCurrentGuest = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const response = await api.get('/auth/guest/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  // Update stored user data
  localStorage.setItem(USER_KEY, JSON.stringify(response.data));
  
  return response.data;
};

/**
 * Get stored guest token
 * @returns {string|null} JWT token or null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get stored guest user data
 * @returns {Object|null} User object or null
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing stored user:', error);
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

/**
 * Check if guest is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

const guestAuthService = {
  register,
  login,
  logout,
  getCurrentGuest,
  getToken,
  getStoredUser,
  isAuthenticated
};

export default guestAuthService;
