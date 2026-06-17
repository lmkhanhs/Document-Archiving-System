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

export const getMySummaryHistories = async ({ search = "", type = "ALL", time = "all" } = {}) => {
  try {
    const response = await api.get("/summary-histories/my", {
      params: {
        search: search || undefined,
        type,
        time,
      },
    });
    return parseApiResponse(response, "Không thể tải lịch sử tóm tắt");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải lịch sử tóm tắt");
  }
};

export const getSummaryHistoryDetail = async (id) => {
  try {
    const response = await api.get(`/summary-histories/${id}`);
    return parseApiResponse(response, "Không thể tải chi tiết lịch sử tóm tắt");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải chi tiết lịch sử tóm tắt");
  }
};
