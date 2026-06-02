import api from "./api";

export const statisticsService = {
  getOverview: async () => {
    try {
      const response = await api.get("/admin/statistics/overview");
      // The API returns ApiResponse<OverviewStatisticsResponse>
      // Assuming api.js already handles extracting the data or we need to extract it
      if (response?.data?.code >= 200 && response?.data?.code < 300) {
        return response.data.data;
      }
      throw new Error(response?.data?.message || "Lỗi lấy dữ liệu thống kê tổng quan");
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Lỗi kết nối đến server");
    }
  },
};
