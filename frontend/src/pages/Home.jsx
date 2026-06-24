import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import SortOutlinedIcon from "@mui/icons-material/SortOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import CropSquareOutlinedIcon from "@mui/icons-material/CropSquareOutlined";
import FilterNoneOutlinedIcon from "@mui/icons-material/FilterNoneOutlined";
import { API_ORIGIN, WS_BASE_URL } from "../services/api";
import { getInfoUser, getRoles, logout } from "../services/authService";
import {
  createMyFolder,
  downloadDocument,
  getHomeDashboard,
  previewDocument,
  uploadDocument,
} from "../services/documentService";
import { deleteDocument, renameDocument } from "../services/fileActionService";

const sidebarItems = [
  { key: "home", label: "Trang chủ", icon: HomeOutlinedIcon },
  { key: "documents", label: "Tài liệu của tôi", icon: FolderOpenOutlinedIcon },
  { key: "upload", label: "Tải lên tài liệu", icon: UploadFileOutlinedIcon },
  { key: "summarize", label: "Tóm tắt AI", icon: AutoAwesomeOutlinedIcon },
  { key: "color-board", label: "Bảng màu", icon: PaletteOutlinedIcon },
  { key: "trash", label: "Thùng rác", icon: DeleteOutlineOutlinedIcon },
  { key: "settings", label: "Cài đặt", icon: SettingsOutlinedIcon },
];

const actionItems = [
  { key: "view", label: "Xem" },
  { key: "download", label: "Tải xuống" },
  { key: "share", label: "Chia sẻ" },
  { key: "rename", label: "Đổi tên" },
  { key: "delete", label: "Xóa" },
];

const defaultHomeData = {
  quickAccess: [],
  recent: [],
  suggested: [],
  storage: {
    usedBytes: 0,
    totalBytes: 15 * 1024 * 1024 * 1024,
    usedText: "0 B",
    totalText: "15.0 GB",
    usagePercent: 0,
  },
};

const USER_CACHE_KEY = "currentUser";

const PREVIEW_KIND = { PDF: "pdf", IMAGE: "image", TEXT: "text", OFFICE: "office", UNSUPPORTED: "unsupported" };
const TEXT_EXTENSIONS = new Set(["txt", "md", "json", "js", "jsx", "ts", "tsx", "html", "css", "scss", "less", "xml", "yml", "yaml", "java", "py", "go", "c", "cpp", "h", "hpp", "sql", "log", "csv"]);
const OFFICE_EXTENSIONS = new Set(["doc", "docx", "xls", "xlsx", "ppt", "pptx"]);
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"]);

const getItemFileId = (item = {}) => item.id || item.fileId || item.fileID || item.documentId || null;
const getItemFolderId = (item = {}) => item.id || item.folderId || item.folderID || null;
const isFolderItem = (item = {}) => String(item.itemType || item.type || "").toUpperCase() === "FOLDER";
const getItemName = (item = {}) => item.name || item.fileName || item.folderName || "";
const getFileExtension = (fileName = "") => {
  const normalized = String(fileName).trim();
  const index = normalized.lastIndexOf(".");
  return index < 0 || index === normalized.length - 1 ? "" : normalized.slice(index + 1).toLowerCase();
};
const detectPreviewKind = ({ name = "", mimeType = "" }) => {
  const extension = getFileExtension(name);
  const mime = String(mimeType).toLowerCase();
  if (mime.includes("pdf") || extension === "pdf") return PREVIEW_KIND.PDF;
  if (mime.startsWith("image/") || IMAGE_EXTENSIONS.has(extension)) return PREVIEW_KIND.IMAGE;
  if (mime.startsWith("text/") || mime.includes("json") || TEXT_EXTENSIONS.has(extension)) return PREVIEW_KIND.TEXT;
  if (mime.includes("word") || mime.includes("excel") || mime.includes("spreadsheet") || mime.includes("powerpoint") || mime.includes("presentation") || OFFICE_EXTENSIONS.has(extension)) return PREVIEW_KIND.OFFICE;
  return PREVIEW_KIND.UNSUPPORTED;
};

const resolveThumbnailUrl = (thumbnailUrl) => {
  if (!thumbnailUrl) {
    return "";
  }

  if (thumbnailUrl.startsWith("http://") || thumbnailUrl.startsWith("https://")) {
    return thumbnailUrl;
  }

  if (thumbnailUrl.startsWith("/")) {
    return `${API_ORIGIN}${thumbnailUrl}`;
  }

  return `${API_ORIGIN}/${thumbnailUrl}`;
};

const getCachedUser = () => {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setCachedUser = (user) => {
  if (!user) {
    return;
  }

  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
};

const getUserAvatarSource = (user) => (
  user?.thumbnailUrl || user?.avatar || user?.photoURL || user?.picture || ""
);

const getUserDisplayName = (user) => (
  user?.email || user?.username || user?.fullName || "Người dùng"
);

const getAvatarLabel = (value) => {
  const normalized = String(value || "").trim();
  return normalized ? normalized.charAt(0).toUpperCase() : "U";
};

const getFileType = (value = "") => {
  const normalized = value.toUpperCase();

  if (normalized.includes("PDF")) {
    return "PDF";
  }

  if (normalized.includes("DOC") || normalized.includes("WORD")) {
    return "DOCX";
  }

  if (normalized.includes("EXCEL") || normalized.includes("XLS") || normalized.includes("SHEET")) {
    return "EXCEL";
  }

  if (normalized.includes("IMG") || normalized.includes("PNG") || normalized.includes("JPG") || normalized.includes("IMAGE")) {
    return "IMAGE";
  }

  if (normalized.includes("FOLDER")) {
    return "FOLDER";
  }

  return "FILE";
};

const getFileIcon = (fileType) => {
  const type = getFileType(fileType);

  if (type === "PDF") {
    return {
      icon: PictureAsPdfOutlinedIcon,
      className: "text-red-600 bg-red-50",
    };
  }

  if (type === "DOCX") {
    return {
      icon: DescriptionOutlinedIcon,
      className: "text-blue-600 bg-blue-50",
    };
  }

  if (type === "EXCEL") {
    return {
      icon: TableChartOutlinedIcon,
      className: "text-emerald-600 bg-emerald-50",
    };
  }

  if (type === "IMAGE") {
    return {
      icon: ImageOutlinedIcon,
      className: "text-violet-600 bg-violet-50",
    };
  }

  if (type === "FOLDER") {
    return {
      icon: FolderOutlinedIcon,
      className: "text-amber-600 bg-amber-50",
    };
  }

  return {
    icon: DescriptionOutlinedIcon,
    className: "text-slate-600 bg-slate-100",
  };
};

const formatDateTime = (input) => {
  if (!input) {
    return "-";
  }

  return new Date(input).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const Home = () => {
  const navigate = useNavigate();
  const uploadInputRef = useRef(null);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  const userTriggerRef = useRef(null);
  const summarySocketRef = useRef(null);
  const summaryStatusRef = useRef("idle");
  const summaryReceivedDoneRef = useRef(false);
  const summaryEndRef = useRef(null);
  const summaryCacheRef = useRef(new Map());

  const [activeMenu, setActiveMenu] = useState("home");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userName, setUserName] = useState("Người dùng");
  const [avatarLabel, setAvatarLabel] = useState("U");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [search, setSearch] = useState("");
  const [fileType, setFileType] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [owner, setOwner] = useState("");
  const [sort, setSort] = useState("desc");

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [homeData, setHomeData] = useState(defaultHomeData);
  const [toast, setToast] = useState("");

  const [menuState, setMenuState] = useState(null);
  const [previewState, setPreviewState] = useState({ open: false, loading: false, error: "", fileId: null, name: "", kind: PREVIEW_KIND.UNSUPPORTED, objectUrl: "", textContent: "" });
  const [previewWindowState, setPreviewWindowState] = useState({ hovered: false, minimized: false, maximized: false });
  const [summaryState, setSummaryState] = useState({ open: false, status: "idle", errorMessage: "", summaries: [], progress: { current: 0, total: 0 }, mode: "medium" });
  const [summaryPanelState, setSummaryPanelState] = useState({ maximized: false });

  useEffect(() => {
    let isMounted = true;

    const cachedUser = getCachedUser();
    if (cachedUser) {
      const cachedName = getUserDisplayName(cachedUser);
      setAvatarUrl(resolveThumbnailUrl(getUserAvatarSource(cachedUser)));
      setUserName(cachedName);
      setAvatarLabel(getAvatarLabel(cachedName));
    }

    const loadProfile = async () => {
      try {
        const user = await getInfoUser();

        if (!isMounted) {
          return;
        }

        const displayName = getUserDisplayName(user);
        setAvatarUrl(resolveThumbnailUrl(getUserAvatarSource(user)));
        setUserName(displayName);
        setAvatarLabel(getAvatarLabel(displayName));
        setCachedUser(user);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem(USER_CACHE_KEY);
        navigate("/login", { replace: true });
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const loadHome = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getHomeDashboard({
        search,
        fileType,
        time: timeFilter,
        owner,
        sort,
      });
      setHomeData(data || defaultHomeData);
    } catch (error) {
      setToast(error.message || "Không thể tải dữ liệu trang chủ");
    } finally {
      setIsLoading(false);
    }
  }, [fileType, owner, search, sort, timeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHome();
    }, 220);

    return () => clearTimeout(timer);
  }, [loadHome]);

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
    if (!isUserMenuOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (userMenuRef.current?.contains(event.target)) {
        return;
      }

      if (userTriggerRef.current?.contains(event.target)) {
        return;
      }

      setIsUserMenuOpen(false);
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);


  useEffect(() => {
    summaryStatusRef.current = summaryState.status;
  }, [summaryState.status]);

  useEffect(() => {
    if (!summaryState.open) {
      return;
    }
    summaryEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [summaryState.open, summaryState.summaries]);

  useEffect(() => () => {
    if (previewState.objectUrl) {
      URL.revokeObjectURL(previewState.objectUrl);
    }
  }, [previewState.objectUrl]);

  useEffect(() => {
    if (previewState.open && !previewState.loading) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 350);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [summaryState.open, previewState.open, previewState.loading]);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout({
        accessToken: localStorage.getItem("accessToken") || "",
        refreshToken: localStorage.getItem("refreshToken") || "",
      });
    } catch {
      // Keep local state consistent even if API fails.
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem(USER_CACHE_KEY);
      navigate("/login", { replace: true });
      setIsLoggingOut(false);
    }
  };

  const loadRoles = async () => {
    setIsRoleLoading(true);
    try {
      const payload = await getRoles();
      const roles = Array.isArray(payload?.roles) ? payload.roles : [];
      setIsAdmin(roles.includes("ADMIN"));
    } catch (error) {
      setIsAdmin(false);
      setToast(error.message || "Không thể lấy quyền người dùng");
    } finally {
      setIsRoleLoading(false);
    }
  };

  const handleUserMenuToggle = async () => {
    if (isUserMenuOpen) {
      setIsUserMenuOpen(false);
      return;
    }

    setIsUserMenuOpen(true);
    if (!isRoleLoading) {
      await loadRoles();
    }
  };

  const handleAdminPanel = () => {
    setIsUserMenuOpen(false);
    navigate("/admin");
  };

  const handleSwitchAccount = () => {
    setIsUserMenuOpen(false);
    handleLogout();
  };

  const handleLogoutFromMenu = () => {
    setIsUserMenuOpen(false);
    handleLogout();
  };

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
      const uploadedFile = await uploadDocument({ file });
      setToast(`Tải file thành công: ${uploadedFile?.name || file.name}`);
      await loadHome();
    } catch (error) {
      setToast(error.message || "Tải file thất bại");
    } finally {
      event.target.value = "";
      setIsUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    const name = window.prompt("Nhập tên thư mục mới");

    if (!name || !name.trim()) {
      return;
    }

    try {
      await createMyFolder({ name: name.trim() });
      setToast("Tạo thư mục thành công");
      await loadHome();
    } catch (error) {
      setToast(error.message || "Không thể tạo thư mục");
    }
  };

  const handleCreateDocument = () => {
    const blob = new Blob(["Tài liệu mới"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tai-lieu-moi.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    setToast("Đã tạo tài liệu mẫu mới");
  };

  const closePreview = () => {
    setPreviewWindowState({ hovered: false, minimized: false, maximized: false });
    if (summarySocketRef.current) {
      summarySocketRef.current.close();
      summarySocketRef.current = null;
    }
    setSummaryState({ open: false, status: "idle", errorMessage: "", summaries: [], progress: { current: 0, total: 0 }, mode: "medium" });
    setPreviewState((prev) => {
      if (prev.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return { open: false, loading: false, error: "", fileId: null, name: "", kind: PREVIEW_KIND.UNSUPPORTED, objectUrl: "", textContent: "" };
    });
  };

  const openFolderInDocuments = (item) => {
    const folderId = getItemFolderId(item);
    if (!folderId) {
      setToast("Không thể mở thư mục này");
      return;
    }

    navigate("/documents", {
      state: {
        openFolder: {
          id: folderId,
          name: getItemName(item) || "Folder",
        },
      },
    });
  };

  const openFilePreview = async (item) => {
    const fileId = getItemFileId(item);
    if (!fileId) {
      setToast("Không thể xem trước file này");
      return;
    }
    setPreviewState({ open: true, loading: true, error: "", fileId, name: item.name || item.fileName || "File", kind: PREVIEW_KIND.UNSUPPORTED, objectUrl: "", textContent: "" });
    setPreviewWindowState({ hovered: false, minimized: false, maximized: false });
    try {
      const { blob, contentType } = await previewDocument(fileId);
      const kind = detectPreviewKind({ name: item.name || item.fileName, mimeType: contentType || item.mimeType || item.type || item.fileType });
      if (kind === PREVIEW_KIND.UNSUPPORTED) {
        setPreviewState((prev) => ({ ...prev, loading: false, error: "Không hỗ trợ xem trước file này", kind }));
        return;
      }
      if (kind === PREVIEW_KIND.TEXT) {
        const textContent = await blob.text();
        setPreviewState((prev) => ({ ...prev, loading: false, kind, textContent }));
        return;
      }
      const objectUrl = URL.createObjectURL(blob);
      setPreviewState((prev) => ({ ...prev, loading: false, kind, objectUrl }));
    } catch (previewError) {
      setPreviewState((prev) => ({ ...prev, loading: false, error: previewError.message || "Không thể xem trước file" }));
    }
  };

  const onOpenItem = (item) => {
    if (isFolderItem(item)) {
      openFolderInDocuments(item);
      return;
    }

    openFilePreview(item);
  };

  const onDownloadItem = async (item) => {
    if (item.itemType === "FOLDER") {
      setToast("Thư mục không hỗ trợ tải xuống trực tiếp");
      return;
    }

    if (!getItemFileId(item)) {
      setToast("Không thể tải tệp này");
      return;
    }

    try {
      const blob = await downloadDocument(getItemFileId(item));
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = item.name || "download";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setToast(error.message || "Không thể tải tệp");
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


  const onAction = async (action, item) => {
    setMenuState(null);

    if (action === "view") {
      onOpenItem(item);
      return;
    }

    if (action === "download") {
      await onDownloadItem(item);
      return;
    }

    if (action === "rename") {
      const nextName = window.prompt("Nhập tên mới", item.name || "");
      if (nextName && nextName.trim()) {
        if (item.itemType !== "FOLDER" && getItemFileId(item)) {
          try {
            await renameDocument(getItemFileId(item), nextName.trim());
            setToast(`Đã đổi tên thành: ${nextName.trim()}`);
            await loadHome();
          } catch (error) {
            setToast(error.message || "Không thể đổi tên");
          }
          return;
        }

        setToast("Đổi tên thư mục sẽ được bổ sung API ở bước tiếp theo");
      }
      return;
    }

    if (action === "share") {
      setToast("Tính năng chia sẻ sẽ được kết nối API ở bước tiếp theo");
      return;
    }

    if (action === "delete") {
      if (item.itemType !== "FOLDER" && getItemFileId(item)) {
        try {
          await deleteDocument(getItemFileId(item));
          setToast("Đã xóa file thành công");
          await loadHome();
        } catch (error) {
          setToast(error.message || "Không thể xóa file");
        }
        return;
      }

      setToast("Xóa thư mục sẽ được bổ sung API ở bước tiếp theo");
    }
  };

  const showActionMenu = (event, item, mode = "menu") => {
    event.preventDefault();
    setMenuState({
      x: event.clientX,
      y: event.clientY,
      item,
      mode,
    });
  };

  const renderSkeletonCards = (count) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 h-10 w-10 rounded-xl bg-slate-200" />
          <div className="mb-2 h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center justify-between border-b border-slate-100 px-4 py-4 last:border-b-0"
        >
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="h-4 w-1/6 rounded bg-slate-200" />
          <div className="h-4 w-1/6 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );

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
                  onClick={() => {
                    setActiveMenu(item.key);
                    if (item.key === "home") {
                      navigate("/");
                    }
                    if (item.key === "documents") {
                      navigate("/documents");
                    }
                    if (item.key === "upload") {
                      openUploadDialog();
                    }
                    if (item.key === "summarize") {
                      navigate("/summarize");
                    }
                    if (item.key === "color-board") {
                      navigate("/color-board");
                    }
                    if (item.key === "trash") {
                      navigate("/trash");
                    }
                    if (item.key === "settings") {
                      navigate("/settings");
                    }
                  }}
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
                className="flex w-full items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <CloudUploadOutlinedIcon fontSize="small" />
                <span className="md:hidden lg:inline">Tải lên file</span>
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

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <header className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700/50 pb-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <SearchOutlinedIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm kiếm file theo tên"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-3 pl-11 pr-4 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-blue-300 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-800"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={openUploadDialog}
                disabled={isUploading}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {isUploading ? "Đang tải..." : "Upload"}
              </button>
              <button
                type="button"
                onClick={handleCreateDocument}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Tạo tài liệu mới
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <NotificationsNoneOutlinedIcon fontSize="small" />
              </button>
              <div className="relative flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-2 py-1.5">
                <button
                  ref={userTriggerRef}
                  type="button"
                  onClick={handleUserMenuToggle}
                  className="flex items-center gap-2 rounded-lg px-1.5 py-0.5 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userName}
                      onError={() => setAvatarUrl("")}
                      className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
                      {avatarLabel}
                    </div>
                  )}
                  <span className="max-w-28 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{userName || avatarLabel}</span>
                </button>
                <button
                  data-testid="logout-btn"
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="rounded-md p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <LogoutOutlinedIcon fontSize="small" />
                </button>
                {isUserMenuOpen && (
                  <div
                    ref={userMenuRef}
                    className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl"
                  >
                    {isRoleLoading && (
                      <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                        Đang kiểm tra quyền...
                      </div>
                    )}
                    {(isAdmin
                      ? [
                          {
                            key: "admin",
                            label: "Quản lý hệ thống / Giao diện quản lý",
                            onClick: handleAdminPanel,
                          },
                          { key: "switch", label: "Đổi tài khoản", onClick: handleSwitchAccount },
                          { key: "logout", label: "Đăng xuất", onClick: handleLogoutFromMenu },
                        ]
                      : [
                          { key: "switch", label: "Đổi tài khoản", onClick: handleSwitchAccount },
                          { key: "logout", label: "Đăng xuất", onClick: handleLogoutFromMenu },
                        ]
                    ).map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={item.onClick}
                        disabled={isRoleLoading}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          <section className="mt-5 grid gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3 md:grid-cols-2 lg:grid-cols-5">
            <select
              value={fileType}
              onChange={(event) => setFileType(event.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="all">Loại file: Tất cả</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="EXCEL">Excel</option>
              <option value="IMAGE">Image</option>
            </select>

            <select
              value={timeFilter}
              onChange={(event) => setTimeFilter(event.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="all">Thời gian: Tất cả</option>
              <option value="today">Hôm nay</option>
              <option value="7d">7 ngày</option>
              <option value="30d">30 ngày</option>
            </select>

            <input
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              placeholder="Lọc theo chủ sở hữu"
              className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />

            <button
              type="button"
              onClick={() => setSort((prev) => (prev === "desc" ? "asc" : "desc"))}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <SortOutlinedIcon fontSize="small" />
              Sắp xếp: {sort === "desc" ? "Mới nhất" : "Cũ nhất"}
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFileType("all");
                setTimeFilter("all");
                setOwner("");
                setSort("desc");
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Đặt lại bộ lọc
            </button>
          </section>

          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Truy cập nhanh</h2>
            </div>

            {isLoading ? (
              renderSkeletonCards(4)
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {homeData.quickAccess.map((item) => {
                  const iconMeta = getFileIcon(item.fileType || item.itemType);
                  const Icon = iconMeta.icon;

                  return (
                    <div
                      key={`${item.itemType}-${item.id}`}
                      onContextMenu={(event) => showActionMenu(event, item, "context")}
                      className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenItem(item)}
                        className="w-full text-left"
                      >
                        <div className={`mb-3 inline-flex rounded-xl p-2.5 ${iconMeta.className} dark:bg-opacity-20`}>
                          <Icon fontSize="small" />
                        </div>
                        <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{item.name}</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(item.lastAccessedAt)}</div>
                      </button>

                      <button
                        type="button"
                        onClick={(event) => showActionMenu(event, item, "menu")}
                        className="absolute right-2 top-2 rounded-lg p-1 text-slate-500 opacity-0 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 group-hover:opacity-100"
                      >
                        <MoreHorizOutlinedIcon fontSize="small" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Gần đây</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">Sắp xếp theo thời gian cập nhật</span>
            </div>

            {isLoading ? (
              renderTableSkeleton()
            ) : (
              <div className="overflow-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Tên file</th>
                      <th className="px-4 py-3">Người chỉnh sửa</th>
                      <th className="px-4 py-3">Cập nhật</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {homeData.recent.map((item) => {
                      const normalized = { ...item, id: getItemFileId(item), itemType: "FILE" };

                      return (
                        <tr
                          key={item.id}
                          onContextMenu={(event) => showActionMenu(event, normalized, "context")}
                          className="group transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200"><button type="button" onClick={() => openFilePreview(normalized)} className="max-w-xs truncate text-left hover:text-blue-700 dark:hover:text-blue-400">{item.name}</button></td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.editedBy}</td>
                          <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDateTime(item.updatedAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={(event) => showActionMenu(event, normalized, "menu")}
                              className="rounded-lg p-1 text-slate-500 opacity-0 transition hover:bg-slate-100 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-300 group-hover:opacity-100"
                            >
                              <MoreHorizOutlinedIcon fontSize="small" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-8">
            <div>
              <h2 className="mb-3 text-xl font-bold text-slate-800 dark:text-slate-100">Đề xuất</h2>

              {isLoading ? (
                renderSkeletonCards(3)
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {homeData.suggested.map((item) => {
                    const iconMeta = getFileIcon(item.fileType);
                    const Icon = iconMeta.icon;
                    const normalized = { ...item, id: getItemFileId(item), itemType: "FILE" };

                    return (
                      <div
                        key={item.id}
                        onContextMenu={(event) => showActionMenu(event, normalized, "context")}
                        className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 transition hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-sm"
                      >
                        <button type="button" onClick={() => onOpenItem(normalized)} className="w-full text-left">
                          <div className={`mb-3 inline-flex rounded-xl p-2.5 ${iconMeta.className} dark:bg-opacity-20`}>
                            <Icon fontSize="small" />
                          </div>
                          <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{item.name}</div>
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.reason}</div>
                          <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">{formatDateTime(item.updatedAt)}</div>
                        </button>

                        <button
                          type="button"
                          onClick={(event) => showActionMenu(event, normalized, "menu")}
                          className="absolute right-2 top-2 rounded-lg p-1 text-slate-500 opacity-0 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 group-hover:opacity-100"
                        >
                          <MoreHorizOutlinedIcon fontSize="small" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      <input ref={uploadInputRef} type="file" hidden onChange={handleUpload} />

      {menuState && (
        <div
          ref={menuRef}
          style={{ left: menuState.x, top: menuState.y }}
          className="fixed z-50 w-44 -translate-x-1/2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl"
        >
          {actionItems.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => onAction(action.key, menuState.item)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {action.label}
            </button>
          ))}
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

export default Home;
