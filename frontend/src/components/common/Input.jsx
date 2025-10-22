import { forwardRef } from 'react';

/**
 * Input Component - Campo de entrada reutilizable
 * @param {string} label - Etiqueta del input
 * @param {string} error - Mensaje de error
 * @param {string} type - Tipo de input (text, email, password, etc.)
 * @param {string} placeholder - Placeholder
 * @param {boolean} required - Campo requerido
 * @param {string} icon - Icono (opcional)
 */
const Input = forwardRef(({ 
  label, 
  error, 
  type = 'text',
  placeholder,
  required = false,
  icon,
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input wrapper con icono opcional */}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-primary focus:border-transparent
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <svg 
            className="w-4 h-4" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
