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
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  getTrashFiles,
  getTrashFolders,
  restoreFile,
  restoreFolder,
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

const CONTEXT_ACTIONS = [
  { key: "restore", label: "Khôi phục" },
  { key: "delete", label: "Xóa vĩnh viễn" },
];

const TEXT_EXTENSIONS = new Set([
  "txt", "md", "json", "js", "jsx", "ts", "tsx", "html", "css", "scss", "less",
  "xml", "yml", "yaml", "java", "py", "go", "c", "cpp", "h", "hpp", "sql", "log", "csv",
]);

const OFFICE_EXTENSIONS = new Set(["doc", "docx", "xls", "xlsx", "ppt", "pptx"]);
const WORD_EXTENSIONS = new Set(["doc", "docx"]);
const EXCEL_EXTENSIONS = new Set(["xls", "xlsx", "csv"]);
const POWERPOINT_EXTENSIONS = new Set(["ppt", "pptx"]);
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"]);

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
  item.deletedAt
  || item.removedAt
  || item.trashedAt
  || item.updatedAt
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
  dateDeleted: getDateValue(folder),
  fileSize: null,
});

const normalizeFile = (file) => ({
  id: file.id || file.fileId || `file-${file.name}`,
  type: "file",
  name: file.name || file.fileName || "Tệp chưa đặt tên",
  dateDeleted: getDateValue(file),
  fileSize: getFileSizeValue(file),
  mimeType: file.type || file.fileType || "",
});

const getFileExtension = (fileName = "") => {
  const normalized = String(fileName).trim();
  const index = normalized.lastIndexOf(".");
  if (index < 0 || index === normalized.length - 1) {
    return "";
  }

  return normalized.slice(index + 1).toLowerCase();
};

const getFileIconMeta = ({ name = "", mimeType = "" }) => {
  const extension = getFileExtension(name);
  const mime = String(mimeType).toLowerCase();

  if (mime.includes("pdf") || extension === "pdf") {
    return {
      Icon: PictureAsPdfOutlinedIcon,
      className: "text-red-600",
    };
  }

  if (WORD_EXTENSIONS.has(extension) || mime.includes("word")) {
    return {
      Icon: ArticleOutlinedIcon,
      className: "text-blue-600",
    };
  }

  if (EXCEL_EXTENSIONS.has(extension) || mime.includes("excel") || mime.includes("spreadsheet")) {
    return {
      Icon: TableChartOutlinedIcon,
      className: "text-emerald-600",
    };
  }

  if (POWERPOINT_EXTENSIONS.has(extension) || mime.includes("powerpoint") || mime.includes("presentation")) {
    return {
      Icon: SlideshowOutlinedIcon,
      className: "text-orange-600",
    };
  }

  if (IMAGE_EXTENSIONS.has(extension) || mime.startsWith("image/")) {
    return {
      Icon: ImageOutlinedIcon,
      className: "text-violet-600",
    };
  }

  if (TEXT_EXTENSIONS.has(extension) || mime.startsWith("text/") || mime.includes("json")) {
    return {
      Icon: CodeOutlinedIcon,
      className: "text-slate-600",
    };
  }

  return {
    Icon: DescriptionOutlinedIcon,
    className: "text-blue-600",
  };
};

const Trash = () => {
  const navigate = useNavigate();
  const uploadInputRef = useRef(null);
  const menuRef = useRef(null);

  const [activeMenu, setActiveMenu] = useState("trash");
  const [viewMode, setViewMode] = useState(VIEW_MODE.LIST);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [menuState, setMenuState] = useState(null);

  const loadTrash = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [folderPayload, filePayload] = await Promise.all([
        getTrashFolders(),
        getTrashFiles(),
      ]);

      setFolders(extractCollection(folderPayload).map(normalizeFolder));
      setFiles(extractCollection(filePayload).map(normalizeFile));
    } catch (requestError) {
      setError(requestError.message || "Không thể tải thùng rác");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!menuState) {
      return undefined;
    }

    const closeMenu = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuState(null);
      }
    };

    window.addEventListener("click", closeMenu);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [menuState]);

  const allItems = useMemo(() => {
    const merged = [...folders, ...files];

    return merged.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }

      const first = a.dateDeleted ? new Date(a.dateDeleted).getTime() : 0;
      const second = b.dateDeleted ? new Date(b.dateDeleted).getTime() : 0;
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
      await uploadDocument({ file });
      setToast("Tải file thành công");
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
      navigate("/trash");
      return;
    }

    if (menuKey === "settings") {
      setToast("Mục Cài đặt sẽ được triển khai ở bước tiếp theo");
    }
  };

  const openContextMenu = (event, item) => {
    event.preventDefault();
    setMenuState({
      x: event.clientX,
      y: event.clientY,
      item,
    });
  };

  const onMenuAction = async (action, item) => {
    setMenuState(null);

    if (action === "restore") {
      if (!item?.id) {
        setToast("Không thể khôi phục mục này");
        return;
      }

      try {
        if (item.type === "folder") {
          await restoreFolder(item.id);
        } else {
          await restoreFile(item.id);
        }

        setToast("Khôi phục thành công");
        await loadTrash();
      } catch (restoreError) {
        setToast(restoreError.message || "Không thể khôi phục");
      }
      return;
    }

    if (action === "delete") {
      setToast("Chưa hỗ trợ xóa vĩnh viễn");
    }
  };

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
              <h1 className="text-2xl font-bold text-slate-800">Thùng rác</h1>
              <p className="mt-1 text-sm text-slate-500">
                Quản lý file và thư mục đã xóa gần đây.
              </p>
            </div>

            <button
              type="button"
              onClick={loadTrash}
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

            <div className="text-sm text-slate-500">Tổng: {allItems.length} mục</div>
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
                    <th className="px-4 py-3">Date deleted</th>
                    <th className="px-4 py-3 text-right">File size</th>
                  </tr>
                </thead>
                <tbody>
                  {allItems.map((item) => {
                    const iconMeta = item.type === "folder"
                      ? { Icon: FolderOutlinedIcon, className: "text-amber-600" }
                      : getFileIconMeta(item);

                    return (
                      <tr
                        key={`${item.type}-${item.id}`}
                        className="cursor-pointer border-t border-slate-100 hover:bg-blue-50/50"
                        onContextMenu={(event) => openContextMenu(event, item)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                            <iconMeta.Icon className={iconMeta.className} fontSize="small" />
                            <span className="truncate">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatDate(item.dateDeleted)}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600">{formatFileSize(item.fileSize)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {allItems.map((item) => {
                const iconMeta = item.type === "folder"
                  ? { Icon: FolderOutlinedIcon, className: "text-amber-600" }
                  : getFileIconMeta(item);

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onContextMenu={(event) => openContextMenu(event, item)}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                      <iconMeta.Icon className={iconMeta.className} fontSize="small" />
                      <span className="truncate">{item.name}</span>
                    </div>

                    <div className="mt-3 text-xs text-slate-500">Date deleted</div>
                    <div className="text-sm text-slate-700">{formatDate(item.dateDeleted)}</div>

                    <div className="mt-2 text-xs text-slate-500">File size</div>
                    <div className="text-sm text-slate-700">{formatFileSize(item.fileSize)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && allItems.length === 0 && !error && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-medium text-slate-600">
              Thùng rác trống.
            </div>
          )}
        </main>
      </div>

      <input ref={uploadInputRef} type="file" hidden onChange={handleUpload} />

      {menuState && (
        <div
          ref={menuRef}
          style={{ left: menuState.x, top: menuState.y }}
          className="fixed z-50 w-48 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          {CONTEXT_ACTIONS.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => onMenuAction(action.key, menuState.item)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
            >
              {action.label}
            </button>
          ))}
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

export default Trash;
