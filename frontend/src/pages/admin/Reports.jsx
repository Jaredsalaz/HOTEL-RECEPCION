import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiPieChart } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { reportService } from '../../services/reportService';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * Reports Page - Generación y visualización de reportes para admin
 */
const Reports = () => {
  const [stats, setStats] = useState(null);
  const [roomStatus, setRoomStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const [statsData, roomStatusData] = await Promise.all([
        reportService.getDashboardStats(),
        reportService.getRoomStatusReport()
      ]);
      
      setStats(statsData);
      setRoomStatus(roomStatusData);
    } catch (error) {
      console.error('Error al cargar datos de reportes:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      await reportService.downloadOccupancyPDF();
      toast.success('Reporte PDF descargado');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      toast.error('Error al descargar PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    try {
      await reportService.downloadOccupancyExcel();
      toast.success('Reporte Excel descargado');
    } catch (error) {
      console.error('Error al descargar Excel:', error);
      toast.error('Error al descargar Excel');
    } finally {
      setDownloadingExcel(false);
    }
  };

  if (loading) {
    return <Loading text="Cargando reportes..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Reportes y Estadísticas
        </h1>
        <p className="text-gray-600">
          Genera y descarga reportes del sistema
        </p>
      </div>

      {/* Download buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hover>
          <Card.Body className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-4 rounded-full">
                <FiFileText className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Reporte PDF
            </h3>
            <p className="text-gray-600 mb-4">
              Descarga un reporte completo de ocupación en formato PDF
            </p>
            <Button
              onClick={handleDownloadPDF}
              loading={downloadingPDF}
              variant="danger"
              className="w-full"
            >
              <FiDownload className="w-5 h-5" />
              Descargar PDF
            </Button>
          </Card.Body>
        </Card>

        <Card hover>
          <Card.Body className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <FiFileText className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Reporte Excel
            </h3>
            <p className="text-gray-600 mb-4">
              Descarga un reporte detallado en formato Excel
            </p>
            <Button
              onClick={handleDownloadExcel}
              loading={downloadingExcel}
              variant="success"
              className="w-full"
            >
              <FiDownload className="w-5 h-5" />
              Descargar Excel
            </Button>
          </Card.Body>
        </Card>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <Card.Header>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiPieChart className="text-primary" />
                Resumen General
              </h2>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Occupancy */}
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <p className="text-gray-600 text-sm mb-2">Tasa de Ocupación</p>
                  <p className="text-4xl font-bold text-blue-600 mb-1">
                    {formatPercentage(stats.occupancy_rate)}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {stats.occupied_rooms} de {stats.total_rooms} habitaciones
                  </p>
                </div>

                {/* Revenue Today */}
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <p className="text-gray-600 text-sm mb-2">Ingresos Hoy</p>
                  <p className="text-3xl font-bold text-green-600 mb-1">
                    {formatCurrency(stats.revenue_today)}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Día actual
                  </p>
                </div>

                {/* Revenue Month */}
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <p className="text-gray-600 text-sm mb-2">Ingresos del Mes</p>
                  <p className="text-3xl font-bold text-purple-600 mb-1">
                    {formatCurrency(stats.revenue_month)}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Mes actual
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      )}

      {/* Reservations by Status */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <Card.Header>
              <h2 className="text-xl font-bold text-gray-800">
                Reservaciones por Estado
              </h2>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-yellow-600 text-sm mb-1">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.pending_reservations}
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-blue-600 text-sm mb-1">Confirmadas</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.confirmed_reservations}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-green-600 text-sm mb-1">Activas</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.active_reservations}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600 text-sm mb-1">Completadas</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {stats.completed_reservations}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      )}

      {/* Room Status Report */}
      {roomStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rooms by Status */}
            <Card>
              <Card.Header>
                <h2 className="text-xl font-bold text-gray-800">
                  Habitaciones por Estado
                </h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {roomStatus.rooms_by_status && Object.entries(roomStatus.rooms_by_status).map(([status, count]) => {
                    const colors = {
                      available: 'bg-green-500',
                      occupied: 'bg-red-500',
                      cleaning: 'bg-blue-500',
                      maintenance: 'bg-yellow-500'
                    };
                    
                    const labels = {
                      available: 'Disponibles',
                      occupied: 'Ocupadas',
                      cleaning: 'En Limpieza',
                      maintenance: 'En Mantenimiento'
                    };
                    
                    const total = Object.values(roomStatus.rooms_by_status).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={status}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700 font-medium">{labels[status]}</span>
                          <span className="text-gray-900 font-bold">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${colors[status]} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>

            {/* Rooms by Type */}
            <Card>
              <Card.Header>
                <h2 className="text-xl font-bold text-gray-800">
                  Habitaciones por Tipo
                </h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {roomStatus.rooms_by_type && Object.entries(roomStatus.rooms_by_type).map(([type, count]) => {
                    const labels = {
                      single: 'Individual',
                      double: 'Doble',
                      suite: 'Suite',
                      deluxe: 'Deluxe',
                      presidential: 'Presidencial'
                    };
                    
                    const total = Object.values(roomStatus.rooms_by_type).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={type}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700 font-medium">{labels[type] || type}</span>
                          <span className="text-gray-900 font-bold">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Today's Activity */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <Card.Header>
              <h2 className="text-xl font-bold text-gray-800">
                Actividad de Hoy
              </h2>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Check-ins</p>
                  <p className="text-4xl font-bold text-primary">
                    {stats.checkins_today}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-600 text-sm mb-2">Check-outs</p>
                  <p className="text-4xl font-bold text-primary">
                    {stats.checkouts_today}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-600 text-sm mb-2">Nuevas Reservas</p>
                  <p className="text-4xl font-bold text-primary">
                    {stats.new_reservations_today || 0}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Reports;
