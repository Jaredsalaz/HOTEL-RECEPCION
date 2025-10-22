/**
 * Authentication Modal Component
 * Modal with tabs for Login and Registration
 */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiUserPlus } from 'react-icons/fi';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

/**
 * AuthModal Component
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Function to close the modal
 * @param {string} defaultTab - Default tab to show ('login' or 'register')
 * @param {Function} onSuccess - Callback after successful auth
 */
const AuthModal = ({ isOpen, onClose, defaultTab = 'login', onSuccess }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Reset tab when defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                      activeTab === 'login'
                        ? '!bg-primary-600 !text-white shadow-md'
                        : 'bg-gray-200 !text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    <FiUser className="w-4 h-4" />
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                      activeTab === 'register'
                        ? '!bg-primary-600 !text-white shadow-md'
                        : 'bg-gray-200 !text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    <FiUserPlus className="w-4 h-4" />
                    Registrarse
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'login' ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LoginForm 
                        onSuccess={(user) => {
                          if (onSuccess) onSuccess(user);
                          onClose();
                        }}
                        onSwitchToRegister={() => setActiveTab('register')}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <RegisterForm 
                        onSuccess={(user) => {
                          if (onSuccess) onSuccess(user);
                          onClose();
                        }}
                        onSwitchToLogin={() => setActiveTab('login')}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // Render modal in a portal to escape parent container constraints
  return createPortal(modalContent, document.body);
};

export default AuthModal;
