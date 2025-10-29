import api from './api';

const ADMIN_PREFIX = '/secure-admin-xyz789';

export const authService = {
  // Login
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post(`${ADMIN_PREFIX}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }

    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },

  // Get current admin
  getCurrentAdmin: async () => {
    const response = await api.get(`${ADMIN_PREFIX}/auth/me`);
    return response.data;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;
