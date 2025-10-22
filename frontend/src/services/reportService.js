import api from './api';

export const reportService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  // Download occupancy PDF
  downloadOccupancyPDF: async (startDate, endDate) => {
    const response = await api.get('/reports/occupancy/pdf', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `occupancy_report_${startDate}_${endDate}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Download occupancy Excel
  downloadOccupancyExcel: async (startDate, endDate) => {
    const response = await api.get('/reports/occupancy/excel', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `occupancy_report_${startDate}_${endDate}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Get room status report
  getRoomStatusReport: async () => {
    const response = await api.get('/reports/rooms-status');
    return response.data;
  },

  // Get occupancy rate
  getOccupancyRate: async () => {
    const response = await api.get('/reports/occupancy-rate');
    return response.data;
  },
};

export default reportService;
