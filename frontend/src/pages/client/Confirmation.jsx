import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiPrinter, FiMail, FiHome } from 'react-icons/fi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { reservationService } from '../../services/reservationService';
import { formatDate, formatCurrency, calculateNights } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * Confirmation Page - Página de confirmación de reserva
 */
const Confirmation = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservation();
  }, [reservationId]);

  const fetchReservation = async () => {
    setLoading(true);
    try {
      const data = await reservationService.getReservationById(reservationId);
      setReservation(data);
    } catch (error) {
      console.error('Error al cargar reserva:', error);
      toast.error('Error al cargar la confirmación');
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    toast.success('Confirmación enviada al email registrado');
  };

  if (loading) {
    return <Loading fullScreen text="Cargando confirmación..." />;
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Reserva no encontrada
          </h2>
          <Button onClick={() => navigate('/rooms')}>
            Ver Habitaciones
          </Button>
        </div>
      </div>
    );
  }

  const nights = calculateNights(reservation.check_in_date, reservation.check_out_date);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="flex justify-center mb-8"
        >
          <div className="bg-green-500 rounded-full p-6 shadow-xl">
            <FiCheck className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        {/* Success message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ¡Reserva Confirmada!
          </h1>
          <p className="text-xl text-gray-600">
            Tu reserva ha sido procesada exitosamente
          </p>
        </motion.div>

        {/* Confirmation card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="print:shadow-none">
            <Card.Header className="bg-primary text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Confirmación de Reserva</h2>
                  <p className="text-white/80">ID: #{reservation.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/80">Fecha de reserva</p>
                  <p className="font-bold">{formatDate(reservation.created_at)}</p>
                </div>
              </div>
            </Card.Header>

            <Card.Body>
              {/* Guest information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Información del Huésped
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <span className="font-semibold">Nombre:</span>{' '}
                    {reservation.guest.first_name} {reservation.guest.last_name}
                  </div>
                  <div>
                    <span className="font-semibold">Email:</span>{' '}
                    {reservation.guest.email}
                  </div>
                  <div>
                    <span className="font-semibold">Teléfono:</span>{' '}
                    {reservation.guest.phone}
                  </div>
                  <div>
                    <span className="font-semibold">Documento:</span>{' '}
                    {reservation.guest.id_document}
                  </div>
                </div>
              </div>

              {/* Room information */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Información de la Habitación
                </h3>
                <div className="flex gap-4">
                  <img
                    src={reservation.room.image_url}
                    alt={`Habitación ${reservation.room.room_number}`}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1 text-gray-700 space-y-2">
                    <div>
                      <span className="font-semibold">Habitación:</span>{' '}
                      #{reservation.room.room_number}
                    </div>
                    <div>
                      <span className="font-semibold">Tipo:</span>{' '}
                      <span className="capitalize">
                        {reservation.room.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Capacidad:</span>{' '}
                      {reservation.room.capacity} personas
                    </div>
                    <div>
                      <span className="font-semibold">Piso:</span>{' '}
                      {reservation.room.floor}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stay dates */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Fechas de Estadía
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Check-in</p>
                    <p className="font-bold text-lg">
                      {formatDate(reservation.check_in_date, 'long')}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Check-out</p>
                    <p className="font-bold text-lg">
                      {formatDate(reservation.check_out_date, 'long')}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total de noches</p>
                    <p className="font-bold text-lg text-primary">{nights}</p>
                  </div>
                </div>
              </div>

              {/* Guests count */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Detalles de la Reserva
                </h3>
                <div className="text-gray-700 space-y-2">
                  <div>
                    <span className="font-semibold">Número de huéspedes:</span>{' '}
                    {reservation.guests_count}
                  </div>
                  {reservation.special_requests && (
                    <div>
                      <span className="font-semibold">Solicitudes especiales:</span>{' '}
                      {reservation.special_requests}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Estado:</span>{' '}
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      reservation.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : reservation.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {reservation.status === 'confirmed' ? 'Confirmada' : 
                       reservation.status === 'pending' ? 'Pendiente' : 'Activa'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Resumen de Pago
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>
                      {formatCurrency(reservation.room.price_per_night)} x {nights} noches
                    </span>
                    <span>{formatCurrency(reservation.total_price)}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-300 flex justify-between items-center">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-3xl font-bold text-primary">
                    {formatCurrency(reservation.total_price)}
                  </span>
                </div>
              </div>
            </Card.Body>

            <Card.Footer className="print:hidden">
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={handlePrint} variant="secondary">
                  <FiPrinter className="w-5 h-5" />
                  Imprimir
                </Button>
                <Button onClick={handleSendEmail} variant="secondary">
                  <FiMail className="w-5 h-5" />
                  Enviar por Email
                </Button>
                <Button onClick={() => navigate('/')} variant="primary">
                  <FiHome className="w-5 h-5" />
                  Volver al Inicio
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </motion.div>

        {/* Important information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 p-6 bg-blue-50 rounded-lg print:hidden"
        >
          <h3 className="font-bold text-blue-900 mb-2">
            📌 Información Importante
          </h3>
          <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
            <li>Guarda este número de confirmación: <strong>#{reservation.id}</strong></li>
            <li>El check-in es a partir de las 3:00 PM</li>
            <li>El check-out es hasta las 12:00 PM</li>
            <li>Presenta tu documento de identidad al momento del check-in</li>
            <li>Se ha enviado una copia de esta confirmación a tu email</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Confirmation;
