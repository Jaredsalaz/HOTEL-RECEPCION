import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiSquare, FiWifi, FiDollarSign, 
  FiChevronLeft, FiChevronRight, FiMapPin, FiCalendar 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import AuthModal from '../../components/auth/AuthModal';
import { roomService } from '../../services/roomService';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * RoomDetail Page - Detalles de una habitación específica
 */
const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchRoomDetails();
  }, [id]);

  const fetchRoomDetails = async () => {
    setLoading(true);
    try {
      const data = await roomService.getRoomById(id);
      setRoom(data);
    } catch (error) {
      console.error('Error al cargar habitación:', error);
      toast.error('Error al cargar los detalles de la habitación');
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Cargando detalles..." />;
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Habitación no encontrada
          </h2>
          <Button onClick={() => navigate('/rooms')}>
            Volver al Catálogo
          </Button>
        </div>
      </div>
    );
  }

  // Imágenes (usar la principal + las adicionales)
  const images = [
    room.image_url,
    ...(room.images || []).map(img => img.image_url)
  ].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const amenityIcons = {
    wifi: <FiWifi className="w-5 h-5" />,
    tv: '📺',
    ac: '❄️',
    minibar: '🍹',
    safe: '🔒',
    phone: '📞',
    balcony: '🌅',
    bathtub: '🛁'
  };

  // Siempre permitir reservar - el calendario mostrará las fechas disponibles
  const canReserve = true;
  const isCurrentlyAvailable = room.status?.toLowerCase() === 'available';

  /**
   * Handle reservation button click
   */
  const handleReservationClick = () => {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <Button 
          variant="secondary" 
          onClick={() => navigate('/rooms')}
          className="mb-6"
        >
          <FiChevronLeft className="w-5 h-5" />
          Volver al Catálogo
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images section */}
          <div className="lg:col-span-2">
            {/* Main image gallery */}
            <div className="relative h-[500px] rounded-xl overflow-hidden shadow-xl mb-4">
              {images.length > 0 ? (
                <>
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={images[currentImageIndex]}
                    alt={`Habitación ${room.room_number}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                      >
                        <FiChevronLeft className="w-6 h-6 text-gray-800" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                      >
                        <FiChevronRight className="w-6 h-6 text-gray-800" />
                      </button>
                    </>
                  )}

                  {/* Image counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">Sin imágenes disponibles</p>
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-24 rounded-lg overflow-hidden ${
                      index === currentImageIndex 
                        ? 'ring-4 ring-primary' 
                        : 'opacity-60 hover:opacity-100'
                    } transition-all`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Descripción
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {room.description || 'Habitación confortable y acogedora con todas las comodidades necesarias para una estancia placentera.'}
              </p>
            </div>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Comodidades
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {room.amenities.map((amenity, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="text-primary">
                        {amenityIcons[amenity.toLowerCase()] || '•'}
                      </div>
                      <span className="text-gray-700 capitalize">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-xl p-6 sticky top-24">
              {/* Room info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Habitación</span>
                  <span className="text-2xl font-bold text-gray-800">
                    #{room.room_number}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 capitalize mb-2">
                  {room.type.replace('_', ' ')}
                </h1>
                
                {/* Status badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  isCurrentlyAvailable
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {isCurrentlyAvailable ? 'Disponible Ahora' : 'Ocupada Hoy'}
                </span>
              </div>

              {/* Quick info */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 text-gray-700">
                  <FiUsers className="w-5 h-5 text-primary" />
                  <span>Capacidad: {room.capacity} personas</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiSquare className="w-5 h-5 text-primary" />
                  <span>Piso {room.floor}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiMapPin className="w-5 h-5 text-primary" />
                  <span>Habitación {room.room_number}</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">
                    {formatCurrency(room.price_per_night)}
                  </span>
                  <span className="text-gray-600">/ noche</span>
                </div>
              </div>

              {/* Book button - Siempre disponible */}
              <Button 
                size="lg" 
                className="w-full !bg-primary-600 !text-white hover:!bg-primary-700 flex items-center justify-center gap-2"
                onClick={handleReservationClick}
              >
                <FiCalendar className="w-5 h-5" />
                {isCurrentlyAvailable ? 'Reservar Ahora' : 'Ver Fechas Disponibles'}
              </Button>
              
              {!isCurrentlyAvailable && (
                <p className="text-sm text-gray-600 text-center mt-2">
                  Esta habitación está ocupada hoy, pero puedes reservarla para otras fechas
                </p>
              )}

              {/* Info note */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Los precios pueden variar según la temporada
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default RoomDetail;
