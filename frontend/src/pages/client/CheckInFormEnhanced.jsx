/**
 * Enhanced CheckIn Form with Availability Validation, PayPal Payment and Email Confirmation
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiUsers, FiCreditCard, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import PayPalButton from '../../components/PayPalButton';
import AuthModal from '../../components/auth/AuthModal';
import { roomService } from '../../services/roomService';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CheckInFormEnhanced = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Dates, 2: Payment, 3: Confirmation
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guestsCount: 1,
    specialRequests: ''
  });
  
  // Availability check
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  // Payment
  const [reservation, setReservation] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !showAuthModal) {
      setShowAuthModal(true);
      localStorage.setItem('intended_destination', `/checkin/${roomId}`);
    }
  }, [isAuthenticated, roomId]);

  const fetchRoomDetails = async () => {
    try {
      const data = await roomService.getRoomById(roomId);
      setRoom(data);
      if (data.status !== 'Available') {
        toast.error('Esta habitación no está disponible');
        navigate('/rooms');
      }
      
      // Fetch blocked dates for this room
      await fetchBlockedDates();
    } catch (error) {
      console.error('Error loading room:', error);
      toast.error('Error al cargar la habitación');
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedDates = async () => {
    try {
      const response = await api.get(`/reservations/room/${roomId}/blocked-dates`);
      setBlockedDates(response.data.blocked_dates || []);
    } catch (error) {
      console.error('Error loading blocked dates:', error);
      // No mostrar error, solo continuar sin fechas bloqueadas
    }
  };

  const isDateBlocked = (dateStr) => {
    return blockedDates.includes(dateStr);
  };

  const isRangeBlocked = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const current = new Date(start);
    
    while (current < end) {
      const dateStr = current.toISOString().split('T')[0];
      if (isDateBlocked(dateStr)) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }
    return false;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkAvailability = async () => {
    if (!formData.checkIn || !formData.checkOut) {
      toast.error('Por favor selecciona las fechas');
      return;
    }

    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      toast.error('La fecha de salida debe ser posterior a la fecha de entrada');
      return;
    }

    if (formData.guestsCount > room.capacity) {
      toast.error(`La habitación tiene capacidad para ${room.capacity} personas máximo`);
      return;
    }

    // Check if selected dates are blocked
    if (isRangeBlocked(formData.checkIn, formData.checkOut)) {
      toast.error('Las fechas seleccionadas no están disponibles. Por favor elige otras fechas.');
      return;
    }

    setCheckingAvailability(true);

    try {
      const response = await api.post('/reservations/check-availability', null, {
        params: {
          room_id: roomId,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          guests_count: formData.guestsCount
        }
      });

      setAvailability(response.data);

      if (response.data.available) {
        toast.success('¡Habitación disponible! Procede al pago');
        setStep(2);
      } else {
        toast.error(response.data.reason || 'Habitación no disponible');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error(error.response?.data?.detail || 'Error al verificar disponibilidad');
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    setProcessingPayment(true);

    try {
      // Create reservation
      const reservationPayload = {
        guest_id: user.id,
        room_id: parseInt(roomId),
        check_in_date: formData.checkIn,
        check_out_date: formData.checkOut,
        guests_count: parseInt(formData.guestsCount),
        special_requests: formData.specialRequests || null,
        status: 'Active',
        total_price: parseFloat(availability.total_price),
        payment_method: 'PayPal',
        payment_status: 'Paid'
      };

      console.log('Sending reservation payload:', reservationPayload);

      const reservationResponse = await api.post('/reservations/', reservationPayload);
      const newReservation = reservationResponse.data;
      setReservation(newReservation);

      // Send confirmation email
      try {
        await api.post(`/reservations/${newReservation.id}/send-confirmation`);
        toast.success('Email de confirmación enviado');
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the whole process if email fails
        toast.error('Reserva creada pero el email no pudo enviarse');
      }

      // Move to confirmation step
      setStep(3);
      toast.success('¡Reserva completada exitosamente!');

    } catch (error) {
      console.error('Error creating reservation:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.detail || 'Error al crear la reserva');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    toast.error('Error al procesar el pago. Inténtalo de nuevo.');
  };

  if (loading) {
    return <Loading message="Cargando información de la habitación..." />;
  }

  if (!room) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reserva tu Habitación</h1>
          <p className="text-gray-600">Habitación #{room.room_number} - {room.type}</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { num: 1, label: 'Fechas' },
            { num: 2, label: 'Pago' },
            { num: 3, label: 'Confirmación' }
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                step >= s.num ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step > s.num ? <FiCheck /> : s.num}
              </div>
              <span className={`ml-2 ${step >= s.num ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                {s.label}
              </span>
              {idx < 2 && (
                <div className={`w-16 h-1 mx-4 ${step > s.num ? 'bg-primary-600' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Dates Selection */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiCalendar className="text-primary-600" />
                Selecciona tus Fechas
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Fecha de Entrada
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formData.checkIn && isDateBlocked(formData.checkIn) 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                  {formData.checkIn && isDateBlocked(formData.checkIn) && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-4 h-4" />
                      Esta fecha está reservada
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Fecha de Salida
                  </label>
                  <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleInputChange}
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formData.checkIn && formData.checkOut && isRangeBlocked(formData.checkIn, formData.checkOut)
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                  {formData.checkIn && formData.checkOut && isRangeBlocked(formData.checkIn, formData.checkOut) && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-4 h-4" />
                      Hay fechas reservadas en este rango
                    </p>
                  )}
                </div>
              </div>

              {/* Info about blocked dates */}
              {blockedDates.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4" />
                    <span>
                      Esta habitación tiene {blockedDates.length} fecha{blockedDates.length !== 1 ? 's' : ''} reservada{blockedDates.length !== 1 ? 's' : ''}. 
                      Selecciona fechas disponibles para continuar.
                    </span>
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  <FiUsers className="inline mr-2" />
                  Número de Huéspedes
                </label>
                <input
                  type="number"
                  name="guestsCount"
                  value={formData.guestsCount}
                  onChange={handleInputChange}
                  min="1"
                  max={room.capacity}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Capacidad máxima: {room.capacity} personas</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Solicitudes Especiales (Opcional)
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Ej: Cama extra, cuna para bebé, piso alto, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Room Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Resumen</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio por noche:</span>
                    <span className="font-medium">{formatCurrency(room.price_per_night)}</span>
                  </div>
                  {formData.checkIn && formData.checkOut && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Noches:</span>
                        <span className="font-medium">
                          {Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24))}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="font-bold text-gray-900">Total Estimado:</span>
                        <span className="font-bold text-primary-600 text-lg">
                          {formatCurrency(
                            room.price_per_night * Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24))
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button
                onClick={checkAvailability}
                disabled={checkingAvailability || !formData.checkIn || !formData.checkOut}
                className="w-full !bg-primary-600 !text-white hover:!bg-primary-700 font-semibold shadow-lg"
                size="lg"
              >
                {checkingAvailability ? 'Verificando disponibilidad...' : 'Verificar Disponibilidad y Continuar'}
              </Button>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && availability && availability.available && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiCreditCard className="text-primary-600" />
                Procesar Pago
              </h2>

              {/* Booking Summary */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Detalles de tu Reserva</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Habitación:</span>
                    <span className="font-medium">#{availability.room_number} - {room.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">{new Date(formData.checkIn).toLocaleDateString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">{new Date(formData.checkOut).toLocaleDateString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Noches:</span>
                    <span className="font-medium">{availability.total_nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Huéspedes:</span>
                    <span className="font-medium">{formData.guestsCount}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-primary-300">
                    <span className="font-bold text-gray-900 text-lg">Total a Pagar:</span>
                    <span className="font-bold text-primary-600 text-2xl">
                      {formatCurrency(availability.total_price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* PayPal Button */}
              <PayPalButton
                amount={availability.total_price}
                currency="MXN"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                reservationData={{
                  room_number: availability.room_number,
                  room_type: room.type,
                  check_in: new Date(formData.checkIn).toLocaleDateString('es-MX'),
                  check_out: new Date(formData.checkOut).toLocaleDateString('es-MX'),
                  nights: availability.total_nights,
                  price_per_night: availability.price_per_night
                }}
              />

              <button
                onClick={() => setStep(1)}
                className="w-full mt-4 text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Regresar a modificar fechas
              </button>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && reservation && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheck className="w-10 h-10 text-green-600" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¡Reserva Confirmada!
              </h2>

              <p className="text-gray-600 mb-6">
                Tu reserva ha sido procesada exitosamente. 
                Hemos enviado un correo de confirmación a <strong>{user?.email}</strong>
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Número de Confirmación</h3>
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary-600">#{reservation.id}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => navigate(`/confirmation/${reservation.id}`)}
                  className="w-full"
                  size="lg"
                >
                  Ver Detalles de la Reserva
                </Button>
                
                <button
                  onClick={() => navigate('/rooms')}
                  className="w-full text-gray-600 hover:text-gray-900 font-medium"
                >
                  Volver al catálogo de habitaciones
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            if (!isAuthenticated) {
              navigate('/rooms');
            }
          }}
          onSuccess={() => setShowAuthModal(false)}
        />
      </div>
    </div>
  );
};

export default CheckInFormEnhanced;
