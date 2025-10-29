import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiHome, FiDollarSign, FiUsers, FiCalendar,
  FiTrendingUp, FiClock 
} from 'react-icons/fi';
import StatCard from '../../components/admin/StatCard';
import ReservationTable from '../../components/admin/ReservationTable';
import Loading from '../../components/common/Loading';
import { reportService } from '../../services/reportService';
import { reservationService } from '../../services/reservationService';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * AdminDashboard Page - Panel principal del administrador con estadísticas
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [todayCheckIns, setTodayCheckIns] = useState([]);
  const [todayCheckOuts, setTodayCheckOuts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Obtener estadísticas
      const statsData = await reportService.getDashboardStats();
      setStats(statsData);

      // Obtener check-ins y check-outs de hoy
      const checkIns = await reservationService.getTodayCheckIns();
      const checkOuts = await reservationService.getTodayCheckOuts();
      
      setTodayCheckIns(checkIns);
      setTodayCheckOuts(checkOuts);
      
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      toast.error('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Cargando dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Resumen general del sistema
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Habitaciones Totales"
            value={stats.total_rooms}
            icon={<FiHome className="w-6 h-6" />}
            color="blue"
            subtitle={`${stats.available_rooms} disponibles`}
          />
          
          <StatCard
            title="Ocupación"
            value={`${stats.occupied_rooms}/${stats.total_rooms}`}
            icon={<FiUsers className="w-6 h-6" />}
            color="green"
            subtitle={formatPercentage(stats.occupancy_rate) + ' ocupado'}
          />
          
          <StatCard
            title="Ingresos Hoy"
            value={formatCurrency(stats.revenue_today)}
            icon={<FiDollarSign className="w-6 h-6" />}
            color="purple"
            subtitle="Día actual"
          />
          
          <StatCard
            title="Ingresos Mes"
            value={formatCurrency(stats.revenue_month)}
            icon={<FiTrendingUp className="w-6 h-6" />}
            color="indigo"
            subtitle="Mes actual"
          />
        </div>
      )}

      {/* Secondary Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Reservas Activas"
            value={stats.active_reservations}
            icon={<FiCalendar className="w-6 h-6" />}
            color="green"
          />
          
          <StatCard
            title="Check-ins Hoy"
            value={stats.checkins_today}
            icon={<FiClock className="w-6 h-6" />}
            color="blue"
          />
          
          <StatCard
            title="Check-outs Hoy"
            value={stats.checkouts_today}
            icon={<FiClock className="w-6 h-6" />}
            color="yellow"
          />
        </div>
      )}

      {/* Today's Check-ins */}
      {todayCheckIns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Check-ins de Hoy
          </h2>
          <ReservationTable
            reservations={todayCheckIns}
            onView={(reservation) => {
              // Implementar ver detalles
              toast(`Ver detalles de reserva #${reservation.id}`, { icon: 'ℹ️' });
            }}
          />
        </motion.div>
      )}

      {/* Today's Check-outs */}
      {todayCheckOuts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Check-outs de Hoy
          </h2>
          <ReservationTable
            reservations={todayCheckOuts}
            onView={(reservation) => {
              toast(`Ver detalles de reserva #${reservation.id}`, { icon: 'ℹ️' });
            }}
          />
        </motion.div>
      )}

      {/* No activities today */}
      {todayCheckIns.length === 0 && todayCheckOuts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-8 text-center"
        >
          <p className="text-gray-600">
            No hay check-ins ni check-outs programados para hoy
          </p>
        </motion.div>
      )}

      {/* Quick Stats Summary */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Resumen Rápido
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending_reservations}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Confirmadas</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.confirmed_reservations}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Completadas</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.completed_reservations}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Canceladas</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.cancelled_reservations}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
