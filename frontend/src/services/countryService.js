import api from './api';

const countryService = {
  getStatistics: async () => {
    const response = await api.get('/countries/statistics');
    return response.data;
  },

  getAdminCountries: async (page = 0, size = 6, keyword = "") => {
    const response = await api.get('/countries/admin', {
      params: { page, size, keyword }
    });
    return response.data;
  },

  
  // Bạn có thể thêm các hàm gọi API liên quan đến country tại đây
  // ví dụ:
  // getAllCountries: async () => {
  //   const response = await api.get('/countries');
  //   return response.data;
  // },
};

export default countryService;
