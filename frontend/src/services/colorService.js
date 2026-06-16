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

export const getColors = async () => {
  try {
    const response = await api.get("/colors");
    return parseApiResponse(response, "Không thể tải danh sách màu");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải danh sách màu");
  }
};

export const getColorSummary = async () => {
  try {
    const response = await api.get("/colors/summary");
    return parseApiResponse(response, "Không thể tải bảng màu");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải bảng màu");
  }
};
