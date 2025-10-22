import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiDollarSign, 
  FiMapPin,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

/**
 * MyReservations Page - Página para ver las reservaciones del usuario
 */
const MyReservations = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    fetchReservations();
  }, [isAuthenticated, navigate]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/guests/${user.id}/reservations`);
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Error al cargar las reservaciones');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
        icon: FiClock,
        text: 'Pendiente'
      },
      'Active': { 
        color: 'bg-green-100 text-green-800 border-green-300', 
        icon: FiCheckCircle,
        text: 'Activa'
      },
      'Completed': { 
        color: 'bg-blue-100 text-blue-800 border-blue-300', 
        icon: FiCheckCircle,
        text: 'Completada'
      },
      'Cancelled': { 
        color: 'bg-red-100 text-red-800 border-red-300', 
        icon: FiXCircle,
        text: 'Cancelada'
      }
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.text}
      </span>
    );
  };

  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'all') return true;
    if (filter === 'active') return reservation.status === 'Active' || reservation.status === 'Pending';
    if (filter === 'completed') return reservation.status === 'Completed';
    if (filter === 'cancelled') return reservation.status === 'Cancelled';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reservaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Reservaciones</h1>
          <p className="text-gray-600">
            Gestiona y revisa todas tus reservaciones
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-wrap gap-2"
        >
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Todas ({reservations.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'active'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Activas ({reservations.filter(r => r.status === 'Active' || r.status === 'Pending').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'completed'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Completadas ({reservations.filter(r => r.status === 'Completed').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'cancelled'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Canceladas ({reservations.filter(r => r.status === 'Cancelled').length})
          </button>
        </motion.div>

        {/* Reservations List */}
        {filteredReservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <Card.Body className="text-center py-12">
                <FiAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No hay reservaciones {filter !== 'all' && filter}
                </h3>
                <p className="text-gray-500 mb-6">
                  {filter === 'all' 
                    ? 'Aún no has realizado ninguna reservación'
                    : `No tienes reservaciones ${filter}`
                  }
                </p>
                <Button onClick={() => navigate('/rooms')}>
                  Explorar Habitaciones
                </Button>
              </Card.Body>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {filteredReservations.map((reservation, index) => (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card hover>
                    <Card.Body>
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Room Image */}
                        <div className="lg:w-64 flex-shrink-0">
                          <img
                            src={reservation.room?.image_url || 'https://via.placeholder.com/400x300?text=Room'}
                            alt={`Habitación ${reservation.room?.room_number}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>

                        {/* Reservation Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                Habitación {reservation.room?.room_number}
                              </h3>
                              <p className="text-gray-600">
                                {reservation.room?.room_type}
                              </p>
                            </div>
                            {getStatusBadge(reservation.status)}
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            {/* Check-in */}
                            <div className="flex items-center gap-3 text-gray-700">
                              <div className="bg-primary-50 p-2 rounded-lg">
                                <FiCalendar className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Check-in</p>
                                <p className="font-semibold">
                                  {new Date(reservation.check_in_date).toLocaleDateString('es-ES', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Check-out */}
                            <div className="flex items-center gap-3 text-gray-700">
                              <div className="bg-primary-50 p-2 rounded-lg">
                                <FiCalendar className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Check-out</p>
                                <p className="font-semibold">
                                  {new Date(reservation.check_out_date).toLocaleDateString('es-ES', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Guests */}
                            <div className="flex items-center gap-3 text-gray-700">
                              <div className="bg-primary-50 p-2 rounded-lg">
                                <FiUser className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Huéspedes</p>
                                <p className="font-semibold">{reservation.number_of_guests}</p>
                              </div>
                            </div>

                            {/* Total */}
                            <div className="flex items-center gap-3 text-gray-700">
                              <div className="bg-primary-50 p-2 rounded-lg">
                                <FiDollarSign className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Total</p>
                                <p className="font-semibold text-primary">
                                  ${parseFloat(reservation.total_price).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Special Requests */}
                          {reservation.special_requests && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <FiMapPin className="w-3 h-3" />
                                Solicitudes especiales:
                              </p>
                              <p className="text-sm text-gray-700">{reservation.special_requests}</p>
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/confirmation/${reservation.id}`)}
                            >
                              Ver Detalles
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
