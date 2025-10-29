import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFilter } from 'react-icons/fi';
import ReservationTable from '../../components/admin/ReservationTable';
import SearchBar from '../../components/common/SearchBar';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { reservationService } from '../../services/reservationService';
import { checkinService } from '../../services/checkinService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * ReservationManagement Page - Gestión de reservaciones para admin
 */
const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, statusFilter, searchQuery]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      let data;
      
      if (statusFilter === 'all') {
        data = await reservationService.getAllReservations();
      } else if (statusFilter === 'active') {
        data = await reservationService.getActiveReservations();
      } else if (statusFilter === 'pending') {
        data = await reservationService.getPendingReservations();
      } else {
        data = await reservationService.getAllReservations();
        data = data.filter(r => r.status === statusFilter);
      }
      
      setReservations(data);
    } catch (error) {
      console.error('Error al cargar reservaciones:', error);
      toast.error('Error al cargar reservaciones');
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];
    
    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.id.toString().includes(searchQuery) ||
        r.room?.room_number.toString().includes(searchQuery) ||
        r.guest?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.guest?.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.guest?.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredReservations(filtered);
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setDetailModalOpen(true);
  };

  const handleCheckIn = async (reservation) => {
    if (!window.confirm(`¿Realizar check-in para la reserva #${reservation.id}?`)) {
      return;
    }
    
    try {
      await checkinService.markCheckIn(reservation.id);
      
      toast.success('Check-in realizado exitosamente. Email de bienvenida enviado.');
      await fetchReservations();
    } catch (error) {
      console.error('Error al hacer check-in:', error);
      toast.error(error.response?.data?.detail || 'Error al realizar check-in');
    }
  };

  const handleCheckOut = async (reservation) => {
    if (!window.confirm(`¿Realizar check-out para la reserva #${reservation.id}?`)) {
      return;
    }
    
    try {
      await checkinService.checkOut(reservation.id);
      
      toast.success('Check-out realizado exitosamente. Email de agradecimiento enviado.');
      await fetchReservations();
    } catch (error) {
      console.error('Error al hacer check-out:', error);
      toast.error(error.response?.data?.detail || 'Error al realizar check-out');
    }
  };

  const handleCancel = async (reservation) => {
    if (!window.confirm(`¿Cancelar la reserva #${reservation.id}?`)) {
      return;
    }
    
    try {
      await reservationService.deleteReservation(reservation.id);
      toast.success('Reserva cancelada. Email de confirmación enviado.');
      await fetchReservations();
    } catch (error) {
      console.error('Error al cancelar:', error);
      toast.error('Error al cancelar reserva');
    }
  };

  if (loading) {
    return <Loading text="Cargando reservaciones..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Gestión de Reservaciones
        </h1>
        <p className="text-gray-600">
          {reservations.length} reservaciones en total
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-gray-600" />
          <h2 className="text-lg font-bold text-gray-800">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por ID, habitación, huésped..."
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                fetchReservations();
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todas las reservaciones</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="active">Activas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: 'Todas', count: reservations.length },
          { value: 'pending', label: 'Pendientes', count: reservations.filter(r => r.status === 'pending').length },
          { value: 'confirmed', label: 'Confirmadas', count: reservations.filter(r => r.status === 'confirmed').length },
          { value: 'active', label: 'Activas', count: reservations.filter(r => r.status === 'active').length },
          { value: 'completed', label: 'Completadas', count: reservations.filter(r => r.status === 'completed').length },
          { value: 'cancelled', label: 'Canceladas', count: reservations.filter(r => r.status === 'cancelled').length }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              fetchReservations();
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Reservations Table */}
      <ReservationTable
        reservations={filteredReservations}
        onView={handleViewDetails}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onCancel={handleCancel}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Detalles de Reserva"
        size="lg"
      >
        {selectedReservation && (
          <div className="space-y-6">
            {/* Reservation info */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Información de Reserva
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">ID:</span>
                  <p className="font-semibold">#{selectedReservation.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">Estado:</span>
                  <p className="font-semibold capitalize">{selectedReservation.status}</p>
                </div>
                <div>
                  <span className="text-gray-600">Check-in:</span>
                  <p className="font-semibold">{formatDate(selectedReservation.check_in_date)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Check-out:</span>
                  <p className="font-semibold">{formatDate(selectedReservation.check_out_date)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Huéspedes:</span>
                  <p className="font-semibold">{selectedReservation.guests_count}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total:</span>
                  <p className="font-semibold text-primary">
                    {formatCurrency(selectedReservation.total_price)}
                  </p>
                </div>
              </div>
            </div>

            {/* Guest info */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Información del Huésped
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nombre:</span>
                  <p className="font-semibold">
                    {selectedReservation.guest?.first_name} {selectedReservation.guest?.last_name}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-semibold">{selectedReservation.guest?.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Teléfono:</span>
                  <p className="font-semibold">{selectedReservation.guest?.phone}</p>
                </div>
                <div>
                  <span className="text-gray-600">Documento:</span>
                  <p className="font-semibold">{selectedReservation.guest?.id_document}</p>
                </div>
              </div>
            </div>

            {/* Room info */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Información de Habitación
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Número:</span>
                  <p className="font-semibold">#{selectedReservation.room?.room_number}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tipo:</span>
                  <p className="font-semibold capitalize">
                    {selectedReservation.room?.type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Capacidad:</span>
                  <p className="font-semibold">{selectedReservation.room?.capacity} personas</p>
                </div>
                <div>
                  <span className="text-gray-600">Precio/Noche:</span>
                  <p className="font-semibold">
                    {formatCurrency(selectedReservation.room?.price_per_night)}
                  </p>
                </div>
              </div>
            </div>

            {/* Special requests */}
            {selectedReservation.special_requests && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Solicitudes Especiales
                </h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {selectedReservation.special_requests}
                </p>
              </div>
            )}
          </div>
        )}
        
        <Modal.Footer>
          <Button onClick={() => setDetailModalOpen(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReservationManagement;
