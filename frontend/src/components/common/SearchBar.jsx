import { FiSearch } from 'react-icons/fi';

/**
 * SearchBar Component - Barra de búsqueda reutilizable
 * @param {string} value - Valor del input
 * @param {function} onChange - Callback al cambiar
 * @param {string} placeholder - Placeholder
 * @param {function} onSearch - Callback al hacer búsqueda (Enter o botón)
 */
const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'Buscar...', 
  onSearch,
  className = ''
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
      />
      
      <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      
      {onSearch && (
        <button
          onClick={() => onSearch(value)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white px-4 py-1.5 rounded-md hover:bg-primary-700 transition-colors"
        >
          Buscar
        </button>
      )}
    </div>
  );
};

export default SearchBar;
