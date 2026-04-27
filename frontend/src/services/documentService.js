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

export const getMyFolders = async () => {
  try {
    const response = await api.get("/folders");
    return parseApiResponse(response, "Không thể tải danh sách thư mục");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải danh sách thư mục");
  }
};

export const createMyFolder = async ({ name, parentId = null }) => {
  try {
    const response = await api.post("/folders", {
      name,
      parentId,
    });
    return parseApiResponse(response, "Không thể tạo thư mục");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tạo thư mục");
  }
};

export const uploadDocument = async ({ file, folderId = null }) => {
  const formData = new FormData();
  formData.append("file", file);

  if (folderId !== null && folderId !== undefined) {
    formData.append("folderId", String(folderId));
  }

  try {
    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return parseApiResponse(response, "Tải file lên thất bại");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Tải file lên thất bại");
  }
};

export const downloadDocument = async (fileId) => {
  try {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: "blob",
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải file");
  }
};

export const getHomeDashboard = async ({
  search = "",
  fileType = "all",
  time = "all",
  owner = "",
  sort = "desc",
} = {}) => {
  try {
    const response = await api.get("/files/home", {
      params: {
        search: search || undefined,
        fileType,
        time,
        owner: owner || undefined,
        sort,
      },
    });

    return parseApiResponse(response, "Không thể tải dữ liệu trang chủ");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải dữ liệu trang chủ");
  }
};
