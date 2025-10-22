import api from './api';

export const reservationService = {
  // Get all reservations
  getAllReservations: async () => {
    const response = await api.get('/reservations');
    return response.data;
  },

  // Get reservation by ID
  getReservationById: async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  // Create reservation
  createReservation: async (reservationData) => {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  },

  // Update reservation
  updateReservation: async (id, updateData) => {
    const response = await api.put(`/reservations/${id}`, updateData);
    return response.data;
  },

  // Cancel reservation
  cancelReservation: async (id) => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  },

  // Get active reservations
  getActiveReservations: async () => {
    const response = await api.get('/reservations/status/active');
    return response.data;
  },

  // Get pending reservations
  getPendingReservations: async () => {
    const response = await api.get('/reservations/status/pending');
    return response.data;
  },

  // Get today's check-ins
  getTodaysCheckIns: async () => {
    const response = await api.get('/reservations/today/checkins');
    return response.data;
  },

  // Get today's check-outs
  getTodaysCheckOuts: async () => {
    const response = await api.get('/reservations/today/checkouts');
    return response.data;
  },

  // Get reservations by room
  getReservationsByRoom: async (roomId) => {
    const response = await api.get(`/reservations/room/${roomId}`);
    return response.data;
  },

  // Get reservations by guest
  getReservationsByGuest: async (guestId) => {
    const response = await api.get(`/reservations/guest/${guestId}`);
    return response.data;
  },
};

export default reservationService;
