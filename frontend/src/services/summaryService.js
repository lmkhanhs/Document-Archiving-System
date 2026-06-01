import api from "./api";

const parseApiResponse = (response, fallbackMessage) => {
  const result = response?.data;

  if (!result || typeof result.code !== "number") {
    throw new Error(fallbackMessage);
  }

  if (result.code < 200 || result.code >= 300) {
    throw new Error(result.message || fallbackMessage);
  }

  return result.data;
};

export const fetchSummaryStatistics = async () => {
  try {
    const response = await api.get("/summaries/statistics");
    return parseApiResponse(response, "Không thể tải thống kê lịch sử tóm tắt");
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Không thể tải thống kê lịch sử tóm tắt");
  }
};
