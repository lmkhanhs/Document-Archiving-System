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
    const users = parseApiResponse(response, "Khong the tai danh sach nguoi dung");
    // Đảm bảo mỗi user đều có thuộc tính roles là mảng
    return Array.isArray(users)
      ? users.map((user) => ({
          ...user,
          roles: Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []),
        }))
      : [];
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

// Update user role: expects roleName param (ADMIN or USER)
export const updateUserRole = async (userId, roleName) => {
  try {
    const response = await api.put(`/users/${userId}/roles`, null, {
      params: { roleName },
    });
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

export const getDetailUser = async () => {
  try {
    const response = await api.get("/users/me");
    return parseApiResponse(response, "Không thể lấy chi tiết người dùng");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy chi tiết người dùng");
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await api.put("/users/profile", data);
    return parseApiResponse(response, "Không thể cập nhật hồ sơ");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể cập nhật hồ sơ");
  }
};

export const updateAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.put("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return parseApiResponse(response, "Không thể cập nhật ảnh đại diện");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể cập nhật ảnh đại diện");
  }
};

export const getGenders = async () => {
  try {
    const response = await api.get("/genders");
    return parseApiResponse(response, "Không thể lấy danh sách giới tính");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy danh sách giới tính");
  }
};

export const getCountries = async () => {
  try {
    const response = await api.get("/countries");
    return parseApiResponse(response, "Không thể lấy danh sách quốc gia");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy danh sách quốc gia");
  }
};

export const getUserStatistics = async () => {
  try {
    const response = await api.get("/users/statistics");
    return parseApiResponse(response, "Không thể lấy thống kê người dùng");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy thống kê người dùng");
  }
};

export const getUserDistribution = async () => {
  try {
    const response = await api.get("/users/distribution");
    return parseApiResponse(response, "Không thể lấy phân bổ người dùng");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy phân bổ người dùng");
  }
};

export const getRegistrationGrowth = async (startDate, endDate) => {
  try {
    const response = await api.get("/users/registration-growth", {
      params: { startDate, endDate },
    });
    return parseApiResponse(response, "Không thể lấy dữ liệu tăng trưởng");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy dữ liệu tăng trưởng");
  }
};

export const pingUser = async () => {
  try {
    const response = await api.post("/users/ping");
    return parseApiResponse(response, "Ping thất bại");
  } catch (error) {
    // Không cần ném lỗi nếu ping thất bại để tránh spam console
    console.warn("Ping failed", error.message);
  }
};

export const getActiveUsers = async () => {
  try {
    const response = await api.get("/users/active");
    return parseApiResponse(response, "Không thể lấy danh sách người dùng đang hoạt động");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy danh sách người dùng đang hoạt động");
  }
};

