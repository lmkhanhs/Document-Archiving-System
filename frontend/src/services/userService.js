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

export const getUsers = async () => {
  try {
    const response = await api.get("/users");
    return parseApiResponse(response, "Khong the tai danh sach nguoi dung");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the tai danh sach nguoi dung");
  }
};

export const getDeletedUsers = async () => {
  try {
    const response = await api.get("/users/deleted");
    return parseApiResponse(response, "Khong the tai danh sach nguoi dung da xoa");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the tai danh sach nguoi dung da xoa");
  }
};

export const searchUsers = async (keyword) => {
  try {
    const response = await api.get("/users/search", {
      params: { keyword },
    });
    return parseApiResponse(response, "Khong the tim kiem nguoi dung");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the tim kiem nguoi dung");
  }
};

export const filterUsers = async ({ role, status }) => {
  try {
    const response = await api.get("/users/filter", {
      params: {
        role,
        status,
      },
    });
    return parseApiResponse(response, "Khong the loc nguoi dung");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the loc nguoi dung");
  }
};

export const updateUserRole = async (userId, roles) => {
  try {
    const response = await api.put(`/users/${userId}/roles`, roles);
    return parseApiResponse(response, "Khong the cap nhat vai tro");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the cap nhat vai tro");
  }
};

export const updateUserStatus = async (userId, active) => {
  try {
    const response = await api.put(`/users/${userId}/status`, null, {
      params: { isActive: active },
    });
    return parseApiResponse(response, "Khong the cap nhat trang thai");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the cap nhat trang thai");
  }
};

export const softDeleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}/soft`);
    return parseApiResponse(response, "Khong the xoa mem nguoi dung");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the xoa mem nguoi dung");
  }
};

export const hardDeleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}/hard`);
    return parseApiResponse(response, "Khong the xoa vinh vien nguoi dung");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the xoa vinh vien nguoi dung");
  }
};

export const restoreUser = async (userId) => {
  try {
    const response = await api.put(`/users/${userId}/restore`);
    return parseApiResponse(response, "Khong the khoi phuc nguoi dung");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the khoi phuc nguoi dung");
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
