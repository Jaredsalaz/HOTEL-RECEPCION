import { motion } from 'framer-motion';

/**
 * Card Component - Tarjeta reutilizable para contenido
 * @param {node} children - Contenido de la tarjeta
 * @param {string} className - Clases CSS adicionales
 * @param {boolean} hover - Activa efecto hover
 * @param {function} onClick - Función al hacer click (hace la card clickeable)
 */
const Card = ({ 
  children, 
  className = '', 
  hover = false,
  onClick,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-md overflow-hidden';
  const hoverClasses = hover ? 'transition-all duration-300 hover:shadow-xl cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const CardComponent = onClick || hover ? motion.div : 'div';
  const motionProps = (onClick || hover) ? {
    whileHover: { y: -5, scale: 1.02 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <CardComponent
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

/**
 * Card.Header - Encabezado de la tarjeta
 */
Card.Header = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

/**
 * Card.Body - Cuerpo de la tarjeta
 */
Card.Body = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

/**
 * Card.Footer - Pie de la tarjeta
 */
Card.Footer = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

export default Card;
