import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiGrid, 
  FiCalendar, 
  FiFileText,
  FiSettings 
} from 'react-icons/fi';
import { motion } from 'framer-motion';

/**
 * AdminSidebar Component - Barra lateral del panel admin
 * @param {boolean} isOpen - Estado del sidebar (abierto/cerrado)
 */
const AdminSidebar = ({ isOpen }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin',
      icon: <FiHome className="w-5 h-5" />,
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/admin/rooms',
      icon: <FiGrid className="w-5 h-5" />,
      label: 'Habitaciones'
    },
    {
      path: '/admin/reservations',
      icon: <FiCalendar className="w-5 h-5" />,
      label: 'Reservaciones'
    },
    {
      path: '/admin/reports',
      icon: <FiFileText className="w-5 h-5" />,
      label: 'Reportes'
    }
  ];

  const isActiveRoute = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: isOpen ? 0 : -250 }}
      transition={{ duration: 0.3 }}
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-800 text-white shadow-xl z-20 overflow-y-auto`}
    >
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = isActiveRoute(item.path, item.exact);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <div className="text-center text-gray-400 text-sm">
          <p>Hotel Reception</p>
          <p className="text-xs mt-1">v1.0.0</p>
        </div>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
