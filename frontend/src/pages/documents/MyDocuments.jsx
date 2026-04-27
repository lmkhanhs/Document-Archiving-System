import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  getFilesByFolderId,
  getFoldersByParentId,
  previewDocument,
  getRootFiles,
  getRootFolders,
  uploadDocument,
} from "../../services/documentService";

const sidebarItems = [
  { key: "home", label: "Trang chủ", icon: HomeOutlinedIcon },
  { key: "documents", label: "Tài liệu của tôi", icon: FolderOpenOutlinedIcon },
  { key: "upload", label: "Tải lên tài liệu", icon: UploadFileOutlinedIcon },
  { key: "trash", label: "Thùng rác", icon: DeleteOutlineOutlinedIcon },
  { key: "settings", label: "Cài đặt", icon: SettingsOutlinedIcon },
];

const VIEW_MODE = {
  LIST: "list",
  GRID: "grid",
};

const ROOT_CRUMB = { id: null, name: "Root" };

const PREVIEW_KIND = {
  PDF: "pdf",
  IMAGE: "image",
  TEXT: "text",
  OFFICE: "office",
  UNSUPPORTED: "unsupported",
};

const TEXT_EXTENSIONS = new Set([
  "txt", "md", "json", "js", "jsx", "ts", "tsx", "html", "css", "scss", "less",
  "xml", "yml", "yaml", "java", "py", "go", "c", "cpp", "h", "hpp", "sql", "log", "csv",
]);

const OFFICE_EXTENSIONS = new Set(["doc", "docx", "xls", "xlsx", "ppt", "pptx"]);

const extractCollection = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  if (Array.isArray(payload?.folders)) {
    return payload.folders;
  }

  if (Array.isArray(payload?.files)) {
    return payload.files;
  }

  return [];
};

const getDateValue = (item = {}) => (
  item.updatedAt
  || item.lastModifiedAt
  || item.modifiedAt
  || item.createdAt
  || null
);

const getFileSizeValue = (item = {}) => {
  const raw = item.fileSize ?? item.size ?? item.sizeBytes ?? null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined) {
    return "-";
  }

  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / (1024 ** index);

  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const normalizeFolder = (folder) => ({
  id: folder.id || folder.folderId || `folder-${folder.name}`,
  type: "folder",
  name: folder.name || "Thư mục chưa đặt tên",
  dateModified: getDateValue(folder),
  fileSize: null,
});

const normalizeFile = (file) => ({
  id: file.id || file.fileId || `file-${file.name}`,
  type: "file",
  name: file.name || file.fileName || "Tệp chưa đặt tên",
  dateModified: getDateValue(file),
  fileSize: getFileSizeValue(file),
  mimeType: file.type || file.fileType || "",
  fileUrl: file.url || "",
});

const getFileExtension = (fileName = "") => {
  const normalized = String(fileName).trim();
  const index = normalized.lastIndexOf(".");
  if (index < 0 || index === normalized.length - 1) {
    return "";
  }

  return normalized.slice(index + 1).toLowerCase();
};

const detectPreviewKind = ({ name = "", mimeType = "" }) => {
  const extension = getFileExtension(name);
  const mime = String(mimeType).toLowerCase();

  if (mime.includes("pdf") || extension === "pdf") {
    return PREVIEW_KIND.PDF;
  }

  if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(extension)) {
    return PREVIEW_KIND.IMAGE;
  }

  if (mime.startsWith("text/") || mime.includes("json") || TEXT_EXTENSIONS.has(extension)) {
    return PREVIEW_KIND.TEXT;
  }

  if (
    mime.includes("word")
    || mime.includes("excel")
    || mime.includes("spreadsheet")
    || mime.includes("powerpoint")
    || mime.includes("presentation")
    || OFFICE_EXTENSIONS.has(extension)
  ) {
    return PREVIEW_KIND.OFFICE;
  }

  return PREVIEW_KIND.UNSUPPORTED;
};

const normalizePathNode = (node, index) => {
  if (typeof node === "string") {
    return {
      id: index === 0 ? null : node,
      name: node || (index === 0 ? "Root" : "Folder"),
    };
  }

  return {
    id: node?.id ?? node?.folderId ?? (index === 0 ? null : null),
    name: node?.name || node?.label || node?.title || (index === 0 ? "Root" : "Folder"),
  };
};

const buildBreadcrumbs = (payload, fallback = [ROOT_CRUMB]) => {
  const rawPath = payload?.path || payload?.breadcrumbs || payload?.breadcrumb;
  const pathItems = Array.isArray(rawPath)
    ? rawPath
    : Array.isArray(rawPath?.items)
      ? rawPath.items
      : [];

  if (pathItems.length === 0) {
    return fallback;
  }

  const normalized = pathItems.map(normalizePathNode).filter((item) => Boolean(item?.name));

  if (normalized.length === 0) {
    return fallback;
  }

  const firstName = String(normalized[0].name || "").toLowerCase();
  if (normalized[0].id !== null && firstName !== "root") {
    return [ROOT_CRUMB, ...normalized];
  }

  return normalized;
};

const MyDocuments = () => {
  const navigate = useNavigate();
  const uploadInputRef = useRef(null);

  const [activeMenu, setActiveMenu] = useState("documents");
  const [viewMode, setViewMode] = useState(VIEW_MODE.LIST);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([ROOT_CRUMB]);
  const [previewState, setPreviewState] = useState({
    open: false,
    loading: false,
    error: "",
    name: "",
    kind: PREVIEW_KIND.UNSUPPORTED,
    objectUrl: "",
    textContent: "",
  });

  const loadDocuments = useCallback(async ({ folderId = null, fallbackPath = [ROOT_CRUMB] } = {}) => {
    setIsLoading(true);
    setError("");

    try {
      let nextFolders = [];
      let nextFiles = [];
      let nextPath = fallbackPath;

      if (folderId === null || folderId === undefined) {
        const [folderPayload, filePayload] = await Promise.all([
          getRootFolders(),
          getRootFiles(),
        ]);

        nextFolders = extractCollection(folderPayload).map(normalizeFolder);
        nextFiles = extractCollection(filePayload).map(normalizeFile);
        nextPath = buildBreadcrumbs(folderPayload || filePayload, [ROOT_CRUMB]);
      } else {
        const [folderPayload, filePayload] = await Promise.all([
          getFoldersByParentId(folderId),
          getFilesByFolderId(folderId),
        ]);

        // Backend returns child folders/files as direct array in data.
        nextFolders = extractCollection(folderPayload).map(normalizeFolder);
        nextFiles = extractCollection(filePayload).map(normalizeFile);
        nextPath = buildBreadcrumbs(folderPayload, fallbackPath);
      }

      setFolders(nextFolders);
      setFiles(nextFiles);
      setCurrentFolderId(folderId ?? null);
      setBreadcrumbs(nextPath);
    } catch (requestError) {
      setError(requestError.message || "Không thể tải danh sách tài liệu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => () => {
    if (previewState.objectUrl) {
      URL.revokeObjectURL(previewState.objectUrl);
    }
  }, [previewState.objectUrl]);

  const allDocuments = useMemo(() => {
    const merged = [...folders, ...files];

    return merged.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }

      const first = a.dateModified ? new Date(a.dateModified).getTime() : 0;
      const second = b.dateModified ? new Date(b.dateModified).getTime() : 0;
      return second - first;
    });
  }, [folders, files]);

  const isListMode = viewMode === VIEW_MODE.LIST;

  const openUploadDialog = () => {
    uploadInputRef.current?.click();
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      await uploadDocument({ file, folderId: currentFolderId });
      setToast("Tải file thành công");
      await loadDocuments({ folderId: currentFolderId, fallbackPath: breadcrumbs });
    } catch (uploadError) {
      setToast(uploadError.message || "Tải file thất bại");
    } finally {
      event.target.value = "";
      setIsUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    setToast("Tạo thư mục sẽ được nối API ở bước tiếp theo");
  };

  const openFolder = (folder) => {
    if (!folder?.id) {
      return;
    }

    loadDocuments({
      folderId: folder.id,
      fallbackPath: [...breadcrumbs, { id: folder.id, name: folder.name }],
    });
  };

  const closePreview = () => {
    setPreviewState((prev) => {
      if (prev.objectUrl) {
        URL.revokeObjectURL(prev.objectUrl);
      }

      return {
        open: false,
        loading: false,
        error: "",
        name: "",
        kind: PREVIEW_KIND.UNSUPPORTED,
        objectUrl: "",
        textContent: "",
      };
    });
  };

  const openFilePreview = async (file) => {
    if (!file?.id) {
      setToast("Không thể xem trước file này");
      return;
    }

    setPreviewState({
      open: true,
      loading: true,
      error: "",
      name: file.name || "File",
      kind: PREVIEW_KIND.UNSUPPORTED,
      objectUrl: "",
      textContent: "",
    });

    try {
      const { blob, contentType } = await previewDocument(file.id);
      const kind = detectPreviewKind({
        name: file.name,
        mimeType: contentType || file.mimeType,
      });

      if (kind === PREVIEW_KIND.UNSUPPORTED) {
        setPreviewState((prev) => ({
          ...prev,
          loading: false,
          error: "Không hỗ trợ xem trước file này",
          kind,
        }));
        return;
      }

      if (kind === PREVIEW_KIND.TEXT) {
        const textContent = await blob.text();
        setPreviewState((prev) => ({
          ...prev,
          loading: false,
          kind,
          textContent,
        }));
        return;
      }

      const objectUrl = URL.createObjectURL(blob);

      setPreviewState((prev) => ({
        ...prev,
        loading: false,
        kind,
        objectUrl,
      }));
    } catch (previewError) {
      setPreviewState((prev) => ({
        ...prev,
        loading: false,
        error: previewError.message || "Không thể xem trước file",
      }));
    }
  };

  const onClickCrumb = (crumb, index) => {
    if (index === 0 || crumb.id === null || crumb.id === undefined) {
      loadDocuments({ folderId: null, fallbackPath: [ROOT_CRUMB] });
      return;
    }

    loadDocuments({
      folderId: crumb.id,
      fallbackPath: breadcrumbs.slice(0, index + 1),
    });
  };

  const onRefresh = () => {
    loadDocuments({ folderId: currentFolderId, fallbackPath: breadcrumbs });
  };

  const handleSidebarClick = (menuKey) => {
    setActiveMenu(menuKey);

    if (menuKey === "home") {
      navigate("/");
      return;
    }

    if (menuKey === "documents") {
      navigate("/documents");
      return;
    }

    if (menuKey === "upload") {
      openUploadDialog();
      return;
    }

    if (menuKey === "trash") {
      setToast("Mục Thùng rác sẽ được triển khai ở bước tiếp theo");
      return;
    }

    if (menuKey === "settings") {
      setToast("Mục Cài đặt sẽ được triển khai ở bước tiếp theo");
    }
  };

  const folderCount = folders.length;
  const fileCount = files.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white p-3 md:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_20px_65px_rgba(27,78,163,0.12)]">
        <aside className="flex w-full flex-col gap-4 border-b border-slate-200 bg-slate-50/70 p-4 md:w-20 md:border-b-0 md:border-r lg:w-64">
          <div className="flex items-center gap-3 px-1">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 text-lg font-extrabold text-white">
              D
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Workspace
              </div>
              <div className="text-sm font-bold text-slate-700">Document Management System</div>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
            {sidebarItems.map((item) => {
              const isActive = activeMenu === item.key;
              const MenuIcon = item.icon;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSidebarClick(item.key)}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                    isActive
                      ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <MenuIcon fontSize="small" />
                  <span className="truncate text-sm font-semibold md:hidden lg:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-blue-100 bg-white p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">Quick Actions</div>
            <div className="mt-2 space-y-2">
              <button
                type="button"
                onClick={openUploadDialog}
                disabled={isUploading}
                className="flex w-full items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <CloudUploadOutlinedIcon fontSize="small" />
                <span className="md:hidden lg:inline">{isUploading ? "Đang tải..." : "Tải lên file"}</span>
              </button>
              <button
                type="button"
                onClick={handleCreateFolder}
                className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <CreateNewFolderOutlinedIcon fontSize="small" />
                <span className="md:hidden lg:inline">Tạo thư mục</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <header className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Tài liệu của tôi</h1>
              <p className="mt-1 text-sm text-slate-500">
                Quản lý thư mục và tệp với điều hướng phân cấp theo cấu trúc thư mục.
              </p>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshOutlinedIcon fontSize="small" />
              Làm mới
            </button>
          </header>

          <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode(VIEW_MODE.LIST)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isListMode
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <ViewListOutlinedIcon fontSize="small" />
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode(VIEW_MODE.GRID)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  !isListMode
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <GridViewOutlinedIcon fontSize="small" />
                Grid
              </button>
            </div>

            <div className="text-sm text-slate-500">Tổng: {allDocuments.length} mục</div>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-1 text-sm text-slate-600">
              {breadcrumbs.map((segment, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <div key={`${segment.id ?? "root"}-${segment.name}-${index}`} className="inline-flex items-center gap-1">
                    {index === 0 ? <HomeOutlinedIcon fontSize="inherit" /> : null}
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => onClickCrumb(segment, index)}
                      className={`rounded px-1.5 py-0.5 transition ${
                        isLast
                          ? "cursor-default font-semibold text-slate-800"
                          : "text-blue-700 hover:bg-blue-50"
                      }`}
                    >
                      {segment.name}
                    </button>
                    {!isLast && <ChevronRightOutlinedIcon fontSize="inherit" className="text-slate-400" />}
                  </div>
                );
              })}
            </div>
          </section>

          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : isListMode ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Date modified</th>
                    <th className="px-4 py-3 text-right">File size</th>
                  </tr>
                </thead>
                <tbody>
                  {allDocuments.map((item) => (
                    <tr
                      key={`${item.type}-${item.id}`}
                      className={`border-t border-slate-100 ${item.type === "folder" ? "cursor-pointer hover:bg-blue-50/50" : ""}`}
                      onClick={item.type === "folder" ? () => openFolder(item) : () => openFilePreview(item)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                          {item.type === "folder" ? (
                            <FolderOutlinedIcon className="text-amber-600" fontSize="small" />
                          ) : (
                            <DescriptionOutlinedIcon className="text-blue-600" fontSize="small" />
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(item.dateModified)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600">{formatFileSize(item.fileSize)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {allDocuments.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={item.type === "folder" ? () => openFolder(item) : () => openFilePreview(item)}
                  className={`rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition ${
                    item.type === "folder" ? "hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                    {item.type === "folder" ? (
                      <FolderOutlinedIcon className="text-amber-600" fontSize="small" />
                    ) : (
                      <DescriptionOutlinedIcon className="text-blue-600" fontSize="small" />
                    )}
                    <span className="truncate">{item.name}</span>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">Date modified</div>
                  <div className="text-sm text-slate-700">{formatDate(item.dateModified)}</div>

                  <div className="mt-2 text-xs text-slate-500">File size</div>
                  <div className="text-sm text-slate-700">{formatFileSize(item.fileSize)}</div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && allDocuments.length === 0 && !error && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-medium text-slate-600">
              Chưa có tài liệu nào trong thư mục hiện tại.
            </div>
          )}

          <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Folders</div>
              <div className="mt-2 text-2xl font-bold text-slate-800">{folderCount}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Files</div>
              <div className="mt-2 text-2xl font-bold text-slate-800">{fileCount}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Total items</div>
              <div className="mt-2 text-2xl font-bold text-slate-800">{allDocuments.length}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Current folder</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FolderOpenOutlinedIcon fontSize="small" />
                <span className="truncate">{breadcrumbs[breadcrumbs.length - 1]?.name || "Root"}</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      <input ref={uploadInputRef} type="file" hidden onChange={handleUpload} />

      {previewState.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-3">
          <div className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">Xem trước file</div>
                <div className="text-xs text-slate-500">{previewState.name}</div>
              </div>
              <button
                type="button"
                onClick={closePreview}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50"
              >
                <CloseOutlinedIcon fontSize="small" />
              </button>
            </div>

            <div className="min-h-0 flex-1 bg-slate-50 p-3">
              {previewState.loading && (
                <div className="grid h-full place-items-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600">
                  Đang tải nội dung file...
                </div>
              )}

              {!previewState.loading && previewState.error && (
                <div className="grid h-full place-items-center rounded-xl border border-amber-100 bg-amber-50 text-sm font-semibold text-amber-800">
                  {previewState.error}
                </div>
              )}

              {!previewState.loading && !previewState.error && previewState.kind === PREVIEW_KIND.PDF && previewState.objectUrl && (
                <iframe
                  title="PDF Preview"
                  src={previewState.objectUrl}
                  className="h-full w-full rounded-xl border border-slate-200 bg-white"
                />
              )}

              {!previewState.loading && !previewState.error && previewState.kind === PREVIEW_KIND.IMAGE && previewState.objectUrl && (
                <div className="grid h-full place-items-center rounded-xl border border-slate-200 bg-white p-3">
                  <img
                    src={previewState.objectUrl}
                    alt={previewState.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}

              {!previewState.loading && !previewState.error && previewState.kind === PREVIEW_KIND.TEXT && (
                <pre className="h-full overflow-auto rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
                  {previewState.textContent}
                </pre>
              )}

              {!previewState.loading && !previewState.error && previewState.kind === PREVIEW_KIND.OFFICE && previewState.objectUrl && (
                <div className="h-full rounded-xl border border-slate-200 bg-white p-2">
                  <iframe
                    title="Office Preview"
                    src={previewState.objectUrl}
                    className="h-full w-full rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default MyDocuments;
