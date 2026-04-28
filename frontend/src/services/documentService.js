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

export const getRootFolders = async () => {
  try {
    const response = await api.get("/folders/root");
    return parseApiResponse(response, "Không thể tải thư mục gốc");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải thư mục gốc");
  }
};

export const getRootFiles = async () => {
  try {
    const response = await api.get("/files/root");
    return parseApiResponse(response, "Không thể tải tệp gốc");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải tệp gốc");
  }
};

export const getFoldersByParentId = async (folderParentId) => {
  try {
    const response = await api.get(`/folders/${folderParentId}`);
    return parseApiResponse(response, "Không thể tải thư mục con");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải thư mục con");
  }
};

export const getFilesByFolderId = async (folderParentId) => {
  try {
    const response = await api.get(`/files/folder/${folderParentId}`);
    return parseApiResponse(response, "Không thể tải tệp trong thư mục");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải tệp trong thư mục");
  }
};

export const getFolderContents = async (folderId) => {
  const candidates = [
    `/folders/${folderId}/contents`,
    `/folders/${folderId}/children`,
    `/folders/${folderId}/documents`,
    `/folders/${folderId}`,
  ];

  let lastError = null;

  for (const endpoint of candidates) {
    try {
      const response = await api.get(endpoint);
      return parseApiResponse(response, "Không thể tải nội dung thư mục");
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;

      if (status && status !== 404) {
        throw new Error(error.response?.data?.message || "Không thể tải nội dung thư mục");
      }
    }
  }

  throw new Error(lastError?.response?.data?.message || "Không thể tải nội dung thư mục");
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

export const renameFolder = async (folderId, name) => {
  try {
    const response = await api.put(`/folders/${folderId}`, { name });
    return parseApiResponse(response, "Không thể đổi tên thư mục");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể đổi tên thư mục");
  }
};

export const deleteFolder = async (folderId) => {
  try {
    const response = await api.delete(`/folders/${folderId}`);
    return parseApiResponse(response, "Không thể xóa thư mục");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể xóa thư mục");
  }
};

export const getTrashFolders = async () => {
  try {
    const response = await api.get("/folders/trash");
    return parseApiResponse(response, "Không thể tải thư mục trong thùng rác");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải thư mục trong thùng rác");
  }
};

export const getTrashFiles = async () => {
  try {
    const response = await api.get("/files/trash");
    return parseApiResponse(response, "Không thể tải file trong thùng rác");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải file trong thùng rác");
  }
};

export const restoreFolder = async (folderId) => {
  try {
    const response = await api.put(`/folders/restore/${folderId}`);
    return parseApiResponse(response, "Không thể khôi phục thư mục");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể khôi phục thư mục");
  }
};

export const restoreFile = async (fileId) => {
  try {
    const response = await api.put(`/files/restore/${fileId}`);
    return parseApiResponse(response, "Không thể khôi phục file");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể khôi phục file");
  }
};

export const deleteTrashFolder = async (folderId) => {
  try {
    const response = await api.delete(`/folders/${folderId}/force`);
    return parseApiResponse(response, "Không thể xóa vĩnh viễn thư mục");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể xóa vĩnh viễn thư mục");
  }
};

export const deleteTrashFile = async (fileId) => {
  try {
    const response = await api.delete(`/files/${fileId}/force`);
    return parseApiResponse(response, "Không thể xóa vĩnh viễn file");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể xóa vĩnh viễn file");
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

export const previewDocument = async (fileId) => {
  try {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: "blob",
    });

    return {
      blob: response.data,
      contentType: response.headers?.["content-type"] || "",
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể xem trước file");
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
