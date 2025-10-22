import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiFileText, FiCalendar, FiUsers } from 'react-icons/fi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import DateRangePicker from '../../components/common/DateRangePicker';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { roomService } from '../../services/roomService';
import { checkinService } from '../../services/checkinService';
import { validateGuestForm, isValidDateRange } from '../../utils/validators';
import { formatCurrency, calculateNights } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * CheckInForm Page - Formulario de check-in/reserva
 */
const CheckInForm = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Dates
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  
  // Guest data
  const [guestData, setGuestData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_document: '',
    nationality: ''
  });
  
  // Additional info
  const [guestsCount, setGuestsCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  const fetchRoomDetails = async () => {
    setLoading(true);
    try {
      const data = await roomService.getRoomById(roomId);
      setRoom(data);
      
      if (data.status !== 'available') {
        toast.error('Esta habitación no está disponible');
        navigate(`/rooms/${roomId}`);
      }
    } catch (error) {
      console.error('Error al cargar habitación:', error);
      toast.error('Error al cargar la habitación');
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGuestData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar fechas
    if (!checkIn || !checkOut) {
      toast.error('Por favor selecciona las fechas de check-in y check-out');
      return;
    }
    
    if (!isValidDateRange(checkIn, checkOut)) {
      toast.error('La fecha de check-out debe ser después del check-in');
      return;
    }
    
    // Validar datos del huésped
    const validation = validateGuestForm(guestData);
    if (!validation.valid) {
      setErrors(validation.errors);
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Preparar datos para check-in
      const checkInData = {
        room_id: parseInt(roomId),
        guest_data: guestData,
        check_in_date: checkIn.toISOString().split('T')[0],
        check_out_date: checkOut.toISOString().split('T')[0],
        guests_count: guestsCount,
        special_requests: specialRequests || null
      };
      
      // Realizar check-in
      const response = await checkinService.checkIn(checkInData);
      
      toast.success('¡Reserva realizada con éxito!');
      
      // Navegar a confirmación
      navigate(`/confirmation/${response.reservation_id}`);
      
    } catch (error) {
      console.error('Error al realizar check-in:', error);
      toast.error(error.response?.data?.detail || 'Error al realizar la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Cargando formulario..." />;
  }

  if (!room) {
    return null;
  }

  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = nights * room.price_per_night;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Completar Reserva
          </h1>
          <p className="text-gray-600 mb-8">
            Llena el formulario para confirmar tu estadía
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dates section */}
                <Card>
                  <Card.Header>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <FiCalendar className="text-primary" />
                      Fechas de Estadía
                    </h2>
                  </Card.Header>
                  <Card.Body>
                    <DateRangePicker
                      startDate={checkIn}
                      endDate={checkOut}
                      onStartDateChange={setCheckIn}
                      onEndDateChange={setCheckOut}
                    />
                    
                    {checkIn && checkOut && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-800 font-medium">
                          Total de noches: {nights}
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* Guest info section */}
                <Card>
                  <Card.Header>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <FiUser className="text-primary" />
                      Información del Huésped
                    </h2>
                  </Card.Header>
                  <Card.Body>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nombre"
                        name="first_name"
                        value={guestData.first_name}
                        onChange={handleInputChange}
                        error={errors.first_name}
                        required
                        icon={<FiUser className="w-5 h-5 text-gray-400" />}
                      />
                      
                      <Input
                        label="Apellido"
                        name="last_name"
                        value={guestData.last_name}
                        onChange={handleInputChange}
                        error={errors.last_name}
                        required
                        icon={<FiUser className="w-5 h-5 text-gray-400" />}
                      />
                      
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={guestData.email}
                        onChange={handleInputChange}
                        error={errors.email}
                        required
                        icon={<FiMail className="w-5 h-5 text-gray-400" />}
                      />
                      
                      <Input
                        label="Teléfono"
                        name="phone"
                        type="tel"
                        value={guestData.phone}
                        onChange={handleInputChange}
                        error={errors.phone}
                        required
                        icon={<FiPhone className="w-5 h-5 text-gray-400" />}
                      />
                      
                      <Input
                        label="Documento de Identidad"
                        name="id_document"
                        value={guestData.id_document}
                        onChange={handleInputChange}
                        error={errors.id_document}
                        required
                        icon={<FiFileText className="w-5 h-5 text-gray-400" />}
                        placeholder="DNI, Pasaporte, etc."
                      />
                      
                      <Input
                        label="Nacionalidad"
                        name="nationality"
                        value={guestData.nationality}
                        onChange={handleInputChange}
                        error={errors.nationality}
                        required
                        placeholder="Ej: Mexicana"
                      />
                    </div>
                  </Card.Body>
                </Card>

                {/* Additional info */}
                <Card>
                  <Card.Header>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <FiUsers className="text-primary" />
                      Información Adicional
                    </h2>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Huéspedes
                        </label>
                        <select
                          value={guestsCount}
                          onChange={(e) => setGuestsCount(Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          {[...Array(room.capacity)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} {i === 0 ? 'persona' : 'personas'}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Solicitudes Especiales (Opcional)
                        </label>
                        <textarea
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Cama extra, piso alto, vista al mar, etc."
                        />
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Submit button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  loading={submitting}
                >
                  Confirmar Reserva
                </Button>
              </form>
            </div>

            {/* Summary sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <Card.Header>
                  <h2 className="text-xl font-bold text-gray-800">
                    Resumen de Reserva
                  </h2>
                </Card.Header>
                <Card.Body>
                  {/* Room info */}
                  <div className="mb-4">
                    <img
                      src={room.image_url}
                      alt={`Habitación ${room.room_number}`}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-bold text-lg capitalize">
                      {room.type.replace('_', ' ')}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Habitación #{room.room_number}
                    </p>
                  </div>

                  {/* Dates */}
                  {checkIn && checkOut && (
                    <div className="space-y-2 mb-4 pb-4 border-b">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">{checkIn.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium">{checkOut.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Noches:</span>
                        <span className="font-medium">{nights}</span>
                      </div>
                    </div>
                  )}

                  {/* Price breakdown */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {formatCurrency(room.price_per_night)} x {nights || 0} noches
                      </span>
                      <span className="font-medium">
                        {formatCurrency(totalPrice || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(totalPrice || 0)}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckInForm;
