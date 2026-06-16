import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import CropSquareOutlinedIcon from "@mui/icons-material/CropSquareOutlined";
import FilterNoneOutlinedIcon from "@mui/icons-material/FilterNoneOutlined";
import {
  createMyFolder,
  deleteFolder,
  downloadDocument,
  getFilesByFolderId,
  getFoldersByParentId,
  previewDocument,
  renameFolder,
  getRootFiles,
  getRootFolders,
  uploadDocument,
} from "../../services/documentService";
import { deleteDocument, renameDocument, updateDocumentColor } from "../../services/fileActionService";
import { WS_BASE_URL } from "../../services/api";
import { getColors } from "../../services/colorService";

const sidebarItems = [
  { key: "home", label: "Trang chủ", icon: HomeOutlinedIcon },
  { key: "documents", label: "Tài liệu của tôi", icon: FolderOpenOutlinedIcon },
  { key: "upload", label: "Tải lên tài liệu", icon: UploadFileOutlinedIcon },
  { key: "summarize", label: "Tóm tắt AI", icon: AutoAwesomeOutlinedIcon },
  { key: "color-board", label: "Bảng màu", icon: PaletteOutlinedIcon },
  { key: "trash", label: "Thùng rác", icon: DeleteOutlineOutlinedIcon },
  { key: "settings", label: "Cài đặt", icon: SettingsOutlinedIcon },
];

const VIEW_MODE = {
  LIST: "list",
  GRID: "grid",
};

const CONTEXT_ACTIONS = [
  { key: "rename", label: "Đổi tên" },
  { key: "delete", label: "Xóa" },
];

const QUICK_ACTIONS = [
  { key: "create-folder", label: "Tạo thư mục", icon: CreateNewFolderOutlinedIcon },
  { key: "upload-file", label: "Tải file lên", icon: CloudUploadOutlinedIcon },
  { key: "upload-folder", label: "Tải thư mục lên", icon: FolderOpenOutlinedIcon },
];

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
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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
  color: file.color || null,
  colorCode: file.color?.hexCode || file.colorCode || "",
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

  // Prioritize mimeType from the response — backend converts Office files to PDF,
  // so the actual content-type is application/pdf even if the filename is .docx
  if (mime.includes("pdf")) {
    return PREVIEW_KIND.PDF;
  }

  if (extension === "pdf") {
    return PREVIEW_KIND.PDF;
  }

  if (mime.startsWith("image/") || IMAGE_EXTENSIONS.has(extension)) {
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
  const location = useLocation();
  const uploadInputRef = useRef(null);
  const folderUploadInputRef = useRef(null);
  const menuRef = useRef(null);
  const quickMenuRef = useRef(null);

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
    fileId: null,
    name: "",
    kind: PREVIEW_KIND.UNSUPPORTED,
    objectUrl: "",
    textContent: "",
  });
  const [previewWindowState, setPreviewWindowState] = useState({
    hovered: false,
    minimized: false,
    maximized: false,
  });
  const [summaryState, setSummaryState] = useState({
    open: false,
    status: "idle",
    errorMessage: "",
    summaries: [],
    progress: { current: 0, total: 0 },
    mode: "medium",
  });
  const [summaryPanelState, setSummaryPanelState] = useState({
    maximized: false,
  });
  const summarySocketRef = useRef(null);
  const summaryStatusRef = useRef("idle");
  const summaryReceivedDoneRef = useRef(false);
  const summaryEndRef = useRef(null);
  const summaryCacheRef = useRef(new Map());
  const [menuState, setMenuState] = useState(null);
  const [quickMenuState, setQuickMenuState] = useState({
    open: false,
    x: 0,
    y: 0,
  });
  const [createFolderState, setCreateFolderState] = useState({
    open: false,
    value: "",
    submitting: false,
  });
  const [renameState, setRenameState] = useState({
    open: false,
    item: null,
    value: "",
    submitting: false,
  });
  const [deleteState, setDeleteState] = useState({
    open: false,
    item: null,
    submitting: false,
  });
  const [colors, setColors] = useState([]);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);

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
    const targetFolder = location.state?.openFolder;

    if (targetFolder?.id) {
      loadDocuments({
        folderId: targetFolder.id,
        fallbackPath: [ROOT_CRUMB, { id: targetFolder.id, name: targetFolder.name || "Folder" }],
      });
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    loadDocuments();
  }, [loadDocuments, location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let isMounted = true;

    const loadColors = async () => {
      try {
        const payload = await getColors();
        if (isMounted) {
          setColors(Array.isArray(payload) ? payload : []);
        }
      } catch (colorError) {
        if (isMounted) {
          setToast(colorError.message || "Không thể tải danh sách màu");
        }
      }
    };

    loadColors();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    summaryStatusRef.current = summaryState.status;
  }, [summaryState.status]);

  useEffect(() => {
    if (!summaryState.open) {
      return;
    }

    summaryEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [summaryState.open, summaryState.summaries]);

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

  useEffect(() => {
    if (!quickMenuState.open) {
      return undefined;
    }

    const closeMenu = (event) => {
      if (quickMenuRef.current && !quickMenuRef.current.contains(event.target)) {
        setQuickMenuState((prev) => ({ ...prev, open: false }));
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
  }, [quickMenuState.open]);

  useEffect(() => () => {
    if (previewState.objectUrl) {
      URL.revokeObjectURL(previewState.objectUrl);
    }
  }, [previewState.objectUrl]);

  // Dispatch resize when summary panel toggles so embedded PDF viewer recalculates layout
  useEffect(() => {
    if (previewState.open && !previewState.loading) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 350);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [summaryState.open, previewState.open, previewState.loading]);

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

  const openQuickMenu = (event) => {
    event.preventDefault();
    const target = event.target instanceof Element
      ? event.target
      : event.target?.parentElement;
    if (target) {
      const shouldIgnore = target.closest("button, a, input, textarea, select, [data-quick-menu-ignore='true']");
      if (shouldIgnore) {
        return;
      }
    }

    setMenuState(null);
    setQuickMenuState({
      open: true,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const openUploadDialog = () => {
    setQuickMenuState((prev) => ({ ...prev, open: false }));
    uploadInputRef.current?.click();
  };

  const openFolderUploadDialog = () => {
    setQuickMenuState((prev) => ({ ...prev, open: false }));
    folderUploadInputRef.current?.click();
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      const uploadedFile = await uploadDocument({ file, folderId: currentFolderId });
      setToast(`Tải file thành công: ${uploadedFile?.name || file.name}`);
      await loadDocuments({ folderId: currentFolderId, fallbackPath: breadcrumbs });
    } catch (uploadError) {
      setToast(uploadError.message || "Tải file thất bại");
    } finally {
      event.target.value = "";
      setIsUploading(false);
    }
  };

  const handleFolderUpload = async (event) => {
    const filesToUpload = Array.from(event.target.files || []);

    if (filesToUpload.length === 0) {
      return;
    }

    setIsUploading(true);
    try {
      const folderIdByPath = new Map();
      folderIdByPath.set("", currentFolderId ?? null);

      const ensureFolder = async (relativePath) => {
        if (folderIdByPath.has(relativePath)) {
          return folderIdByPath.get(relativePath);
        }

        const normalizedPath = relativePath.split("/").filter(Boolean).join("/");
        if (!normalizedPath) {
          return currentFolderId ?? null;
        }

        const segments = normalizedPath.split("/");
        const parentPath = segments.slice(0, -1).join("/");
        const folderName = segments[segments.length - 1];
        const parentId = await ensureFolder(parentPath);

        const created = await createMyFolder({ name: folderName, parentId });
        const createdId = created?.id ?? created?.folderId ?? null;
        folderIdByPath.set(normalizedPath, createdId);
        return createdId;
      };

      for (const file of filesToUpload) {
        const relativePath = String(file.webkitRelativePath || "").split("\\").join("/");
        const normalizedPath = relativePath.split("/").filter(Boolean).join("/");
        const parentPath = normalizedPath.split("/").slice(0, -1).join("/");
        const targetFolderId = await ensureFolder(parentPath);
        await uploadDocument({ file, folderId: targetFolderId });
      }

      setToast("Tải thư mục thành công");
      await loadDocuments({ folderId: currentFolderId, fallbackPath: breadcrumbs });
    } catch (uploadError) {
      setToast(uploadError.message || "Tải thư mục thất bại");
    } finally {
      event.target.value = "";
      setIsUploading(false);
    }
  };

  const handleCreateFolder = () => {
    setQuickMenuState((prev) => ({ ...prev, open: false }));
    setCreateFolderState({ open: true, value: "", submitting: false });
  };

  const handleCreateFolderSubmit = async (event) => {
    event.preventDefault();

    const name = createFolderState.value.trim();
    if (!name) {
      setToast("Vui lòng nhập tên thư mục");
      return;
    }

    setCreateFolderState((prev) => ({ ...prev, submitting: true }));

    try {
      await createMyFolder({
        name,
        parentId: currentFolderId ?? null,
      });
      setToast("Tạo thư mục thành công");
      await loadDocuments({ folderId: currentFolderId, fallbackPath: breadcrumbs });
      setCreateFolderState({ open: false, value: "", submitting: false });
    } catch (createError) {
      setToast(createError.message || "Không thể tạo thư mục");
      setCreateFolderState((prev) => ({ ...prev, submitting: false }));
    }
  };

  const onQuickAction = (action) => {
    if (action === "create-folder") {
      handleCreateFolder();
      return;
    }

    if (action === "upload-file") {
      openUploadDialog();
      return;
    }

    if (action === "upload-folder") {
      openFolderUploadDialog();
    }
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
    setPreviewWindowState({
      hovered: false,
      minimized: false,
      maximized: false,
    });
    if (summarySocketRef.current) {
      summarySocketRef.current.close();
      summarySocketRef.current = null;
    }
    setSummaryState({
      open: false,
      status: "idle",
      errorMessage: "",
      summaries: [],
      progress: { current: 0, total: 0 },
      mode: "medium",
    });

    setPreviewState((prev) => {
      if (prev.objectUrl) {
        URL.revokeObjectURL(prev.objectUrl);
      }

      return {
        open: false,
        loading: false,
        error: "",
        fileId: null,
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
      fileId: file.id,
      name: file.name || "File",
      kind: PREVIEW_KIND.UNSUPPORTED,
      objectUrl: "",
      textContent: "",
    });
    setPreviewWindowState({
      hovered: false,
      minimized: false,
      maximized: false,
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

  const startSummary = async ({ force = false } = {}) => {
    if (!previewState.fileId) {
      setToast("Khong the tom tat file nay");
      return;
    }

    if (!force) {
      const cached = summaryCacheRef.current.get(previewState.fileId);
      if (cached) {
        setSummaryState((prev) => ({
          ...prev,
          open: true,
          status: "done",
          errorMessage: "",
          summaries: cached.summaries,
          progress: cached.progress || { current: cached.summaries.length, total: cached.summaries.length },
        }));
        return;
      }
    }

    if (summarySocketRef.current) {
      summarySocketRef.current.close();
      summarySocketRef.current = null;
    }

    summaryReceivedDoneRef.current = false;
    setSummaryState((prev) => ({
      ...prev,
      open: true,
      status: "connecting",
      errorMessage: "",
      summaries: [],
      progress: { current: 0, total: 0 },
    }));

    try {
      const blob = await downloadDocument(previewState.fileId);
      const base64Content = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Khong the doc file"));
        reader.readAsDataURL(blob);
      });

      const wsUrl = import.meta.env.VITE_SUMMARY_WS_URL || `${WS_BASE_URL}/ws/summarize`;
      const wsToken = localStorage.getItem("accessToken") || "";
      const ws = new WebSocket(`${wsUrl}?token=${wsToken}`);
      summarySocketRef.current = ws;

      ws.onopen = () => {
        setSummaryState((prev) => ({
          ...prev,
          status: "processing",
        }));
        ws.send(JSON.stringify({
          filename: previewState.name || "file",
          content: base64Content,
          fileId: previewState.fileId,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "start") {
            setSummaryState((prev) => ({
              ...prev,
              progress: { current: 0, total: data.total_chunks || 0 },
            }));
          } else if (data.type === "progress") {
            setSummaryState((prev) => ({
              ...prev,
              progress: {
                current: data.chunk_index || prev.progress.current,
                total: data.total_chunks || prev.progress.total,
              },
            }));
          } else if (data.type === "chunk") {
            if (data.summary) {
              setSummaryState((prev) => ({
                ...prev,
                summaries: [...prev.summaries, data.summary],
              }));
            }
          } else if (data.type === "done") {
            summaryReceivedDoneRef.current = true;
            setSummaryState((prev) => {
              const nextState = { ...prev, status: "done" };
              summaryCacheRef.current.set(previewState.fileId, {
                summaries: nextState.summaries,
                progress: nextState.progress,
              });
              return nextState;
            });
            ws.close();
          } else if (data.type === "error") {
            setSummaryState((prev) => ({
              ...prev,
              status: "error",
              errorMessage: data.message || "Da xay ra loi",
            }));
            ws.close();
          }
        } catch {
          setSummaryState((prev) => ({
            ...prev,
            status: "error",
            errorMessage: "Khong the doc du lieu tu server",
          }));
        }
      };

      ws.onerror = () => {
        setSummaryState((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "Loi ket noi WebSocket",
        }));
      };

      ws.onclose = (event) => {
        if (summaryStatusRef.current === "done" || summaryStatusRef.current === "error") {
          return;
        }

        if (summaryStatusRef.current !== "idle" && !summaryReceivedDoneRef.current) {
          setSummaryState((prev) => ({
            ...prev,
            status: "error",
            errorMessage: "Ket noi bi dong truoc khi hoan tat",
          }));
          return;
        }

        if (!event.wasClean && summaryStatusRef.current !== "idle") {
          setSummaryState((prev) => ({
            ...prev,
            status: "error",
            errorMessage: "Mat ket noi khi dang xu ly",
          }));
        }
      };
    } catch (error) {
      setSummaryState((prev) => ({
        ...prev,
        status: "error",
        errorMessage: error.message || "Khong the tai file de tom tat",
      }));
    }
  };

  const openSummaryPanel = () => {
    setSummaryState((prev) => ({ ...prev, open: true }));
    setSummaryPanelState((prev) => ({ ...prev, maximized: false }));
    if (summaryState.status === "processing" || summaryState.status === "connecting") {
      return;
    }
    startSummary();
  };

  const closeSummaryPanel = () => {
    setSummaryState((prev) => ({ ...prev, open: false }));
  };

  const handleSummaryMinimize = () => {
    setSummaryState((prev) => ({ ...prev, open: false }));
  };

  const handleSummaryToggleMaximize = () => {
    setSummaryPanelState((prev) => ({ ...prev, maximized: !prev.maximized }));
  };

  const handleSummaryCopy = async () => {
    if (!summaryState.summaries.length) {
      setToast("Chua co ket qua tom tat");
      return;
    }

    try {
      await navigator.clipboard.writeText(summaryState.summaries.join("\n\n"));
      setToast("Da sao chep tom tat");
    } catch {
      setToast("Khong the sao chep tom tat");
    }
  };

  const handleSummaryDownload = () => {
    if (!summaryState.summaries.length) {
      setToast("Chua co ket qua tom tat");
      return;
    }

    const content = summaryState.summaries.join("\n\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const fileName = previewState.name || "summary";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const openContextMenu = (event, item) => {
    event.preventDefault();
    setMenuState({
      x: event.clientX,
      y: event.clientY,
      item,
    });
  };

  const onMenuAction = (action, item) => {
    setMenuState(null);

    if (action === "rename") {
      setRenameState({
        open: true,
        item,
        value: item?.name || "",
        submitting: false,
      });
      return;
    }

    if (action === "delete") {
      setDeleteState({
        open: true,
        item,
        submitting: false,
      });
    }
  };

  const handleRenameSubmit = async (event) => {
    event.preventDefault();

    if (!renameState.item) {
      return;
    }

    const nextName = renameState.value.trim();
    if (!nextName) {
      setToast("Vui lòng nhập tên mới");
      return;
    }

    const target = renameState.item;
    if (!target.id) {
      setToast("Không thể đổi tên mục này");
      return;
    }

    setRenameState((prev) => ({
      ...prev,
      submitting: true,
    }));

    try {
      if (target.type === "folder") {
        await renameFolder(target.id, nextName);
      } else {
        await renameDocument(target.id, nextName);
      }

      setToast("Đổi tên thành công");
      await loadDocuments({ folderId: currentFolderId, fallbackPath: breadcrumbs });
      setRenameState({ open: false, item: null, value: "", submitting: false });
    } catch (renameError) {
      setToast(renameError.message || "Không thể đổi tên");
      setRenameState((prev) => ({
        ...prev,
        submitting: false,
      }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteState.item) {
      return;
    }

    const target = deleteState.item;
    if (!target.id) {
      setToast("Không thể xóa mục này");
      return;
    }

    setDeleteState((prev) => ({
      ...prev,
      submitting: true,
    }));

    try {
      if (target.type === "folder") {
        await deleteFolder(target.id);
      } else {
        await deleteDocument(target.id);
      }

      setToast("Đã xóa thành công");
      await loadDocuments({ folderId: currentFolderId, fallbackPath: breadcrumbs });
      setDeleteState({ open: false, item: null, submitting: false });
    } catch (deleteError) {
      setToast(deleteError.message || "Không thể xóa");
      setDeleteState((prev) => ({
        ...prev,
        submitting: false,
      }));
    }
  };

  const refreshCurrentFolder = () => loadDocuments({ folderId: currentFolderId, fallbackPath: breadcrumbs });

  const handleColorSelect = async (colorId) => {
    const target = menuState?.item;
    if (!target || target.type === "folder") {
      return;
    }

    try {
      const updatedFile = await updateDocumentColor(target.id, colorId);
      const normalized = normalizeFile(updatedFile);
      setFiles((prev) => prev.map((file) => (file.id === normalized.id ? { ...file, ...normalized } : file)));
      setToast(colorId ? "Đã gắn màu cho file" : "Đã bỏ màu file");
      setMenuState(null);
      setColorMenuOpen(false);
    } catch (colorError) {
      setToast(colorError.message || "Không thể cập nhật màu file");
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

    if (menuKey === "summarize") {
      navigate("/summarize");
      return;
    }

    if (menuKey === "color-board") {
      navigate("/color-board");
      return;
    }

    if (menuKey === "trash") {
      navigate("/trash");
      return;
    }

    if (menuKey === "settings") {
      navigate("/settings");
      return;
    }
  };

  const folderCount = folders.length;
  const fileCount = files.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white p-3 md:p-5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-3xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-[0_20px_65px_rgba(27,78,163,0.12)] dark:shadow-none transition-colors">
        <aside className="flex w-full flex-col gap-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/70 dark:bg-slate-800/40 p-4 md:w-20 md:border-b-0 md:border-r lg:w-64 transition-colors">
          <div className="flex items-center gap-3 px-1">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 text-lg font-extrabold text-white">
              D
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-400">
                Workspace
              </div>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Document Management System</div>
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
                      ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
                  }`}
                >
                  <MenuIcon fontSize="small" />
                  <span className="truncate text-sm font-semibold md:hidden lg:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">Quick Actions</div>
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
                className="flex w-full items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <CreateNewFolderOutlinedIcon fontSize="small" />
                <span className="md:hidden lg:inline">Tạo thư mục</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto" onContextMenu={openQuickMenu}>
          <header className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700/50 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Tài liệu của tôi</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Quản lý thư mục và tệp với điều hướng phân cấp theo cấu trúc thư mục.
              </p>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RefreshOutlinedIcon fontSize="small" />
              Làm mới
            </button>
          </header>

          <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-1">
              <button
                type="button"
                onClick={() => setViewMode(VIEW_MODE.LIST)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isListMode
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                    : "text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
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
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                    : "text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <GridViewOutlinedIcon fontSize="small" />
                Grid
              </button>
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400">Tổng: {allDocuments.length} mục</div>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
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
                          ? "cursor-default font-semibold text-slate-800 dark:text-slate-200"
                          : "text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-700"
                      }`}
                    >
                      {segment.name}
                    </button>
                    {!isLast && <ChevronRightOutlinedIcon fontSize="inherit" className="text-slate-400 dark:text-slate-500" />}
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
                  className="h-14 animate-pulse rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : isListMode ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Date modified</th>
                    <th className="px-4 py-3 text-right">File size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {allDocuments.map((item) => {
                    const iconMeta = item.type === "folder"
                      ? { Icon: FolderOutlinedIcon, className: "text-amber-600" }
                      : getFileIconMeta(item);

                    return (
                      <tr
                        key={`${item.type}-${item.id}`}
                        className="cursor-pointer transition hover:bg-blue-50/50 dark:hover:bg-slate-700/50"
                        onClick={item.type === "folder" ? () => openFolder(item) : () => openFilePreview(item)}
                        onContextMenu={(event) => openContextMenu(event, item)}
                        data-quick-menu-ignore="true"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                            <iconMeta.Icon className={iconMeta.className} fontSize="small" />
                            {item.type !== "folder" && item.colorCode && (<span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.colorCode }} />)}
                            <span className="truncate">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{formatDate(item.dateModified)}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-400">{formatFileSize(item.fileSize)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {allDocuments.map((item) => {
                const iconMeta = item.type === "folder"
                  ? { Icon: FolderOutlinedIcon, className: "text-amber-600" }
                  : getFileIconMeta(item);

                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    onClick={item.type === "folder" ? () => openFolder(item) : () => openFilePreview(item)}
                    onContextMenu={(event) => openContextMenu(event, item)}
                    data-quick-menu-ignore="true"
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-md"
                  >
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      <div className={`rounded-xl p-2 ${iconMeta.className} dark:bg-opacity-20`}>
                        <iconMeta.Icon fontSize="small" />
                      </div>
                      {item.type !== "folder" && item.colorCode && (<span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.colorCode }} />)}
                      <span className="truncate">{item.name}</span>
                    </div>

                    <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">Date modified</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">{formatDate(item.dateModified)}</div>

                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">File size</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">{formatFileSize(item.fileSize)}</div>
                  </button>
                );
              })}
            </div>
          )}

          {!isLoading && allDocuments.length === 0 && !error && (
            <div className="mt-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
              Chưa có tài liệu nào trong thư mục hiện tại.
            </div>
          )}

          <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Folders</div>
              <div className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">{folderCount}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Files</div>
              <div className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">{fileCount}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Total items</div>
              <div className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">{allDocuments.length}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Current folder</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <FolderOpenOutlinedIcon fontSize="small" />
                <span className="truncate">{breadcrumbs[breadcrumbs.length - 1]?.name || "Root"}</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      <input ref={uploadInputRef} type="file" hidden onChange={handleUpload} />
      <input
        ref={folderUploadInputRef}
        type="file"
        hidden
        multiple
        webkitdirectory="true"
        onChange={handleFolderUpload}
      />

      {menuState && (
        <div
          ref={menuRef}
          style={{ left: menuState.x, top: menuState.y }}
          className="fixed z-50 w-44 -translate-x-1/2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl"
        >
          {CONTEXT_ACTIONS.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => onMenuAction(action.key, menuState.item)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {action.label}
            </button>
          ))}
          {menuState.item?.type !== "folder" && (
            <div
              className="relative -mr-2 pr-2"
              onMouseEnter={() => setColorMenuOpen(true)}
              onMouseLeave={() => setColorMenuOpen(false)}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span>Gắn màu</span>
                <span>›</span>
              </button>
              {colorMenuOpen && (
                <div className="absolute left-full top-0 z-[60] w-52 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl before:absolute before:-left-2 before:top-0 before:h-full before:w-2 before:content-['']">
                  <button
                    type="button"
                    onClick={() => handleColorSelect(null)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <span className="h-3 w-3 rounded-full border border-slate-300" />
                    <span className="flex-1">Bỏ màu</span>
                    {!menuState.item?.colorCode && <span>✓</span>}
                  </button>
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handleColorSelect(color.id)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color.hexCode }} />
                      <span className="flex-1 truncate">{color.name}</span>
                      {menuState.item?.color?.id === color.id && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {quickMenuState.open && (
        <div
          ref={quickMenuRef}
          style={{ left: quickMenuState.x, top: quickMenuState.y }}
          className="fixed z-50 w-56 -translate-x-1/2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-2xl"
        >
          <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Thao tác nhanh
          </div>
          <div className="space-y-1">
            {QUICK_ACTIONS.map((action) => {
              const ActionIcon = action.icon;

              return (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => onQuickAction(action.key)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ActionIcon fontSize="small" className="text-slate-500 dark:text-slate-400" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {createFolderState.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm transition-opacity">
          <form
            onSubmit={handleCreateFolderSubmit}
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-2xl"
          >
            <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">Tạo thư mục</div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Thư mục sẽ được tạo trong: {breadcrumbs[breadcrumbs.length - 1]?.name || "Root"}
            </div>

            <input
              value={createFolderState.value}
              onChange={(event) => setCreateFolderState((prev) => ({ ...prev, value: event.target.value }))}
              className="mt-4 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-blue-300 dark:focus:border-blue-500/50"
              placeholder="Nhập tên thư mục"
              autoFocus
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateFolderState({ open: false, value: "", submitting: false })}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={createFolderState.submitting}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {createFolderState.submitting ? "Đang tạo..." : "Tạo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {renameState.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm transition-opacity">
          <form
            onSubmit={handleRenameSubmit}
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-2xl"
          >
            <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">Đổi tên</div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {renameState.item?.type === "folder" ? "Thư mục" : "File"}: {renameState.item?.name}
            </div>

            <input
              value={renameState.value}
              onChange={(event) => setRenameState((prev) => ({ ...prev, value: event.target.value }))}
              className="mt-4 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-blue-300 dark:focus:border-blue-500/50"
              placeholder="Nhập tên mới"
              autoFocus
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenameState({ open: false, item: null, value: "", submitting: false })}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={renameState.submitting}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {renameState.submitting ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteState.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-2xl">
            <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">Xóa mục</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Bạn có chắc muốn xóa {deleteState.item?.type === "folder" ? "thư mục" : "file"} <span className="font-semibold text-slate-800 dark:text-slate-200">{deleteState.item?.name}</span>?
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteState({ open: false, item: null, submitting: false })}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteState.submitting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleteState.submitting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewState.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-2 sm:p-3 backdrop-blur-sm transition-opacity">
          <div
            className={`relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl transition-all duration-300 ${
              previewWindowState.minimized
                ? "h-16 max-w-xl self-end"
                : previewWindowState.maximized
                  ? "h-[98vh] w-[98vw] max-w-none"
                  : "h-[92vh] max-w-7xl"
            }`}
          >
            {/* ── Fixed Header ── always visible ── */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {previewWindowState.minimized ? previewState.name : "Xem trước file"}
                </div>
                {!previewWindowState.minimized && (
                  <div className="truncate text-xs text-slate-500 dark:text-slate-400">{previewState.name}</div>
                )}
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
                {/* Tóm tắt AI */}
                {!previewWindowState.minimized && (
                  <button
                    type="button"
                    onClick={summaryState.open ? closeSummaryPanel : openSummaryPanel}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition ${
                      summaryState.open
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/60"
                        : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-700"
                    }`}
                    title={summaryState.open ? "Đóng tóm tắt AI" : "Tóm tắt AI"}
                  >
                    <AutoAwesomeOutlinedIcon fontSize="small" />
                    <span className="hidden sm:inline">Tóm tắt AI</span>
                  </button>
                )}
                {/* Minimize */}
                <button
                  type="button"
                  onClick={() =>
                    previewWindowState.minimized
                      ? setPreviewWindowState((prev) => ({ ...prev, minimized: false }))
                      : setPreviewWindowState((prev) => ({ ...prev, minimized: true }))
                  }
                  className="rounded-md p-1 text-slate-600 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
                  aria-label={previewWindowState.minimized ? "Restore preview" : "Minimize preview"}
                  title={previewWindowState.minimized ? "Mở lại" : "Thu nhỏ"}
                >
                  {previewWindowState.minimized ? (
                    <CropSquareOutlinedIcon fontSize="small" />
                  ) : (
                    <RemoveOutlinedIcon fontSize="small" />
                  )}
                </button>
                {/* Maximize / Restore */}
                {!previewWindowState.minimized && (
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewWindowState((prev) => ({
                        ...prev,
                        maximized: !prev.maximized,
                      }))
                    }
                    className="rounded-md p-1 text-slate-600 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
                    aria-label="Toggle maximize preview"
                    title={previewWindowState.maximized ? "Khôi phục" : "Phóng to"}
                  >
                    {previewWindowState.maximized ? (
                      <FilterNoneOutlinedIcon fontSize="small" />
                    ) : (
                      <CropSquareOutlinedIcon fontSize="small" />
                    )}
                  </button>
                )}
                {/* Close */}
                <button
                  type="button"
                  onClick={closePreview}
                  className="rounded-md p-1 text-slate-600 dark:text-slate-400 transition hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400"
                  aria-label="Close preview"
                  title="Đóng"
                >
                  <CloseOutlinedIcon fontSize="small" />
                </button>
              </div>
            </div>

            {/* ── Content Area ── viewer + optional summary panel ── */}
            {!previewWindowState.minimized && (
              <div className="relative min-h-0 flex-1 bg-slate-50 dark:bg-slate-900/50 p-2 sm:p-3">
                <div className="relative flex h-full gap-3">
                  {/* PDF / Image / Text / Office Viewer */}
                  <div
                    className={`min-w-0 h-full rounded-xl transition-all duration-300 ${
                      summaryState.open
                        ? summaryPanelState.maximized
                          ? "lg:w-[58%]"
                          : "lg:w-[68%]"
                        : "w-full"
                    } ${summaryState.open ? "flex-shrink-0" : "flex-1"}`}
                  >
                    {previewState.loading && (
                      <div className="grid h-full place-items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400">
                        Đang tải nội dung file...
                      </div>
                    )}

                    {!previewState.loading && previewState.error && (
                      <div className="grid h-full place-items-center rounded-xl border border-amber-100 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 text-sm font-semibold text-amber-800 dark:text-amber-500">
                        {previewState.error}
                      </div>
                    )}

                    {!previewState.loading && !previewState.error && previewState.kind === PREVIEW_KIND.PDF && previewState.objectUrl && (
                      <object
                        data={`${previewState.objectUrl}#navpanes=0&view=FitH`}
                        type="application/pdf"
                        className="h-full w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        style={{ minHeight: 0 }}
                      >
                        <div className="grid h-full place-items-center text-sm text-slate-500 dark:text-slate-400">
                          Trình duyệt không hỗ trợ xem PDF.
                          <a href={previewState.objectUrl} download className="mt-2 text-blue-600 underline">Tải xuống file</a>
                        </div>
                      </object>
                    )}

                    {!previewState.loading && !previewState.error && previewState.kind === PREVIEW_KIND.IMAGE && previewState.objectUrl && (
                      <div className="grid h-full place-items-center overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
                        <img
                          src={previewState.objectUrl}
                          alt={previewState.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}

                    {!previewState.loading && !previewState.error && previewState.kind === PREVIEW_KIND.TEXT && (
                      <pre className="h-full overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        {previewState.textContent}
                      </pre>
                    )}

                    {!previewState.loading && !previewState.error && previewState.kind === PREVIEW_KIND.OFFICE && previewState.objectUrl && (
                      <object
                        data={`${previewState.objectUrl}#navpanes=0&view=FitH`}
                        type="application/pdf"
                        className="h-full w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        style={{ minHeight: 0 }}
                      >
                        <div className="grid h-full place-items-center text-sm text-slate-500 dark:text-slate-400">
                          Trình duyệt không hỗ trợ xem file.
                          <a href={previewState.objectUrl} download className="mt-2 text-blue-600 underline">Tải xuống file</a>
                        </div>
                      </object>
                    )}
                  </div>

                  {/* Summary Panel (content only — no separate header) */}
                  <aside
                    className={`overflow-hidden rounded-2xl border shadow-xl transition-all duration-300 ${
                      summaryState.open
                        ? `translate-x-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-100 absolute right-0 top-0 z-10 h-full w-[88%] max-w-sm lg:static lg:h-auto lg:max-w-none ${
                            summaryPanelState.maximized ? "lg:w-[42%]" : "lg:w-[32%]"
                          }`
                        : "pointer-events-none w-0 translate-x-4 border-transparent opacity-0 absolute right-0 top-0 z-10 h-full"
                    }`}
                  >
                    {/* Summary panel sub-header (lightweight — file context only) */}
                    <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">Kết quả tóm tắt AI</div>
                        <div className="truncate text-xs text-slate-500 dark:text-slate-400">{previewState.name}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleSummaryToggleMaximize}
                          className="rounded-md p-1 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
                          title={summaryPanelState.maximized ? "Thu nhỏ panel" : "Mở rộng panel"}
                        >
                          {summaryPanelState.maximized ? (
                            <FilterNoneOutlinedIcon fontSize="small" />
                          ) : (
                            <CropSquareOutlinedIcon fontSize="small" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={closeSummaryPanel}
                          className="rounded-md p-1 text-slate-500 dark:text-slate-400 transition hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                          title="Đóng panel"
                        >
                          <CloseOutlinedIcon fontSize="small" />
                        </button>
                      </div>
                    </div>

                    {/* Summary content */}
                    <div className="flex h-[calc(100%-3.25rem)] flex-col gap-3 overflow-hidden p-4">
                      {(summaryState.status === "connecting" || summaryState.status === "processing") && (
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {summaryState.status === "connecting"
                            ? "AI đang kết nối..."
                            : "AI đang phân tích tài liệu..."}
                          {summaryState.status === "processing" && summaryState.progress.total > 0 && (
                            <div className="mt-3">
                              <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>Tiến trình</span>
                                <span>{Math.round((summaryState.progress.current / summaryState.progress.total) * 100)}%</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-sky-500 transition-all"
                                  style={{ width: `${(summaryState.progress.current / summaryState.progress.total) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {summaryState.status === "error" && (
                        <div className="rounded-2xl border border-amber-100 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm font-semibold text-amber-800 dark:text-amber-500">
                          Không thể tạo tóm tắt. Vui lòng thử lại.
                        </div>
                      )}

                      <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 text-sm text-slate-700 dark:text-slate-300">
                        {summaryState.summaries.length > 0 ? (
                          summaryState.summaries.map((text, idx) => (
                            <div
                              key={`${text.slice(0, 12)}-${idx}`}
                              className="relative mb-3 pl-5 leading-relaxed before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-blue-500"
                            >
                              {text}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-slate-500 dark:text-slate-400">Chưa có kết quả tóm tắt.</div>
                        )}
                        <div ref={summaryEndRef} />
                      </div>

                      <div className="shrink-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSummaryCopy}
                            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            onClick={handleSummaryDownload}
                            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            Tải xuống
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => startSummary({ force: true })}
                          className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Tóm tắt lại
                        </button>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            )}
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
