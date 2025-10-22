import api from './api';

export const roomService = {
  // Get all rooms
  getAllRooms: async () => {
    const response = await api.get('/rooms');
    return response.data;
  },

  // Get room by ID
  getRoomById: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  // Search available rooms
  searchAvailableRooms: async (checkIn, checkOut, roomType = null, minCapacity = null) => {
    const params = {
      check_in: checkIn,
      check_out: checkOut,
    };
    // Capitalize room type (Single, Double, Suite, Deluxe)
    if (roomType) {
      params.room_type = roomType.charAt(0).toUpperCase() + roomType.slice(1).toLowerCase();
    }
    // Convert minCapacity to number and only add if > 0
    if (minCapacity && Number(minCapacity) > 0) {
      params.min_capacity = Number(minCapacity);
    }

    console.log('Params enviados al backend:', params);
    const response = await api.get('/rooms/available/search', { params });
    return response.data;
  },

  // Check room availability
  checkAvailability: async (roomId, checkIn, checkOut) => {
    const response = await api.post('/rooms/check-availability', {
      room_id: roomId,
      check_in_date: checkIn,
      check_out_date: checkOut,
    });
    return response.data;
  },

  // Create room (Admin)
  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  // Update room (Admin)
  updateRoom: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  // Delete room (Admin)
  deleteRoom: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },

  // Get rooms by status
  getRoomsByStatus: async (status) => {
    // Capitalize first letter for backend compatibility
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    const response = await api.get(`/rooms/status/${formattedStatus}`);
    return response.data;
  },

  // Update room status
  updateRoomStatus: async (id, status) => {
    const response = await api.patch(`/rooms/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },
};

export default roomService;
