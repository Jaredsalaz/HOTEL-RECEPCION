import api from './api';

export const checkinService = {
  // Process check-in
  checkIn: async (checkInData) => {
    const response = await api.post('/checkin', checkInData);
    return response.data;
  },

  // Process check-out
  checkOut: async (reservationId) => {
    const response = await api.post('/checkin/checkout', {
      reservation_id: reservationId,
    });
    return response.data;
  },

  // Verify availability
  verifyAvailability: async (roomId, checkIn, checkOut) => {
    const response = await api.get(`/checkin/verify/${roomId}`, {
      params: {
        check_in: checkIn,
        check_out: checkOut,
      },
    });
    return response.data;
  },
};

export default checkinService;
