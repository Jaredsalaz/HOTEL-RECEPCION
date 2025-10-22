import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FiHome, FiGrid, FiUser, FiLogOut, FiLogIn, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import AuthModal from './auth/AuthModal';

/**
 * Navbar Component - Barra de navegación para clientes
 */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  return (
    <nav className="bg-white shadow-md sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-lg">
              <FiHome className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-800">
              Hotel Reception
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Inicio
            </Link>
            <Link 
              to="/rooms" 
              className="text-gray-600 hover:text-primary transition-colors font-medium flex items-center gap-2"
            >
              <FiGrid className="w-4 h-4" />
              Habitaciones
            </Link>
            
            {/* Mis Reservaciones - Solo visible si está logeado */}
            {isAuthenticated && (
              <Link 
                to="/my-reservations" 
                className="text-gray-600 hover:text-primary transition-colors font-medium flex items-center gap-2"
              >
                <FiCalendar className="w-4 h-4" />
                Mis Reservaciones
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <FiUser className="w-4 h-4" />
                  {user.first_name}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-800">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/my-reservations"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FiCalendar className="w-4 h-4" />
                      Mis Reservaciones
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <FiLogIn className="w-4 h-4" />
                Iniciar Sesión
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </nav>
  );
};

export default Navbar;
