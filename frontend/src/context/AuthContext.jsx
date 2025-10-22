/**
 * Authentication Context
 * Provides authentication state and methods to all components
 */
import { createContext, useContext, useState, useEffect } from 'react';
import guestAuthService from '../services/guestAuthService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

/**
 * Hook to use authentication context
 * @returns {Object} Authentication state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * Wraps the app to provide authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = guestAuthService.getToken();
        const storedUser = guestAuthService.getStoredUser();
        
        if (token && storedUser) {
          // Verify token is still valid by fetching current user
          try {
            const currentUser = await guestAuthService.getCurrentGuest();
            setUser(currentUser);
            setIsAuthenticated(true);
          } catch (error) {
            // Token is invalid, clear storage
            guestAuthService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Register a new guest
   * @param {Object} guestData - Registration data
   */
  const register = async (guestData) => {
    try {
      const response = await guestAuthService.register(guestData);
      
      // Validate response structure
      if (!response || !response.user) {
        throw new Error('Respuesta inválida del servidor');
      }
      
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('¡Registro exitoso! Bienvenido.');
      return response;
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Error al registrarse. Por favor intente de nuevo.';
      toast.error(message);
      throw error;
    }
  };

  /**
   * Login an existing guest
   * @param {string} email - Guest email
   * @param {string} password - Guest password
   */
  const login = async (email, password) => {
    try {
      const response = await guestAuthService.login(email, password);
      
      // Debug log
      console.log('Login response:', response);
      
      // Validate response structure
      if (!response || !response.user) {
        console.error('Invalid response structure:', response);
        throw new Error('Respuesta inválida del servidor');
      }
      
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success(`¡Bienvenido de nuevo, ${response.user.first_name}!`);
      return response;
    } catch (error) {
      console.error('Login error details:', error);
      const message = error.response?.data?.detail || error.message || 'Credenciales inválidas. Por favor intente de nuevo.';
      toast.error(message);
      throw error;
    }
  };

  /**
   * Logout current guest
   */
  const logout = () => {
    guestAuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Sesión cerrada correctamente.');
  };

  /**
   * Refresh current guest data
   */
  const refreshUser = async () => {
    try {
      const currentUser = await guestAuthService.getCurrentGuest();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, logout the user
      logout();
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    register,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
