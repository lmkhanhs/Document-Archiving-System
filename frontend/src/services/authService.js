
import api from "./api";

export const login = async ({ username, password }) => {
  try {
    const response = await api.post("/auth/login", {
      username,
      password,
    });

    const result = response.data;

    if (result.code !== 200) {
      throw new Error(result.message);
    }

    return result.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Đăng nhập thất bại"
    );
  }
};

export const googleLogin = async (idToken) => {
  try {
    const response = await api.post("/auth/google-login", {
      idToken: idToken,
    });

    const result = response.data;

    if (result.code !== 200) {
      throw new Error(result.message);
    }

    return result.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Đăng nhập Google thất bại"
    );
  }
};

export const getInfoUser = async () => {
  try {
    const response = await api.get("/users/info");
    const result = response.data;

    if (result.code !== 200) {
      throw new Error(result.message);
    }

    return result.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy thông tin người dùng");
  }
};

export const logout = async ({ accessToken, refreshToken }) => {
  try {
    const response = await api.post("/auth/logout", {
      accessToken,
      refreshToken,
    });

    const result = response.data;

    if (result.code !== 200) {
      throw new Error(result.message);
    }

    return result.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Đăng xuất thất bại");
  }
};