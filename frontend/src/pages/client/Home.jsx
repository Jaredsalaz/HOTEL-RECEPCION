import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiCalendar, FiUsers } from 'react-icons/fi';
import DateRangePicker from '../../components/common/DateRangePicker';
import Button from '../../components/common/Button';

/**
 * Home Page - Página de inicio con hero y búsqueda
 */
const Home = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(2);

  const handleSearch = () => {
    // Navegar a catálogo con parámetros de búsqueda
    const params = new URLSearchParams();
    if (checkIn) params.append('checkIn', checkIn.toISOString().split('T')[0]);
    if (checkOut) params.append('checkOut', checkOut.toISOString().split('T')[0]);
    if (guests) params.append('guests', guests);
    
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3)',
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            Bienvenido a Hotel Reception
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8"
          >
            Tu experiencia perfecta comienza aquí
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              size="lg"
              onClick={() => navigate('/rooms')}
              className="shadow-lg"
            >
              <FiSearch className="w-5 h-5" />
              Explorar Habitaciones
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Buscar Disponibilidad
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Date Range Picker */}
            <div className="md:col-span-2">
              <DateRangePicker
                startDate={checkIn}
                endDate={checkOut}
                onStartDateChange={setCheckIn}
                onEndDateChange={setCheckOut}
              />
            </div>

            {/* Guests selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiUsers className="inline w-4 h-4 mr-1" />
                Huéspedes
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'persona' : 'personas'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <Button 
              onClick={handleSearch}
              size="lg"
              className="w-full md:w-auto bg-primary-600 text-white hover:bg-primary-700 font-semibold shadow-lg flex items-center gap-2"
            >
              <FiSearch className="w-5 h-5" />
              Buscar Habitaciones
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          ¿Por qué elegirnos?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '🏨',
              title: 'Habitaciones de Lujo',
              description: 'Espacios diseñados para tu máximo confort y descanso'
            },
            {
              icon: '⚡',
              title: 'Check-in Rápido',
              description: 'Sistema eficiente para que disfrutes tu estancia sin esperas'
            },
            {
              icon: '🌟',
              title: 'Servicio 5 Estrellas',
              description: 'Personal capacitado para hacer tu experiencia inolvidable'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-50 to-primary-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary-900">
            ¿Listo para tu siguiente aventura?
          </h2>
          <p className="text-xl mb-8 text-primary-700">
            Reserva ahora y obtén la mejor experiencia
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/rooms')}
            className="bg-primary-600 text-white hover:bg-primary-700 border-2 border-primary-600 font-semibold shadow-lg"
          >
            Ver Habitaciones Disponibles
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
