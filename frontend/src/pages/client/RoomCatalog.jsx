import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiGrid, FiList } from 'react-icons/fi';
import RoomCard from '../../components/RoomCard';
import DateRangePicker from '../../components/common/DateRangePicker';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { roomService } from '../../services/roomService';
import toast from 'react-hot-toast';

/**
 * RoomCatalog Page - Catálogo de habitaciones con filtros
 */
const RoomCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid o list
  
  // Filtros
  const [checkIn, setCheckIn] = useState(
    searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')) : null
  );
  const [checkOut, setCheckOut] = useState(
    searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')) : null
  );
  const [roomType, setRoomType] = useState(searchParams.get('type') || '');
  const [amenities, setAmenities] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 9;

  useEffect(() => {
    fetchRooms();
  }, []); // Solo cargar al montar el componente

  // Efecto para recargar cuando cambien los filtros de fecha
  useEffect(() => {
    if (checkIn || checkOut || roomType) {
      fetchRooms();
    }
  }, [checkIn, checkOut, roomType]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      let data;
      
      console.log('Filtros al buscar:', { checkIn, checkOut, roomType });
      
      // Si hay fechas, buscar disponibles con filtros
      if (checkIn && checkOut) {
        data = await roomService.searchAvailableRooms(
          checkIn.toISOString().split('T')[0],
          checkOut.toISOString().split('T')[0],
          roomType || null,
          null // Ya no enviamos capacidad
        );
        console.log('Habitaciones con fechas:', data);
      } else {
        // Si no hay fechas, traer todas las disponibles (sin filtros de tipo/capacidad)
        data = await roomService.getRoomsByStatus('available');
        console.log('Habitaciones sin fechas:', data);
      }
      
      console.log('Total habitaciones recibidas:', data?.length || 0);
      setRooms(data || []);
    } catch (error) {
      console.error('Error al cargar habitaciones:', error);
      toast.error('Error al cargar habitaciones');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar rooms por búsqueda, tipo, comodidades y precio
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = !searchQuery || 
      room.room_number.toString().includes(searchQuery) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de tipo (solo si NO hay fechas, ya que con fechas el backend ya filtró)
    const matchesType = !roomType || checkIn !== null || 
      room.type.toLowerCase() === roomType.toLowerCase();
    
    // Filtro de comodidades (amenities es un array JSON)
    const matchesAmenities = !amenities || (
      Array.isArray(room.amenities) 
        ? room.amenities.some(amenity => 
            amenity.toLowerCase().includes(amenities.toLowerCase())
          )
        : false
    );
    
    const matchesPrice = !maxPrice || room.price_per_night <= Number(maxPrice);
    
    return matchesSearch && matchesType && matchesAmenities && matchesPrice;
  });

  console.log('Rooms:', rooms.length);
  console.log('Filtered Rooms:', filteredRooms.length);
  console.log('Filtros activos:', { searchQuery, roomType, amenities, maxPrice, checkIn: !!checkIn });

  // Paginación
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  const handleClearFilters = () => {
    setCheckIn(null);
    setCheckOut(null);
    setRoomType('');
    setAmenities('');
    setMaxPrice('');
    setSearchQuery('');
    setSearchParams({});
  };

  const handleApplyFilters = () => {
    const params = {};
    if (checkIn) params.checkIn = checkIn.toISOString().split('T')[0];
    if (checkOut) params.checkOut = checkOut.toISOString().split('T')[0];
    if (roomType) params.type = roomType;
    
    setSearchParams(params);
    fetchRooms();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Nuestras Habitaciones
          </h1>
          <p className="text-gray-600">
            Encuentra la habitación perfecta para tu estancia
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiFilter />
              Filtros
            </h2>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleClearFilters}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium"
            >
              Limpiar Filtros
            </Button>
          </div>

          {/* Search bar */}
          <div className="mb-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por número, tipo o descripción..."
            />
          </div>

          {/* Date range */}
          <div className="mb-4">
            <DateRangePicker
              startDate={checkIn}
              endDate={checkOut}
              onStartDateChange={setCheckIn}
              onEndDateChange={setCheckOut}
            />
          </div>

          {/* Filters grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Habitación
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                <option value="single">Individual (1 persona)</option>
                <option value="double">Doble (2 personas)</option>
                <option value="suite">Suite (4 personas)</option>
                <option value="deluxe">Deluxe (4 personas)</option>
              </select>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comodidades
              </label>
              <select
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Todas las comodidades</option>
                <option value="wifi">WiFi</option>
                <option value="tv">TV</option>
                <option value="aire acondicionado">Aire Acondicionado</option>
                <option value="minibar">Minibar</option>
                <option value="jacuzzi">Jacuzzi</option>
                <option value="vista">Vista al Mar/Ciudad</option>
                <option value="balcón">Balcón</option>
                <option value="caja fuerte">Caja Fuerte</option>
              </select>
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Máximo
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Sin límite"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Apply button */}
            <div className="flex items-end">
              <Button 
                onClick={handleApplyFilters} 
                className="w-full !bg-primary-600 !text-white hover:!bg-primary-700 font-semibold shadow-md"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {loading ? 'Cargando...' : `${filteredRooms.length} habitaciones encontradas`}
          </p>

          {/* View mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rooms grid/list */}
        {loading ? (
          <Loading text="Cargando habitaciones..." />
        ) : currentRooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">
              No se encontraron habitaciones con los filtros seleccionados
            </p>
            <Button 
              onClick={handleClearFilters} 
              className="mt-4 !bg-primary-600 !text-white hover:!bg-primary-700 font-semibold shadow-md"
            >
              Limpiar Filtros
            </Button>
          </div>
        ) : (
          <>
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }
            `}>
              {currentRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <RoomCard room={room} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RoomCatalog;
