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
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryMode, setGalleryMode] = useState('url'); // 'url' or 'upload'
  
  const [roomData, setRoomData] = useState({
    room_number: '',
    type: 'Single',
    price_per_night: '',
    capacity: '2',
    floor: '1',
    description: '',
    status: 'Available',
    amenities: [],
    image_url: '',
    gallery_images: []
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
        status: room.status,
        amenities: room.amenities || [],
        image_url: room.image_url || '',
        gallery_images: room.images?.map(img => img.image_url) || []
      });
    } else {
      setEditingRoom(null);
      setRoomData({
        room_number: '',
        type: 'Single',
        price_per_night: '',
        capacity: '2',
        floor: '1',
        description: '',
        status: 'Available',
        amenities: [],
        image_url: '',
        gallery_images: []
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
      type: 'Single',
      price_per_night: '',
      capacity: '2',
      floor: '1',
      description: '',
      status: 'Available',
      amenities: [],
      image_url: '',
      gallery_images: []
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

  // Manejar amenities (comodidades)
  const availableAmenities = [
    'WiFi',
    'TV',
    'Aire Acondicionado',
    'Minibar',
    'Caja Fuerte',
    'Balcón',
    'Vista al Mar',
    'Jacuzzi',
    'Escritorio',
    'Cafetera',
    'Servicio a Habitación',
    'Secadora de Pelo'
  ];

  const toggleAmenity = (amenity) => {
    setRoomData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Manejar imágenes de galería
  const addGalleryImage = () => {
    setGalleryModalOpen(true);
  };

  const addGalleryImageByURL = () => {
    const url = prompt('Ingresa la URL de la imagen:');
    if (url && url.trim()) {
      setRoomData(prev => ({
        ...prev,
        gallery_images: [...prev.gallery_images, url.trim()]
      }));
      setGalleryModalOpen(false);
    }
  };

  const addGalleryImageByUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRoomData(prev => ({
          ...prev,
          gallery_images: [...prev.gallery_images, reader.result]
        }));
        setGalleryModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeGalleryImage = (index) => {
    setRoomData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
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
                <option value="Single">Individual</option>
                <option value="Double">Doble</option>
                <option value="Suite">Suite</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Presidential">Presidencial</option>
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

          {/* Comodidades (Amenities) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Comodidades
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableAmenities.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={roomData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
            {roomData.amenities.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {roomData.amenities.length} comodidad{roomData.amenities.length > 1 ? 'es' : ''} seleccionada{roomData.amenities.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Imagen Principal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Imagen Principal
            </label>
            
            {/* Selector de modo: URL o Subir archivo */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setRoomData(prev => ({ ...prev, imageUploadMode: 'url' }))}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  (roomData.imageUploadMode || 'url') === 'url'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}
              >
                🔗 URL
              </button>
              <button
                type="button"
                onClick={() => setRoomData(prev => ({ ...prev, imageUploadMode: 'upload' }))}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  roomData.imageUploadMode === 'upload'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}
              >
                📤 Subir Imagen
              </button>
            </div>

            {/* Modo URL */}
            {(roomData.imageUploadMode || 'url') === 'url' ? (
              <Input
                name="image_url"
                type="url"
                value={roomData.image_url}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            ) : (
              /* Modo Subir archivo */
              <div>
                <label className="block w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Convert to base64 or upload to server
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setRoomData(prev => ({ ...prev, image_url: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <FiPlus className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click para seleccionar imagen</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP hasta 10MB</span>
                  </div>
                </label>
              </div>
            )}

            {/* Preview de la imagen */}
            {roomData.image_url && (
              <div className="mt-3 relative">
                <img
                  src={roomData.image_url}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Imagen+No+Disponible';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setRoomData(prev => ({ ...prev, image_url: '' }))}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  title="Eliminar imagen"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Galería de Imágenes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Galería de Imágenes
            </label>
            
            {/* Botones para agregar imágenes */}
            <div className="flex gap-2 mb-3">
              <Button
                type="button"
                variant="secondary"
                onClick={addGalleryImageByURL}
                className="flex-1"
              >
                🔗 Agregar por URL
              </Button>
              <label className="flex-1 cursor-pointer">
                <div className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium text-gray-700">
                  📤 Subir Imagen
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={addGalleryImageByUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Grid de imágenes */}
            {roomData.gallery_images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {roomData.gallery_images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Galería ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x150?text=Error';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {roomData.gallery_images.length} imagen{roomData.gallery_images.length !== 1 ? 'es' : ''} en la galería
            </p>
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
