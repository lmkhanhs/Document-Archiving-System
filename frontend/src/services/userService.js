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

const tryRequests = async (requests, fallbackMessage) => {
  let lastError = null;

  for (const request of requests) {
    try {
      const response = await request();
      return parseApiResponse(response, fallbackMessage);
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;

      if (status && status !== 404) {
        throw new Error(error.response?.data?.message || fallbackMessage);
      }
    }
  }

  throw new Error(lastError?.response?.data?.message || fallbackMessage);
};

export const getUsers = async () => {
  try {
    const response = await api.get("/users");
    return parseApiResponse(response, "Khong the tai danh sach nguoi dung");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the tai danh sach nguoi dung");
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const payload = { role };

    return await tryRequests([
      () => api.patch(`/users/${userId}/role`, payload),
      () => api.put(`/users/${userId}/role`, payload),
      () => api.patch(`/users/${userId}`, payload),
      () => api.put(`/users/${userId}`, payload),
    ], "Khong the cap nhat vai tro");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the cap nhat vai tro");
  }
};

export const updateUserStatus = async (userId, active) => {
  try {
    const payload = { active };

    return await tryRequests([
      () => api.patch(`/users/${userId}/status`, payload),
      () => api.put(`/users/${userId}/status`, payload),
      () => api.patch(`/users/${userId}/active`, payload),
      () => api.put(`/users/${userId}/active`, payload),
      () => api.patch(`/users/${userId}`, payload),
      () => api.put(`/users/${userId}`, payload),
    ], "Khong the cap nhat trang thai");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the cap nhat trang thai");
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return parseApiResponse(response, "Khong the xoa nguoi dung");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the xoa nguoi dung");
  }
};
