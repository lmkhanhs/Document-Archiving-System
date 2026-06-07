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

export const getAdminFiles = async (page = 0, size = 10) => {
  try {
    const response = await api.get("/files/admin", {
      params: { page, size },
    });
    return parseApiResponse(response, "Khong the tai danh sach tai lieu");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the tai danh sach tai lieu");
  }
};

export const getAdminTrashFiles = async (page = 0, size = 10) => {
  try {
    const response = await api.get("/files/admin/trash", {
      params: { page, size },
    });
    return parseApiResponse(response, "Khong the tai danh sach tai lieu da xoa");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the tai danh sach tai lieu da xoa");
  }
};

export const searchAdminFiles = async ({ fileName = "", uploader = "" } = {}) => {
  try {
    const response = await api.get("/files/admin/search", {
      params: {
        fileName: fileName || undefined,
        uploader: uploader || undefined,
      },
    });
    return parseApiResponse(response, "Khong the tim kiem tai lieu");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the tim kiem tai lieu");
  }
};

export const softDeleteAdminFile = async (fileId) => {
  try {
    const response = await api.delete(`/files/admin/${fileId}`);
    return parseApiResponse(response, "Khong the xoa mem tai lieu");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the xoa mem tai lieu");
  }
};

export const restoreAdminFile = async (fileId) => {
  try {
    const response = await api.put(`/files/admin/restore/${fileId}`);
    return parseApiResponse(response, "Khong the khoi phuc tai lieu");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the khoi phuc tai lieu");
  }
};

export const hardDeleteAdminFile = async (fileId) => {
  try {
    const response = await api.delete(`/files/admin/${fileId}/force`);
    return parseApiResponse(response, "Khong the xoa vinh vien tai lieu");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the xoa vinh vien tai lieu");
  }
};

export const previewAdminFile = async (fileId) => {
  try {
    const response = await api.get(`/files/admin/${fileId}/preview`, {
      responseType: "blob",
    });

    return {
      blob: response.data,
      contentType: response.headers?.["content-type"] || "",
    };
  } catch (error) {
    let message = "Khong the xem truoc tai lieu";
    try {
      const blob = error.response?.data;
      if (blob instanceof Blob) {
        const text = await blob.text();
        const json = JSON.parse(text);
        if (json.message) {
          message = json.message;
        }
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }
};

export const downloadAdminFile = async (fileId) => {
  try {
    const response = await api.get(`/files/admin/${fileId}/download`, {
      responseType: "blob",
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the tai tai lieu");
  }
};

export const getTopUploaders = async () => {
  try {
    const response = await api.get("/admin/documents/top-uploaders");
    return parseApiResponse(response, "Khong the tai danh sach nguoi dung tai len nhieu nhat");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Khong the tai danh sach nguoi dung tai len nhieu nhat");
  }
};
