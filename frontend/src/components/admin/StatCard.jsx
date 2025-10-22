import { motion } from 'framer-motion';

/**
 * StatCard Component - Tarjeta de estadística para dashboard
 * @param {string} title - Título de la estadística
 * @param {string|number} value - Valor a mostrar
 * @param {node} icon - Icono a mostrar
 * @param {string} color - Color del tema (blue, green, red, yellow, purple)
 * @param {string} trend - Tendencia (opcional)
 */
const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  trend,
  subtitle
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500'
  };

  const bgColor = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between">
        {/* Contenido */}
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">
            {value}
          </h3>
          {subtitle && (
            <p className="text-gray-500 text-xs">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${
                trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend}
              </span>
              <span className="text-gray-500 text-xs">vs mes anterior</span>
            </div>
          )}
        </div>

        {/* Icono */}
        <div className={`${bgColor} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
