import { FiMenu, FiLogOut, FiUser } from 'react-icons/fi';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * AdminNavbar Component - Barra de navegación del panel admin
 * @param {function} toggleSidebar - Función para abrir/cerrar sidebar
 */
const AdminNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    // Obtener información del admin actual
    const fetchAdminInfo = async () => {
      try {
        const adminData = await authService.getCurrentAdmin();
        setAdmin(adminData);
      } catch (error) {
        console.error('Error al obtener info del admin:', error);
      }
    };

    fetchAdminInfo();
  }, []);

  const handleLogout = () => {
    authService.logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/secure-admin-xyz789/login');
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-30 h-16">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiMenu className="w-6 h-6 text-gray-600" />
          </button>

          <h1 className="text-xl font-bold text-gray-800">
            Panel de Administración
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Admin info */}
          {admin && (
            <div className="flex items-center gap-2 text-gray-600">
              <FiUser className="w-5 h-5" />
              <span className="font-medium hidden sm:block">
                {admin.full_name || admin.username}
              </span>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="hidden sm:block">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
