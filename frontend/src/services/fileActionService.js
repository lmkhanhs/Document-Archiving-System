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

export const renameDocument = async (fileId, name) => {
  try {
    const response = await api.put(`/files/${fileId}`, { name });
    return parseApiResponse(response, "Không thể đổi tên file");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể đổi tên file");
  }
};

export const deleteDocument = async (fileId) => {
  try {
    const response = await api.delete(`/files/${fileId}`);
    return parseApiResponse(response, "Không thể xóa file");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể xóa file");
  }
};
