import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import SearchBar from '../../components/common/SearchBar';
import { roomService } from '../../services/roomService';
import { formatCurrency } from '../../utils/formatters';
import { isValidRoomNumber, isValidPrice, isValidCapacity } from '../../utils/validators';
import toast from 'react-hot-toast';

/**
 * RoomManagement Page - Gestión de habitaciones para admin
 */
const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [roomData, setRoomData] = useState({
    room_number: '',
    type: 'single',
    price_per_night: '',
    capacity: '2',
    floor: '1',
    description: '',
    status: 'available'
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await roomService.getAllRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error al cargar habitaciones:', error);
      toast.error('Error al cargar habitaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setRoomData({
        room_number: room.room_number,
        type: room.type,
        price_per_night: room.price_per_night,
        capacity: room.capacity,
        floor: room.floor,
        description: room.description || '',
        status: room.status
      });
    } else {
      setEditingRoom(null);
      setRoomData({
        room_number: '',
        type: 'single',
        price_per_night: '',
        capacity: '2',
        floor: '1',
        description: '',
        status: 'available'
      });
    }
    setErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingRoom(null);
    setRoomData({
      room_number: '',
      type: 'single',
      price_per_night: '',
      capacity: '2',
      floor: '1',
      description: '',
      status: 'available'
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!isValidRoomNumber(roomData.room_number)) {
      newErrors.room_number = 'Número de habitación inválido';
    }
    
    if (!isValidPrice(roomData.price_per_night)) {
      newErrors.price_per_night = 'Precio inválido';
    }
    
    if (!isValidCapacity(roomData.capacity)) {
      newErrors.capacity = 'Capacidad inválida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const dataToSend = {
        ...roomData,
        price_per_night: parseFloat(roomData.price_per_night),
        capacity: parseInt(roomData.capacity),
        floor: parseInt(roomData.floor)
      };
      
      if (editingRoom) {
        await roomService.updateRoom(editingRoom.id, dataToSend);
        toast.success('Habitación actualizada');
      } else {
        await roomService.createRoom(dataToSend);
        toast.success('Habitación creada');
      }
      
      await fetchRooms();
      handleCloseModal();
      
    } catch (error) {
      console.error('Error al guardar habitación:', error);
      toast.error(error.response?.data?.detail || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`¿Estás seguro de eliminar la habitación #${room.room_number}?`)) {
      return;
    }
    
    try {
      await roomService.deleteRoom(room.id);
      toast.success('Habitación eliminada');
      await fetchRooms();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar habitación');
    }
  };

  const handleChangeStatus = async (room, newStatus) => {
    try {
      await roomService.updateRoomStatus(room.id, newStatus);
      toast.success('Estado actualizado');
      await fetchRooms();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.room_number.toString().includes(searchQuery) ||
    room.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      cleaning: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      available: 'Disponible',
      occupied: 'Ocupada',
      cleaning: 'Limpieza',
      maintenance: 'Mantenimiento'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return <Loading text="Cargando habitaciones..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gestión de Habitaciones
          </h1>
          <p className="text-gray-600">
            {rooms.length} habitaciones en total
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <FiPlus className="w-5 h-5" />
          Nueva Habitación
        </Button>
      </div>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Buscar por número o tipo..."
      />

      {/* Rooms Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Precio/Noche
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Capacidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Piso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRooms.map((room) => (
              <tr key={room.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                  #{room.room_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">
                  {room.type.replace('_', ' ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {formatCurrency(room.price_per_night)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {room.capacity} personas
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {room.floor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={room.status}
                    onChange={(e) => handleChangeStatus(room, e.target.value)}
                    className="text-xs border-0 bg-transparent font-semibold"
                  >
                    <option value="available">Disponible</option>
                    <option value="occupied">Ocupada</option>
                    <option value="cleaning">Limpieza</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(room)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(room)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingRoom ? 'Editar Habitación' : 'Nueva Habitación'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Número de Habitación"
              name="room_number"
              value={roomData.room_number}
              onChange={handleChange}
              error={errors.room_number}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={roomData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                required
              >
                <option value="single">Individual</option>
                <option value="double">Doble</option>
                <option value="suite">Suite</option>
                <option value="deluxe">Deluxe</option>
                <option value="presidential">Presidencial</option>
              </select>
            </div>
            
            <Input
              label="Precio por Noche"
              name="price_per_night"
              type="number"
              step="0.01"
              value={roomData.price_per_night}
              onChange={handleChange}
              error={errors.price_per_night}
              required
            />
            
            <Input
              label="Capacidad"
              name="capacity"
              type="number"
              value={roomData.capacity}
              onChange={handleChange}
              error={errors.capacity}
              required
            />
            
            <Input
              label="Piso"
              name="floor"
              type="number"
              value={roomData.floor}
              onChange={handleChange}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="status"
                value={roomData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="available">Disponible</option>
                <option value="occupied">Ocupada</option>
                <option value="cleaning">Limpieza</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={roomData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Descripción de la habitación..."
            />
          </div>
          
          <Modal.Footer>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              {editingRoom ? 'Actualizar' : 'Crear'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default RoomManagement;
