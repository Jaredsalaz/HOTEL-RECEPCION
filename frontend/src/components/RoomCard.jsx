import { motion } from 'framer-motion';
import { FiUsers, FiWifi, FiSquare, FiCalendar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import AuthModal from './auth/AuthModal';

/**
 * RoomCard Component - Tarjeta de habitación para catálogo
 * @param {object} room - Objeto de habitación con todos los datos
 */
const RoomCard = ({ room }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Iconos para amenidades
  const amenityIcons = {
    wifi: <FiWifi className="w-4 h-4" />,
    tv: <span className="text-sm">📺</span>,
    ac: <span className="text-sm">❄️</span>,
    minibar: <span className="text-sm">🍹</span>
  };

  // Badges de estado
  const statusBadges = {
    Available: { text: 'Disponible', color: 'bg-green-100 text-green-800' },
    Occupied: { text: 'Ocupada', color: 'bg-red-100 text-red-800' },
    Maintenance: { text: 'Mantenimiento', color: 'bg-yellow-100 text-yellow-800' }
  };

  const status = statusBadges[room.status] || statusBadges.Available;
  const isAvailable = room.status === 'Available';

  /**
   * Handle reservation button click
   */
  const handleReservationClick = (e) => {
    e.stopPropagation();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store intended destination
      localStorage.setItem('intended_destination', `/checkin/${room.id}`);
      // Show auth modal
      setShowAuthModal(true);
    } else {
      // Navigate to check-in directly
      navigate(`/checkin/${room.id}`);
    }
  };

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = () => {
    // Get intended destination and navigate
    const intendedDestination = localStorage.getItem('intended_destination');
    if (intendedDestination) {
      localStorage.removeItem('intended_destination');
      navigate(intendedDestination);
    } else {
      navigate(`/checkin/${room.id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/rooms/${room.id}`)}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
    >
      {/* Imagen de la habitación */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={room.image_url || 'https://via.placeholder.com/400x300?text=Room'}
          alt={`Habitación ${room.room_number}`}
          className="w-full h-full object-cover"
        />
        
        {/* Badge de estado */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
            {status.text}
          </span>
        </div>

        {/* Número de habitación */}
        <div className="absolute bottom-3 left-3 bg-white px-3 py-1 rounded-lg shadow-md">
          <span className="font-bold text-gray-800">#{room.room_number}</span>
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-5">
        {/* Tipo de habitación */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 capitalize">
          {room.type.replace('_', ' ')}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {room.description || 'Habitación cómoda y acogedora'}
        </p>

        {/* Información rápida */}
        <div className="flex items-center gap-4 mb-4 text-gray-600">
          <div className="flex items-center gap-1">
            <FiUsers className="w-4 h-4" />
            <span className="text-sm">{room.capacity} personas</span>
          </div>
          <div className="flex items-center gap-1">
            <FiSquare className="w-4 h-4" />
            <span className="text-sm">Piso {room.floor}</span>
          </div>
        </div>

        {/* Amenidades */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {room.amenities.slice(0, 4).map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-700"
              >
                {amenityIcons[amenity.toLowerCase()] || '•'}
                <span className="capitalize">{amenity}</span>
              </div>
            ))}
            {room.amenities.length > 4 && (
              <div className="bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-700">
                +{room.amenities.length - 4} más
              </div>
            )}
          </div>
        )}

        {/* Precio y botones */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(room.price_per_night)}
              </span>
              <span className="text-sm text-gray-500 ml-2">/ noche</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/rooms/${room.id}`);
              }}
            >
              Ver Detalles
            </button>
            
            {isAvailable && (
              <button 
                className="flex-1 !bg-primary-600 !text-white px-4 py-2 rounded-lg hover:!bg-primary-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2 shadow-md"
                onClick={handleReservationClick}
              >
                <FiCalendar className="w-4 h-4" />
                Reservar Ahora
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </motion.div>
  );
};

export default RoomCard;
