import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to admin login if we're already in an admin route
    // and the token is invalid (not for login failures)
    if (error.response?.status === 401 && 
        window.location.pathname.startsWith('/secure-admin-xyz789') &&
        window.location.pathname !== '/secure-admin-xyz789/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('guest_token');
      window.location.href = '/secure-admin-xyz789/login';
    }
    return Promise.reject(error);
  }
);

export default api;
