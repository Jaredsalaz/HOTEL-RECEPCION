/**
 * Loading Component - Indicador de carga
 * @param {string} size - sm, md, lg, xl
 * @param {string} text - Texto a mostrar debajo del spinner
 * @param {boolean} fullScreen - Ocupa toda la pantalla
 */
const Loading = ({ 
  size = 'md', 
  text = 'Cargando...', 
  fullScreen = false 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinner animado */}
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      {/* Texto */}
      {text && (
        <p className="text-gray-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

/**
 * LoadingSkeleton - Esqueleto de carga para cards
 */
export const LoadingSkeleton = ({ count = 1 }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <div 
          key={index}
          className="bg-white rounded-lg shadow-md p-6 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
};

/**
 * LoadingDots - Animación de puntos
 */
export const LoadingDots = () => (
  <div className="flex items-center justify-center gap-2">
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

export default Loading;
