import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useState, useEffect } from 'react';

/**
 * ProtectedRoute - Protege rutas que requieren autenticación de administrador
 * Redirige a login si no hay sesión activa o si el token es inválido
 */
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      const authenticated = authService.isAuthenticated();
      
      if (!authenticated) {
        setIsValid(false);
        setLoading(false);
        return;
      }

      try {
        // Intentar obtener datos del admin para validar token
        await authService.getCurrentAdmin();
        setIsValid(true);
      } catch (error) {
        console.error('Token inválido:', error);
        authService.logout();
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/secure-admin-xyz789/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
