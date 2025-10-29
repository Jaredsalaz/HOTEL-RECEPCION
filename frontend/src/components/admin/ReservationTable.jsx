import { useState } from 'react';
import { FiEye, FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { formatDate, formatCurrency } from '../../utils/formatters';

/**
 * ReservationTable Component - Tabla de reservaciones con acciones
 * @param {array} reservations - Array de reservaciones
 * @param {function} onView - Callback para ver detalles
 * @param {function} onEdit - Callback para editar
 * @param {function} onCancel - Callback para cancelar
 * @param {function} onCheckIn - Callback para check-in
 * @param {function} onCheckOut - Callback para check-out
 * @param {boolean} loading - Estado de carga
 */
const ReservationTable = ({ 
  reservations = [], 
  onView,
  onEdit,
  onCancel,
  onCheckIn,
  onCheckOut,
  loading = false
}) => {
  // Detectar si es No-Show
  const isNoShow = (reservation) => {
    return (
      reservation.status === 'Cancelled' && 
      reservation.payment_status === 'Paid' &&
      !reservation.actual_check_in &&
      new Date(reservation.check_in_date) < new Date()
    );
  };

  // Badge de estado
  const getStatusBadge = (status, reservation = null) => {
    // Si es No-Show, mostrar badge especial
    if (reservation && isNoShow(reservation)) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
          Expirada (No-Show)
        </span>
      );
    }

    const badges = {
      Pending: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      Confirmed: { text: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
      Active: { text: 'Activa', color: 'bg-green-100 text-green-800' },
      Completed: { text: 'Completada', color: 'bg-gray-100 text-gray-800' },
      Cancelled: { text: 'Cancelada', color: 'bg-red-100 text-red-800' }
    };

    const badge = badges[status] || badges.Pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reservaciones...</p>
        </div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">No hay reservaciones para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Huésped
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Habitación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-in
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{reservation.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reservation.guest?.first_name} {reservation.guest?.last_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {reservation.guest?.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  #{reservation.room?.room_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(reservation.check_in_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(reservation.check_out_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(reservation.total_price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(reservation.status, reservation)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {/* Ver detalles */}
                    <button
                      onClick={() => onView(reservation)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Ver detalles"
                    >
                      <FiEye className="w-5 h-5" />
                    </button>

                    {/* Check-in (solo si es Pending o Confirmed) */}
                    {(reservation.status === 'Pending' || reservation.status === 'Confirmed') && onCheckIn && (
                      <button
                        onClick={() => onCheckIn(reservation)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Check-in"
                      >
                        <FiCheck className="w-5 h-5" />
                      </button>
                    )}

                    {/* Check-out (solo si es Active) */}
                    {reservation.status === 'Active' && onCheckOut && (
                      <button
                        onClick={() => onCheckOut(reservation)}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                        title="Check-out"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    )}

                    {/* Cancelar (solo si no está Completed o Cancelled) */}
                    {reservation.status !== 'Completed' && reservation.status !== 'Cancelled' && onCancel && (
                      <button
                        onClick={() => onCancel(reservation)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Cancelar"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationTable;
