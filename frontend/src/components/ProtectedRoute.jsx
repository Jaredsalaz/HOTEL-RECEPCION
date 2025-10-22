import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * ProtectedRoute - Protege rutas que requieren autenticación
 * Redirige a /admin/login si no hay sesión activa
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
