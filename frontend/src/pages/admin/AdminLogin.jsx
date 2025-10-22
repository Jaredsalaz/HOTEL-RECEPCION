import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiUser } from 'react-icons/fi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { authService } from '../../services/authService';
import { validatePassword } from '../../utils/validators';
import toast from 'react-hot-toast';

/**
 * AdminLogin Page - Página de inicio de sesión para administradores
 */
const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    const newErrors = {};
    
    if (!credentials.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    }
    
    const passwordValidation = validatePassword(credentials.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      await authService.login(credentials.username, credentials.password);
      
      toast.success('¡Bienvenido!');
      navigate('/admin');
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error(
        error.response?.data?.detail || 
        'Credenciales inválidas. Por favor verifica tus datos.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block bg-white p-4 rounded-full shadow-xl mb-4"
          >
            <FiLock className="w-12 h-12 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Panel de Administración
          </h1>
          <p className="text-white/80">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <Card.Body>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Usuario"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                error={errors.username}
                required
                autoFocus
                icon={<FiUser className="w-5 h-5 text-gray-400" />}
                placeholder="admin"
              />
              
              <Input
                label="Contraseña"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                error={errors.password}
                required
                icon={<FiLock className="w-5 h-5 text-gray-400" />}
                placeholder="••••••••"
              />
              
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
              >
                Iniciar Sesión
              </Button>
            </form>

            {/* Información de prueba (eliminar en producción) */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
              <p className="text-blue-800 font-semibold mb-1">
                🔐 Credenciales de prueba:
              </p>
              <p className="text-blue-700">
                Usuario: <code className="bg-blue-100 px-2 py-0.5 rounded">admin</code>
              </p>
              <p className="text-blue-700">
                Contraseña: <code className="bg-blue-100 px-2 py-0.5 rounded">admin123</code>
              </p>
            </div>
          </Card.Body>
        </Card>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white/80 hover:text-white transition-colors text-sm"
          >
            ← Volver al sitio principal
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
