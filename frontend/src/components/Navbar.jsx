import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);
  
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
              Hotel 4Vagos
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
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <FiUser className="w-4 h-4" />
                  {user.first_name}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
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
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 overflow-hidden"
            >
              <div className="flex flex-col gap-2 py-4">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-primary hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Inicio
              </Link>
              <Link 
                to="/rooms" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-primary hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <FiGrid className="w-4 h-4" />
                Habitaciones
              </Link>
              
              {/* Mis Reservaciones - Mobile */}
              {isAuthenticated && (
                <Link 
                  to="/my-reservations" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-600 hover:text-primary hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <FiCalendar className="w-4 h-4" />
                  Mis Reservaciones
                </Link>
              )}

              {/* User Info - Mobile */}
              {isAuthenticated && user ? (
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-800">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mx-4"
                >
                  <FiLogIn className="w-4 h-4" />
                  Iniciar Sesión
                </button>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
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
