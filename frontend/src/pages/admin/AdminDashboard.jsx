import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SyncAltOutlinedIcon from "@mui/icons-material/SyncAltOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import CropSquareOutlinedIcon from "@mui/icons-material/CropSquareOutlined";
import FilterNoneOutlinedIcon from "@mui/icons-material/FilterNoneOutlined";
import { WS_BASE_URL, API_ORIGIN } from "../../services/api";
import { getInfoUser, getRoles, logout } from "../../services/authService";
import {
  filterUsers,
  getDeletedUsers,
  getUsers,
  hardDeleteUser,
  restoreUser,
  searchUsers,
  softDeleteUser,
  updateUserRole,
  updateUserStatus,
} from "../../services/userService";
import {
  downloadAdminFile,
  getAdminFiles,
  getAdminTrashFiles,
  hardDeleteAdminFile,
  previewAdminFile,
  restoreAdminFile,
  searchAdminFiles,
  softDeleteAdminFile,
} from "../../services/adminDocumentService";
import DeletedUsersPage from "./components/DeletedUsersPage";
import RestoreUserDialog from "./components/RestoreUserDialog";
import HardDeleteDialog from "./components/HardDeleteDialog";
import SummaryHistoryManagement from "./components/SummaryHistoryManagement";

const USER_CACHE_KEY = "currentUser";

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
  user?.email || user?.username || user?.fullName || "Admin"
);

const getAvatarLabel = (value) => {
  const normalized = String(value || "").trim();
  return normalized ? normalized.charAt(0).toUpperCase() : "A";
};

const getUserRoleLabel = (user) => {
  if (user?.role) {
    return String(user.role).toUpperCase();
  }

  if (user?.userRole) {
    return String(user.userRole).toUpperCase();
  }

  if (Array.isArray(user?.roles) && user.roles.length > 0) {
    return String(user.roles[0]).toUpperCase();
  }

  if (user?.username === "admin") {
    return "ADMIN";
  }

  return "USER";
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("vi-VN");
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined) {
    return "—";
  }

  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / (1024 ** index);

  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

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
    return { Icon: PictureAsPdfOutlinedIcon, className: "text-red-600" };
  }

  if (WORD_EXTENSIONS.has(extension) || mime.includes("word")) {
    return { Icon: ArticleOutlinedIcon, className: "text-blue-600" };
  }

  if (EXCEL_EXTENSIONS.has(extension) || mime.includes("excel") || mime.includes("spreadsheet")) {
    return { Icon: TableChartOutlinedIcon, className: "text-emerald-600" };
  }

  if (POWERPOINT_EXTENSIONS.has(extension) || mime.includes("powerpoint") || mime.includes("presentation")) {
    return { Icon: SlideshowOutlinedIcon, className: "text-orange-600" };
  }

  if (IMAGE_EXTENSIONS.has(extension) || mime.startsWith("image/")) {
    return { Icon: ImageOutlinedIcon, className: "text-violet-600" };
  }

  if (TEXT_EXTENSIONS.has(extension) || mime.startsWith("text/") || mime.includes("json")) {
    return { Icon: CodeOutlinedIcon, className: "text-slate-600" };
  }

  return { Icon: DescriptionOutlinedIcon, className: "text-blue-600" };
};

const resolveFileUrl = (fileUrl) => {
  if (!fileUrl) {
    return "";
  }

  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl;
  }

  if (fileUrl.startsWith("/")) {
    return `${API_ORIGIN}${fileUrl}`;
  }

  return `${API_ORIGIN}/${fileUrl}`;
};

const getReadableFileType = (mimeType = "", name = "") => {
  const extension = getFileExtension(name);
  if (extension) {
    return extension.toUpperCase();
  }

  if (mimeType) {
    const parts = String(mimeType).split("/");
    return parts[1] ? parts[1].toUpperCase() : parts[0].toUpperCase();
  }

  return "—";
};

const getOwnerLabel = (file) => {
  const owner = file?.ownerName || file?.owner || file?.username || file?.userName || file?.createdBy;
  if (owner) {
    return owner;
  }

  const url = String(file?.url || "");
  const match = url.match(/\/uploads\/users\/(\d+)\//);
  if (match?.[1]) {
    return `User ${match[1]}`;
  }

  return "—";
};

const extractDocumentCollection = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  if (Array.isArray(payload?.files)) {
    return payload.files;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const statusBadgeMap = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  LOCKED: "bg-rose-50 text-rose-700 border-rose-200",
};

const roleBadgeMap = {
  ADMIN: "bg-blue-50 text-blue-700 border-blue-200",
  USER: "bg-slate-50 text-slate-700 border-slate-200",
};

const documentStatusBadgeMap = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DELETED: "bg-amber-50 text-amber-700 border-amber-200",
};

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: DashboardOutlinedIcon },
  { key: "users", label: "Quản lý người dùng", icon: PeopleOutlinedIcon },
  { key: "documents", label: "Quản lý tài liệu", icon: FolderOpenOutlinedIcon },
  { key: "history", label: "Lịch sử tóm tắt", icon: HistoryOutlinedIcon },
  { key: "roles", label: "Quản lý vai trò", icon: VerifiedUserOutlinedIcon },
  { key: "stats", label: "Thống kê", icon: BarChartOutlinedIcon },
  { key: "settings", label: "Cài đặt", icon: SettingsOutlinedIcon },
  { key: "logout", label: "Đăng xuất", icon: LogoutOutlinedIcon },
];

const statCards = [
  {
    key: "users",
    label: "Tong nguoi dung",
    value: "1,248",
    sub: "+18 hom nay",
    tone: "from-blue-600 to-sky-500",
  },
  {
    key: "documents",
    label: "Tong tai lieu",
    value: "6,320",
    sub: "+92 trong tuan",
    tone: "from-sky-600 to-cyan-500",
  },
  {
    key: "summaries",
    label: "Tong luot tom tat",
    value: "18,540",
    sub: "+360 trong thang",
    tone: "from-emerald-600 to-emerald-400",
  },
  {
    key: "active",
    label: "Nguoi dung dang hoat dong",
    value: "312",
    sub: "Cap nhat 5 phut truoc",
    tone: "from-violet-600 to-purple-500",
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userName, setUserName] = useState("Admin");
  const [avatarLabel, setAvatarLabel] = useState("A");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [usersView, setUsersView] = useState("active");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [userReloadKey, setUserReloadKey] = useState(0);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [isDeletedLoading, setIsDeletedLoading] = useState(false);
  const [deletedError, setDeletedError] = useState("");
  const [deletedReloadKey, setDeletedReloadKey] = useState(0);
  const [detailUser, setDetailUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [docError, setDocError] = useState("");
  const [docReloadKey, setDocReloadKey] = useState(0);
  const [documentsView, setDocumentsView] = useState("all");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [docDetail, setDocDetail] = useState(null);
  const [docPreviewState, setDocPreviewState] = useState({
    open: false,
    loading: false,
    error: "",
    file: null,
    kind: PREVIEW_KIND.UNSUPPORTED,
    objectUrl: "",
    textContent: "",
  });
  const [docPreviewWindowState, setDocPreviewWindowState] = useState({
    hovered: false,
    minimized: false,
    maximized: false,
  });
  const [docSummaryState, setDocSummaryState] = useState({
    open: false,
    file: null,
    status: "idle",
    errorMessage: "",
    summaries: [],
    progress: { current: 0, total: 0 },
  });
  const [docDeleteDialog, setDocDeleteDialog] = useState({
    open: false,
    file: null,
    mode: "soft",
    submitting: false,
  });
  const [docRestoreDialog, setDocRestoreDialog] = useState({
    open: false,
    file: null,
    submitting: false,
  });
  const [roleDialog, setRoleDialog] = useState({
    open: false,
    user: null,
    role: "USER",
    submitting: false,
  });
  const [softDeleteDialog, setSoftDeleteDialog] = useState({
    open: false,
    user: null,
    submitting: false,
  });
  const [restoreDialog, setRestoreDialog] = useState({
    open: false,
    user: null,
    submitting: false,
  });
  const [hardDeleteDialog, setHardDeleteDialog] = useState({
    open: false,
    user: null,
    submitting: false,
  });
  const [toast, setToast] = useState("");
  const userMenuRef = useRef(null);
  const userTriggerRef = useRef(null);
  const previewUrlRef = useRef("");
  const docSummarySocketRef = useRef(null);
  const docSummaryStatusRef = useRef("idle");
  const docSummaryReceivedDoneRef = useRef(false);
  const docSummaryEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const cachedUser = getCachedUser();

    if (cachedUser) {
      const displayName = getUserDisplayName(cachedUser);
      setAvatarUrl(resolveThumbnailUrl(getUserAvatarSource(cachedUser)));
      setUserName(displayName);
      setAvatarLabel(getAvatarLabel(displayName));
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

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      setIsRoleLoading(true);
      try {
        const payload = await getRoles();
        const roles = Array.isArray(payload?.roles) ? payload.roles : [];
        if (isMounted) {
          setIsAdmin(roles.includes("ADMIN"));
        }
      } catch {
        if (isMounted) {
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setIsRoleLoading(false);
        }
      }
    };

    loadRoles();
    return () => {
      isMounted = false;
    };
  }, []);

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

    const timer = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    docSummaryStatusRef.current = docSummaryState.status;
  }, [docSummaryState.status]);

  useEffect(() => {
    if (!docSummaryState.open) {
      return;
    }

    docSummaryEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [docSummaryState.open, docSummaryState.summaries]);

  useEffect(() => {
    if (previewUrlRef.current && previewUrlRef.current !== docPreviewState.objectUrl) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    previewUrlRef.current = docPreviewState.objectUrl;

    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, [docPreviewState.objectUrl]);

  useEffect(() => {
    if (activeMenu !== "users") {
      return undefined;
    }

    if (usersView !== "active") {
      return undefined;
    }

    let isMounted = true;
    const keyword = search.trim();
    const shouldSearch = keyword.length > 0;
    const shouldFilter = roleFilter !== "all" && statusFilter !== "all";
    const debounceTimer = setTimeout(() => {
      const loadUsers = async () => {
        setIsUserLoading(true);
        setUserError("");

        try {
          let payload = null;

          if (shouldSearch) {
            payload = await searchUsers(keyword);
          } else if (shouldFilter) {
            payload = await filterUsers({ role: roleFilter, status: statusFilter });
          } else {
            payload = await getUsers();
          }

          const data = Array.isArray(payload) ? payload : payload?.data || [];
          if (isMounted) {
            setUsers(data);
          }
        } catch (error) {
          if (isMounted) {
            setUserError(error.message || "Không thể tải danh sách người dùng");
          }
        } finally {
          if (isMounted) {
            setIsUserLoading(false);
          }
        }
      };

      loadUsers();
    }, 350);
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [activeMenu, roleFilter, search, statusFilter, userReloadKey, usersView]);

  useEffect(() => {
    if (activeMenu !== "users") {
      return undefined;
    }

    if (usersView !== "deleted") {
      return undefined;
    }

    let isMounted = true;

    const loadDeletedUsers = async () => {
      setIsDeletedLoading(true);
      setDeletedError("");

      try {
        const payload = await getDeletedUsers();
        const data = Array.isArray(payload) ? payload : payload?.data || [];
        if (isMounted) {
          setDeletedUsers(data);
        }
      } catch (error) {
        if (isMounted) {
          setDeletedError(error.message || "Không thể tải danh sách người dùng đã xóa");
        }
      } finally {
        if (isMounted) {
          setIsDeletedLoading(false);
        }
      }
    };

    loadDeletedUsers();

    return () => {
      isMounted = false;
    };
  }, [activeMenu, deletedReloadKey, usersView]);

  useEffect(() => {
    if (activeMenu !== "documents") {
      return undefined;
    }

    let isMounted = true;
    const keyword = search.trim();
    const uploader = ownerFilter.trim();
    const shouldSearch = keyword.length > 0 || uploader.length > 0;
    const isTrashView = documentsView === "trash";

    const debounceTimer = setTimeout(() => {
      const loadDocuments = async () => {
        setIsDocLoading(true);
        setDocError("");

        try {
          const payload = shouldSearch
            ? await searchAdminFiles({ fileName: keyword, uploader })
            : isTrashView
              ? await getAdminTrashFiles()
              : await getAdminFiles();
          const data = extractDocumentCollection(payload);
          if (isMounted) {
            setDocuments(data);
          }
        } catch (error) {
          if (isMounted) {
            setDocError(error.message || "Khong the tai danh sach tai lieu");
          }
        } finally {
          if (isMounted) {
            setIsDocLoading(false);
          }
        }
      };

      loadDocuments();
    }, 350);
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [activeMenu, docReloadKey, documentsView, ownerFilter, search]);

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

  const handleSwitchAccount = () => {
    handleLogout();
  };

  const handleUserMenuToggle = () => {
    if (!isAdmin || isRoleLoading) {
      return;
    }

    setIsUserMenuOpen((prev) => !prev);
  };

  const handleBackToUser = () => {
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const handleSwitchAccountFromMenu = () => {
    setIsUserMenuOpen(false);
    handleSwitchAccount();
  };

  const handleLogoutFromMenu = () => {
    setIsUserMenuOpen(false);
    handleLogout();
  };

  const handleSidebarClick = (item) => {
    setActiveMenu(item.key);

    if (item.key === "logout") {
      handleLogout();
      return;
    }

    if (item.key === "users" || item.key === "dashboard" || item.key === "documents" || item.key === "history") {
      return;
    }

    setToast("Tinh nang nay se duoc cap nhat o buoc tiep theo");
  };

  const normalizedUsers = useMemo(() => (
    users.map((user) => ({
      ...user,
      role: getUserRoleLabel(user),
      active: Boolean(user?.active),
      status: user?.active ? "ACTIVE" : "LOCKED",
      thumbnailUrl: resolveThumbnailUrl(user?.thumbnailUrl || user?.avatar || ""),
    }))
  ), [users]);

  const normalizedDeletedUsers = useMemo(() => (
    deletedUsers.map((user) => ({
      ...user,
      active: Boolean(user?.active),
      status: "DELETED",
      thumbnailUrl: resolveThumbnailUrl(user?.thumbnailUrl || user?.avatar || ""),
    }))
  ), [deletedUsers]);

  const normalizedDocuments = useMemo(() => (
    documents.map((file) => {
      const sizeValue = Number(file.size ?? file.fileSize ?? file.sizeBytes ?? null);
      const name = file.name || file.fileName || "Tai lieu chua dat ten";
      const mimeType = file.type || file.mimeType || file.fileType || "";
      const createdAt = file.createdAt || file.uploadedAt || file.createdDate || file.created_at || null;
      const deletedAt = file.deletedAt || file.removedAt || file.trashedAt || null;
      const isDeleted = Boolean(file.isDeleted ?? deletedAt);
      const summary = file.summary || file.summaryText || file.summaryContent || "";
      const summaryUrl = file.summaryUrl || file.summaryURL || file.summary_path || "";
      const ownerName = file.ownerName || getOwnerLabel(file);
      const ownerAvatar = resolveThumbnailUrl(
        file.ownerAvatar
          || file.owner?.avatar
          || file.owner?.thumbnailUrl
          || file.owner?.photoURL
          || ""
      );

      return {
        ...file,
        name,
        mimeType,
        size: Number.isFinite(sizeValue) ? sizeValue : null,
        createdAt,
        deletedAt,
        isDeleted,
        ownerLabel: ownerName,
        ownerAvatar,
        status: isDeleted ? "DELETED" : "ACTIVE",
        typeLabel: getReadableFileType(mimeType, name),
        summary,
        summaryUrl,
        resolvedUrl: resolveFileUrl(file.url || file.fileUrl || ""),
      };
    })
  ), [documents]);

  const filteredDocuments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const ownerKeyword = ownerFilter.trim().toLowerCase();

    return normalizedDocuments.filter((file) => {
      if (documentsView === "all" && file.isDeleted) {
        return false;
      }

      if (documentsView === "trash" && !file.isDeleted) {
        return false;
      }

      if (keyword && !String(file.name || "").toLowerCase().includes(keyword)) {
        return false;
      }

      if (ownerKeyword && !String(file.ownerLabel || "").toLowerCase().includes(ownerKeyword)) {
        return false;
      }

      if (fileTypeFilter !== "all" && file.typeLabel !== fileTypeFilter) {
        return false;
      }

      return true;
    });
  }, [documentsView, fileTypeFilter, normalizedDocuments, ownerFilter, search]);

  const fileTypeOptions = useMemo(() => {
    const types = new Set(
      normalizedDocuments
        .map((file) => file.typeLabel)
        .filter((value) => value && value !== "—")
    );

    return ["all", ...Array.from(types).sort()];
  }, [normalizedDocuments]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return normalizedUsers.filter((user) => {
      if (keyword) {
        const candidate = `${user.username || ""} ${user.email || ""}`.toLowerCase();
        if (!candidate.includes(keyword)) {
          return false;
        }
      }

      if (roleFilter !== "all" && user.role !== roleFilter) {
        return false;
      }

      if (statusFilter !== "all" && user.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [normalizedUsers, roleFilter, search, statusFilter]);

  const handleRoleDialogOpen = (user) => {
    setRoleDialog({
      open: true,
      user,
      role: user.role || "USER",
      submitting: false,
    });
  };

  const handleRoleDialogClose = () => {
    setRoleDialog({ open: false, user: null, role: "USER", submitting: false });
  };

  const handleRoleConfirm = async () => {
    if (!roleDialog.user) {
      return;
    }

    setRoleDialog((prev) => ({ ...prev, submitting: true }));

    try {
      // API mới: truyền roleName là string ("ADMIN" hoặc "USER")
      await updateUserRole(roleDialog.user.id, roleDialog.role);
      setUsers((prev) => prev.map((item) => (
        item.id === roleDialog.user.id
          ? { ...item, role: roleDialog.role, roles: [roleDialog.role] }
          : item
      )));
      setToast("Đã cập nhật vai trò người dùng");
      handleRoleDialogClose();
    } catch (error) {
      setToast(error.message || "Không thể cập nhật vai trò");
      setRoleDialog((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleToggleStatus = async (user) => {
    const nextActive = !user.active;
    setUsers((prev) => prev.map((item) => (
      item.id === user.id ? { ...item, active: nextActive } : item
    )));

    try {
      await updateUserStatus(user.id, nextActive);
      setToast(nextActive ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
    } catch (error) {
      setUsers((prev) => prev.map((item) => (
        item.id === user.id ? { ...item, active: user.active } : item
      )));
      setToast(error.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleSoftDeleteOpen = (user) => {
    setSoftDeleteDialog({ open: true, user, submitting: false });
  };

  const handleSoftDeleteClose = () => {
    setSoftDeleteDialog({ open: false, user: null, submitting: false });
  };

  const handleSoftDeleteConfirm = async () => {
    if (!softDeleteDialog.user) {
      return;
    }

    setSoftDeleteDialog((prev) => ({ ...prev, submitting: true }));

    try {
      await softDeleteUser(softDeleteDialog.user.id);
      setUsers((prev) => prev.filter((item) => item.id !== softDeleteDialog.user.id));
      setToast("Đã xóa mềm người dùng");
      setDeletedReloadKey((prev) => prev + 1);
      handleSoftDeleteClose();
    } catch (error) {
      setToast(error.message || "Không thể xóa mềm người dùng");
      setSoftDeleteDialog((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleRestoreOpen = (user) => {
    setRestoreDialog({ open: true, user, submitting: false });
  };

  const handleRestoreClose = () => {
    setRestoreDialog({ open: false, user: null, submitting: false });
  };

  const handleRestoreConfirm = async () => {
    if (!restoreDialog.user) {
      return;
    }

    setRestoreDialog((prev) => ({ ...prev, submitting: true }));

    try {
      await restoreUser(restoreDialog.user.id);
      setDeletedUsers((prev) => prev.filter((item) => item.id !== restoreDialog.user.id));
      setUserReloadKey((prev) => prev + 1);
      setToast("Đã khôi phục tài khoản");
      handleRestoreClose();
    } catch (error) {
      setToast(error.message || "Không thể khôi phục tài khoản");
      setRestoreDialog((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleHardDeleteOpen = (user) => {
    setHardDeleteDialog({ open: true, user, submitting: false });
  };

  const handleHardDeleteClose = () => {
    setHardDeleteDialog({ open: false, user: null, submitting: false });
  };

  const handleHardDeleteConfirm = async () => {
    if (!hardDeleteDialog.user) {
      return;
    }

    setHardDeleteDialog((prev) => ({ ...prev, submitting: true }));

    try {
      await hardDeleteUser(hardDeleteDialog.user.id);
      setDeletedUsers((prev) => prev.filter((item) => item.id !== hardDeleteDialog.user.id));
      setToast("Đã xóa vĩnh viễn người dùng");
      handleHardDeleteClose();
    } catch (error) {
      const message = error.message || "Không thể xóa vĩnh viễn người dùng";
      const normalizedMessage = message.toLowerCase();
      if (
        normalizedMessage.includes("foreign")
        || normalizedMessage.includes("constraint")
        || normalizedMessage.includes("khoa ngoai")
      ) {
        setToast("Không thể xóa người dùng vì vẫn còn dữ liệu liên quan.");
      } else {
        setToast(message);
      }
      setHardDeleteDialog((prev) => ({ ...prev, submitting: false }));
    }
  };

  const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleDocPreview = async (file) => {
    if (!file?.id) {
      setToast("Khong tim thay tai lieu");
      return;
    }

    setDocPreviewState({
      open: true,
      loading: true,
      error: "",
      file,
      kind: PREVIEW_KIND.UNSUPPORTED,
      objectUrl: "",
      textContent: "",
    });
    setDocPreviewWindowState({
      hovered: false,
      minimized: false,
      maximized: false,
    });

    try {
      const preview = await previewAdminFile(file.id);
      const kind = detectPreviewKind({ name: file.name, mimeType: preview.contentType || file.mimeType });

      if (kind === PREVIEW_KIND.UNSUPPORTED) {
        setDocPreviewState((prev) => ({
          ...prev,
          loading: false,
          error: "Khong ho tro xem truoc file nay",
          kind,
        }));
        return;
      }

      if (kind === PREVIEW_KIND.TEXT) {
        const text = await preview.blob.text();
        setDocPreviewState((prev) => ({
          ...prev,
          loading: false,
          kind,
          textContent: text,
        }));
        return;
      }

      const objectUrl = URL.createObjectURL(preview.blob);
      setDocPreviewState((prev) => ({
        ...prev,
        loading: false,
        kind,
        objectUrl,
      }));
    } catch (error) {
      setDocPreviewState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Khong the xem truoc tai lieu",
      }));
    }
  };

  const handleDocPreviewClose = () => {
    setDocPreviewWindowState({
      hovered: false,
      minimized: false,
      maximized: false,
    });
    setDocPreviewState({
      open: false,
      loading: false,
      error: "",
      file: null,
      kind: PREVIEW_KIND.UNSUPPORTED,
      objectUrl: "",
      textContent: "",
    });
  };

  const handleDocSummaryOpen = (file) => {
    if (!file?.id) {
      setToast("Khong tim thay tai lieu");
      return;
    }

    if (docSummarySocketRef.current) {
      docSummarySocketRef.current.close();
      docSummarySocketRef.current = null;
    }

    docSummaryReceivedDoneRef.current = false;

    setDocSummaryState({
      open: true,
      file,
      status: "connecting",
      errorMessage: "",
      summaries: [],
      progress: { current: 0, total: 0 },
    });

    downloadAdminFile(file.id)
      .then((blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Khong the doc file"));
        reader.readAsDataURL(blob);
      }))
      .then((base64Content) => {
        const wsUrl = import.meta.env.VITE_SUMMARY_WS_URL || `${WS_BASE_URL}/ws/summarize`;
        const ws = new WebSocket(wsUrl);
        docSummarySocketRef.current = ws;

        ws.onopen = () => {
          setDocSummaryState((prev) => ({
            ...prev,
            status: "processing",
          }));
          ws.send(JSON.stringify({
            filename: file.name || "file",
            content: base64Content,
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "start") {
              setDocSummaryState((prev) => ({
                ...prev,
                progress: { current: 0, total: data.total_chunks || 0 },
              }));
            } else if (data.type === "progress") {
              setDocSummaryState((prev) => ({
                ...prev,
                progress: {
                  current: data.chunk_index || prev.progress.current,
                  total: data.total_chunks || prev.progress.total,
                },
              }));
            } else if (data.type === "chunk") {
              if (data.summary) {
                setDocSummaryState((prev) => ({
                  ...prev,
                  summaries: [...prev.summaries, data.summary],
                }));
              }
            } else if (data.type === "done") {
              docSummaryReceivedDoneRef.current = true;
              setDocSummaryState((prev) => ({
                ...prev,
                status: "done",
              }));
              ws.close();
            } else if (data.type === "error") {
              setDocSummaryState((prev) => ({
                ...prev,
                status: "error",
                errorMessage: data.message || "Da xay ra loi",
              }));
              ws.close();
            }
          } catch {
            setDocSummaryState((prev) => ({
              ...prev,
              status: "error",
              errorMessage: "Khong the doc du lieu tu server",
            }));
          }
        };

        ws.onerror = () => {
          setDocSummaryState((prev) => ({
            ...prev,
            status: "error",
            errorMessage: "Loi ket noi WebSocket",
          }));
        };

        ws.onclose = (event) => {
          if (docSummaryStatusRef.current === "done" || docSummaryStatusRef.current === "error") {
            return;
          }

          if (docSummaryStatusRef.current !== "idle" && !docSummaryReceivedDoneRef.current) {
            setDocSummaryState((prev) => ({
              ...prev,
              status: "error",
              errorMessage: "Ket noi bi dong truoc khi hoan tat",
            }));
            return;
          }

          if (!event.wasClean && docSummaryStatusRef.current !== "idle") {
            setDocSummaryState((prev) => ({
              ...prev,
              status: "error",
              errorMessage: "Mat ket noi khi dang xu ly",
            }));
          }
        };
      })
      .catch((error) => {
        setDocSummaryState((prev) => ({
          ...prev,
          status: "error",
          errorMessage: error.message || "Khong the tai file de tom tat",
        }));
      });
  };

  const handleDocSummaryClose = () => {
    if (docSummarySocketRef.current) {
      docSummarySocketRef.current.close();
      docSummarySocketRef.current = null;
    }

    setDocSummaryState({
      open: false,
      file: null,
      status: "idle",
      errorMessage: "",
      summaries: [],
      progress: { current: 0, total: 0 },
    });
  };

  const handleDocDownload = async (file) => {
    if (!file?.id) {
      setToast("Khong tim thay tai lieu");
      return;
    }

    try {
      const blob = await downloadAdminFile(file.id);
      downloadBlob(blob, file.name || "tai-lieu");
      setToast("Da tai tai lieu");
    } catch (error) {
      setToast(error.message || "Khong the tai tai lieu");
    }
  };

  const handleDocDownloadSummary = async (file) => {
    if (!file) {
      setToast("Khong tim thay tai lieu");
      return;
    }

    if (file.summaryUrl) {
      window.open(resolveFileUrl(file.summaryUrl), "_blank", "noopener");
      return;
    }

    if (file.summary) {
      const blob = new Blob([file.summary], { type: "text/plain;charset=utf-8" });
      downloadBlob(blob, `${file.name || "summary"}.txt`);
      return;
    }

    setToast("Chua co ket qua tom tat");
  };

  const handleDocDownloadCurrentSummary = () => {
    if (docSummaryState.summaries.length === 0) {
      setToast("Chua co ket qua tom tat");
      return;
    }

    const content = docSummaryState.summaries.join("\n\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const fileName = docSummaryState.file?.name || "summary";
    downloadBlob(blob, `${fileName}.txt`);
  };

  const handleDocRestore = async (file) => {
    if (!file?.id) {
      setToast("Khong tim thay tai lieu");
      return;
    }

    setDocRestoreDialog({ open: true, file, submitting: false });
  };

  const openDocDeleteDialog = (file, mode) => {
    if (!file?.id) {
      setToast("Khong tim thay tai lieu");
      return;
    }

    setDocDeleteDialog({ open: true, file, mode, submitting: false });
  };

  const closeDocDeleteDialog = () => {
    setDocDeleteDialog({ open: false, file: null, mode: "soft", submitting: false });
  };

  const handleDocDeleteConfirm = async () => {
    if (!docDeleteDialog.file) {
      return;
    }

    setDocDeleteDialog((prev) => ({ ...prev, submitting: true }));

    try {
      if (docDeleteDialog.mode === "hard") {
        await hardDeleteAdminFile(docDeleteDialog.file.id);
        setDocuments((prev) => prev.filter((item) => item.id !== docDeleteDialog.file.id));
        setToast("Da xoa vinh vien tai lieu");
      } else {
        await softDeleteAdminFile(docDeleteDialog.file.id);
        setDocuments((prev) => prev.map((item) => (
          item.id === docDeleteDialog.file.id
            ? { ...item, deletedAt: new Date().toISOString(), isDeleted: true }
            : item
        )));
        setToast("Da xoa mem tai lieu");
      }

      closeDocDeleteDialog();
      setDocReloadKey((prev) => prev + 1);
    } catch (error) {
      setToast(error.message || "Khong the xoa tai lieu");
      setDocDeleteDialog((prev) => ({ ...prev, submitting: false }));
    }
  };

  const closeDocRestoreDialog = () => {
    setDocRestoreDialog({ open: false, file: null, submitting: false });
  };

  const handleDocRestoreConfirm = async () => {
    if (!docRestoreDialog.file) {
      return;
    }

    setDocRestoreDialog((prev) => ({ ...prev, submitting: true }));

    try {
      await restoreAdminFile(docRestoreDialog.file.id);
      setDocuments((prev) => prev.map((item) => (
        item.id === docRestoreDialog.file.id
          ? { ...item, deletedAt: null, isDeleted: false }
          : item
      )));
      setToast("Da khoi phuc tai lieu");
      closeDocRestoreDialog();
      setDocReloadKey((prev) => prev + 1);
    } catch (error) {
      setToast(error.message || "Khong the khoi phuc tai lieu");
      setDocRestoreDialog((prev) => ({ ...prev, submitting: false }));
    }
  };

  const summaryHighlight = useMemo(
    () => [
      { label: "Ty le hoan thanh", value: "92%", detail: "Vuot muc quy" },
      { label: "Thoi gian xu ly TB", value: "12s", detail: "-8% so voi thang" },
      { label: "Do chinh xac", value: "4.7/5", detail: "Danh gia tu nguoi dung" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white p-3 md:p-5">
      <style>{"@keyframes fadeUp{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}"}</style>
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_20px_65px_rgba(27,78,163,0.12)] md:flex-row">
        <aside className="flex w-full flex-col gap-4 border-b border-slate-200 bg-slate-50/70 p-4 md:w-20 md:border-b-0 md:border-r lg:w-64">
          <div className="flex items-center gap-3 px-1">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 text-lg font-extrabold text-white">
              A
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Admin Suite
              </div>
              <div className="text-sm font-bold text-slate-700">Text Summary Control</div>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
            {sidebarItems.map((item) => {
              const ItemIcon = item.icon;
              const isActive = activeMenu === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSidebarClick(item)}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <ItemIcon fontSize="small" />
                  <span className="truncate md:hidden lg:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-blue-100 bg-white p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Tổng quan
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-700">
              Chào mừng trở lại, {userName}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Chương trình giám sát hệ thống tóm tắt
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <header className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Admin Dashboard
              </div>
              <div className="text-xl font-bold text-slate-800">
                Hệ thống lưu trữ tài liệu
              </div>
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <SearchOutlinedIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={activeMenu === "users"
                    ? "Tim theo username hoặc email..."
                    : activeMenu === "documents"
                      ? "Tim theo ten tai lieu..."
                      : "Tim kiem nguoi dung, tai lieu..."}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
                />
              </div>

              <div className="relative flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5">
                <button
                  ref={userTriggerRef}
                  type="button"
                  onClick={handleUserMenuToggle}
                  className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-slate-50"
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
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-800">{userName}</div>
                    <div className="text-xs text-slate-500">Quản trị hệ thống</div>
                  </div>
                </button>
                {isAdmin && isUserMenuOpen && (
                  <div
                    ref={userMenuRef}
                    className="absolute right-0 top-full z-40 mt-2 w-64 animate-[fadeUp_160ms_ease-out] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
                  >
                    {[
                      {
                        key: "back",
                        label: "Trở về giao diện người dùng",
                        icon: PersonOutlinedIcon,
                        onClick: handleBackToUser,
                      },
                      {
                        key: "switch",
                        label: "Đổi tài khoản",
                        icon: SyncAltOutlinedIcon,
                        onClick: handleSwitchAccountFromMenu,
                      },
                      {
                        key: "logout",
                        label: "Đăng xuất",
                        icon: LogoutOutlinedIcon,
                        onClick: handleLogoutFromMenu,
                      },
                    ].map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={item.onClick}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <ItemIcon fontSize="small" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </header>

          {activeMenu === "users" ? (
            <section className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Quản lý tài khoản
                  </div>
                  <div className="text-lg font-bold text-slate-900">Danh sách người dùng</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setUsersView("active")}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                        usersView === "active"
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Đang hoạt động
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsersView("deleted")}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                        usersView === "deleted"
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Người dùng đã xóa
                    </button>
                  </div>

                  {usersView === "active" && (
                    <>
                      <select
                        value={roleFilter}
                        onChange={(event) => setRoleFilter(event.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-300"
                      >
                        <option value="all">Tất cả vai trò</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                      </select>
                      <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-300"
                      >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="LOCKED">LOCKED</option>
                      </select>
                    </>
                  )}
                </div>
              </div>

              {usersView === "active" ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-slate-600">
                      {filteredUsers.length} nguoi dung
                    </div>
                    <button
                      type="button"
                      onClick={() => setUserReloadKey((prev) => prev + 1)}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      F5
                    </button>
                  </div>

                  {isUserLoading && (
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
                      Dang tai danh sach nguoi dung...
                    </div>
                  )}

                  {!isUserLoading && userError && (
                    <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-6 text-center text-sm font-semibold text-rose-700">
                      {userError}
                    </div>
                  )}

                  {!isUserLoading && !userError && filteredUsers.length === 0 && (
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
                      Không tìm thấy người dùng nào phù hợp.
                    </div>
                  )}

                  {!isUserLoading && !userError && filteredUsers.length > 0 && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                      <div className="overflow-auto">
                        <table className="min-w-[960px] w-full text-left">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                              <th className="px-4 py-3">Avatar</th>
                              <th className="px-4 py-3">Username</th>
                              <th className="px-4 py-3">Email</th>
                              <th className="px-4 py-3">Vai trò</th>
                              <th className="px-4 py-3">Trạng thái</th>
                              <th className="px-4 py-3">Ngày tạo</th>
                              <th className="px-4 py-3 text-right">Hành động</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((user) => (
                              <tr
                                key={user.id}
                                className="border-t border-slate-100 text-sm text-slate-700 transition hover:bg-blue-50/40"
                              >
                                <td className="px-4 py-3">
                                  {user.thumbnailUrl ? (
                                    <img
                                      src={user.thumbnailUrl}
                                      alt={user.username}
                                      onError={(event) => {
                                        event.currentTarget.src = "";
                                      }}
                                      className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
                                      {getAvatarLabel(user.username || user.email)}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-800">
                                  {user.username || "—"}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {user.email || "—"}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                      roleBadgeMap[user.role] || roleBadgeMap.USER
                                    }`}
                                  >
                                    {user.role}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                      statusBadgeMap[user.status] || statusBadgeMap.ACTIVE
                                    }`}
                                  >
                                    {user.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {formatDate(user.createdAt || user.createdDate || user.created_at)}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setDetailUser(user)}
                                      className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                                      title="Xem chi tiet"
                                      aria-label="Xem chi tiet"
                                    >
                                      <VisibilityOutlinedIcon fontSize="small" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRoleDialogOpen(user)}
                                      className="rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50"
                                      title="Cap nhat vai tro"
                                      aria-label="Cap nhat vai tro"
                                    >
                                      <ManageAccountsOutlinedIcon fontSize="small" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleStatus(user)}
                                      className="rounded-lg border border-slate-200 p-2 text-amber-600 transition hover:bg-amber-50"
                                      title={user.active ? "Khoa tai khoan" : "Mo khoa tai khoan"}
                                      aria-label={user.active ? "Khoa tai khoan" : "Mo khoa tai khoan"}
                                    >
                                      {user.active ? (
                                        <LockOutlinedIcon fontSize="small" />
                                      ) : (
                                        <LockOpenOutlinedIcon fontSize="small" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSoftDeleteOpen(user)}
                                      className="rounded-lg border border-slate-200 p-2 text-amber-600 transition hover:bg-amber-50"
                                      title="Xoa mem"
                                      aria-label="Xoa mem"
                                    >
                                      <DeleteOutlineOutlinedIcon fontSize="small" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <DeletedUsersPage
                  users={normalizedDeletedUsers}
                  isLoading={isDeletedLoading}
                  error={deletedError}
                  onRefresh={() => setDeletedReloadKey((prev) => prev + 1)}
                  onRestore={handleRestoreOpen}
                  onHardDelete={handleHardDeleteOpen}
                  getAvatarLabel={getAvatarLabel}
                  formatDate={formatDate}
                />
              )}
            </section>
          ) : activeMenu === "documents" ? (
            <section className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Quan ly tai lieu
                  </div>
                  <div className="text-lg font-bold text-slate-900">Danh sach tai lieu</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setDocumentsView("all")}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                        documentsView === "all"
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Tất cả tài liệu
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocumentsView("trash")}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                        documentsView === "trash"
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Thùng rác
                    </button>
                  </div>
                  <input
                    value={ownerFilter}
                    onChange={(event) => setOwnerFilter(event.target.value)}
                    placeholder="Tim theo username"
                    className="min-w-[200px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-300"
                  />
                  <select
                    value={fileTypeFilter}
                    onChange={(event) => setFileTypeFilter(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-300"
                  >
                    <option value="all">Tất cả các loại file</option>
                    {fileTypeOptions.map((type) => (
                      type === "all" ? null : (
                        <option key={type} value={type}>{type}</option>
                      )
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setDocReloadKey((prev) => prev + 1)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Làm mới
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-slate-600">
                    {filteredDocuments.length} {documentsView === "trash" ? "tai lieu trong thung rac" : "tai lieu"}
                  </div>
                </div>

                {isDocLoading && (
                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
                    Dang tai danh sach tai lieu...
                  </div>
                )}

                {!isDocLoading && docError && (
                  <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-6 text-center text-sm font-semibold text-rose-700">
                    {docError}
                  </div>
                )}

                {!isDocLoading && !docError && filteredDocuments.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
                    {documentsView === "trash" ? "Thùng rác đang trống" : "Chưa có tài liệu nào"}
                  </div>
                )}

                {!isDocLoading && !docError && filteredDocuments.length > 0 && (
                  <>
                    <div className="mt-4 hidden md:block overflow-hidden rounded-2xl border border-slate-200">
                      <div className="overflow-auto">
                        <table className="min-w-[1180px] w-full text-left">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                              <th className="px-4 py-3">File</th>
                              <th className="px-4 py-3">Ten tai lieu</th>
                              <th className="px-4 py-3">Chu so huu</th>
                              <th className="px-4 py-3">Loai file</th>
                              <th className="px-4 py-3">Kich thuoc</th>
                              <th className="px-4 py-3">Ngay upload</th>
                              <th className="px-4 py-3">Trang thai</th>
                              {documentsView === "trash" && (
                                <th className="px-4 py-3">Ngay xoa</th>
                              )}
                              <th className="px-4 py-3 text-right">Hanh dong</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredDocuments.map((file) => {
                              const iconMeta = getFileIconMeta({ name: file.name, mimeType: file.mimeType });
                              const FileIcon = iconMeta.Icon;

                              return (
                                <tr
                                  key={file.id}
                                  className="border-t border-slate-100 text-sm text-slate-700 transition hover:bg-blue-50/40"
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white">
                                      <FileIcon className={iconMeta.className} fontSize="small" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="font-semibold text-slate-800">{file.name}</div>
                                    <div className="text-xs text-slate-400">ID: {file.id}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      {file.ownerAvatar ? (
                                        <img
                                          src={file.ownerAvatar}
                                          alt={file.ownerLabel}
                                          onError={(event) => {
                                            event.currentTarget.src = "";
                                          }}
                                          className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
                                          {getAvatarLabel(file.ownerLabel)}
                                        </div>
                                      )}
                                      <span className="text-sm font-semibold text-slate-700">
                                        {file.ownerLabel}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-slate-600">{file.typeLabel}</td>
                                  <td className="px-4 py-3 text-slate-600">{formatFileSize(file.size)}</td>
                                  <td className="px-4 py-3 text-slate-600">{formatDateTime(file.createdAt)}</td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                        documentStatusBadgeMap[file.status] || documentStatusBadgeMap.ACTIVE
                                      }`}
                                    >
                                      {file.status}
                                    </span>
                                  </td>
                                  {documentsView === "trash" && (
                                    <td className="px-4 py-3 text-slate-600">
                                      {formatDateTime(file.deletedAt)}
                                    </td>
                                  )}
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                      {documentsView === "trash" ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleDocRestore(file)}
                                            className="rounded-lg border border-slate-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
                                            title="Khoi phuc"
                                            aria-label="Khoi phuc"
                                          >
                                            <RestoreFromTrashOutlinedIcon fontSize="small" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => openDocDeleteDialog(file, "hard")}
                                            className="rounded-lg border border-slate-200 p-2 text-rose-700 transition hover:bg-rose-50"
                                            title="Xoa vinh vien"
                                            aria-label="Xoa vinh vien"
                                          >
                                            <DeleteForeverOutlinedIcon fontSize="small" />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => setDocDetail(file)}
                                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                                            title="Xem chi tiet"
                                            aria-label="Xem chi tiet"
                                          >
                                            <VisibilityOutlinedIcon fontSize="small" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDocPreview(file)}
                                            className="rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50"
                                            title="Xem noi dung"
                                            aria-label="Xem noi dung"
                                          >
                                            <DescriptionOutlinedIcon fontSize="small" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDocSummaryOpen(file)}
                                            className="rounded-lg border border-slate-200 p-2 text-amber-600 transition hover:bg-amber-50"
                                            title="Xem tom tat"
                                            aria-label="Xem tom tat"
                                          >
                                            <AutoAwesomeOutlinedIcon fontSize="small" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDocDownload(file)}
                                            className="rounded-lg border border-slate-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
                                            title="Tai file goc"
                                            aria-label="Tai file goc"
                                          >
                                            <DownloadOutlinedIcon fontSize="small" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => openDocDeleteDialog(file, "soft")}
                                            className="rounded-lg border border-slate-200 p-2 text-amber-600 transition hover:bg-amber-50"
                                            title="Xoa mem"
                                            aria-label="Xoa mem"
                                          >
                                            <DeleteOutlineOutlinedIcon fontSize="small" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:hidden">
                      {filteredDocuments.map((file) => {
                        const iconMeta = getFileIconMeta({ name: file.name, mimeType: file.mimeType });
                        const FileIcon = iconMeta.Icon;

                        return (
                          <div key={file.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white">
                                  <FileIcon className={iconMeta.className} fontSize="small" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-slate-800">{file.name}</div>
                                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                    {file.ownerAvatar ? (
                                      <img
                                        src={file.ownerAvatar}
                                        alt={file.ownerLabel}
                                        onError={(event) => {
                                          event.currentTarget.src = "";
                                        }}
                                        className="h-6 w-6 rounded-full border border-slate-200 object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[10px] font-semibold text-slate-600">
                                        {getAvatarLabel(file.ownerLabel)}
                                      </div>
                                    )}
                                    <span>{file.ownerLabel}</span>
                                    <span>•</span>
                                    <span>{file.typeLabel}</span>
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                  documentStatusBadgeMap[file.status] || documentStatusBadgeMap.ACTIVE
                                }`}
                              >
                                {file.status}
                              </span>
                            </div>

                            <div className="mt-3 text-xs text-slate-500">
                              {formatFileSize(file.size)} • {formatDateTime(file.createdAt)}
                              {documentsView === "trash" && (
                                <span> • Xoa luc {formatDateTime(file.deletedAt)}</span>
                              )}
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              {documentsView === "trash" ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleDocRestore(file)}
                                    className="rounded-lg border border-slate-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
                                    title="Khoi phuc"
                                    aria-label="Khoi phuc"
                                  >
                                    <RestoreFromTrashOutlinedIcon fontSize="small" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openDocDeleteDialog(file, "hard")}
                                    className="rounded-lg border border-slate-200 p-2 text-rose-700 transition hover:bg-rose-50"
                                    title="Xoa vinh vien"
                                    aria-label="Xoa vinh vien"
                                  >
                                    <DeleteForeverOutlinedIcon fontSize="small" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setDocDetail(file)}
                                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                                    title="Xem chi tiet"
                                    aria-label="Xem chi tiet"
                                  >
                                    <VisibilityOutlinedIcon fontSize="small" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDocPreview(file)}
                                    className="rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50"
                                    title="Xem noi dung"
                                    aria-label="Xem noi dung"
                                  >
                                    <DescriptionOutlinedIcon fontSize="small" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDocSummaryOpen(file)}
                                    className="rounded-lg border border-slate-200 p-2 text-amber-600 transition hover:bg-amber-50"
                                    title="Xem tom tat"
                                    aria-label="Xem tom tat"
                                  >
                                    <AutoAwesomeOutlinedIcon fontSize="small" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDocDownload(file)}
                                    className="rounded-lg border border-slate-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
                                    title="Tai file goc"
                                    aria-label="Tai file goc"
                                  >
                                    <DownloadOutlinedIcon fontSize="small" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openDocDeleteDialog(file, "soft")}
                                    className="rounded-lg border border-slate-200 p-2 text-amber-600 transition hover:bg-amber-50"
                                    title="Xoa mem"
                                    aria-label="Xoa mem"
                                  >
                                    <DeleteOutlineOutlinedIcon fontSize="small" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </section>
          ) : activeMenu === "history" ? (
            <SummaryHistoryManagement />
          ) : (
            <>
              <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                  <div
                    key={card.key}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
                  >
                    <div
                      className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r ${card.tone} px-3 py-1 text-xs font-semibold text-white`}
                    >
                      <AutoAwesomeOutlinedIcon fontSize="inherit" />
                      Bao cao
                    </div>
                    <div className="mt-3 text-sm font-semibold text-slate-600">{card.label}</div>
                    <div className="mt-1 text-2xl font-bold text-slate-900">{card.value}</div>
                    <div className="mt-2 text-xs text-slate-500">{card.sub}</div>
                  </div>
                ))}
              </section>

              <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Hoat dong gan day
                      </div>
                      <div className="text-base font-bold text-slate-900">He thong dang van hanh on dinh</div>
                    </div>
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Xem tat ca
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      "Nguoi dung moi dang ky: 24",
                      "Tai lieu moi tai len: 148",
                      "Luot tom tat hoan tat: 312",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                      >
                        <span>{item}</span>
                        <span className="text-xs font-semibold text-slate-500">{index + 1} gio truoc</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Chat luong tom tat
                  </div>
                  <div className="mt-2 text-base font-bold text-slate-900">Hieu suat he thong</div>
                  <div className="mt-4 space-y-3">
                    {summaryHighlight.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div className="text-xs font-semibold text-slate-500">{item.label}</div>
                        <div className="mt-1 text-xl font-bold text-slate-900">{item.value}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {detailUser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-3">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-800">Chi tiết người dùng</div>
                <div className="mt-1 text-sm text-slate-500">Thông tin tài khoản</div>
              </div>
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center gap-3">
                {detailUser.thumbnailUrl ? (
                  <img
                    src={detailUser.thumbnailUrl}
                    alt={detailUser.username}
                    className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-600">
                    {getAvatarLabel(detailUser.username || detailUser.email)}
                  </div>
                )}
                <div>
                  <div className="text-base font-semibold text-slate-800">
                    {detailUser.username || "—"}
                  </div>
                  <div className="text-xs text-slate-500">ID: {detailUser.id}</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Email</div>
                  <div className="font-semibold text-slate-700">{detailUser.email || "—"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Số điện thoại</div>
                  <div className="font-semibold text-slate-700">{detailUser.phone || "—"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Vai trò</div>
                  <div className="font-semibold text-slate-700">{detailUser.role}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Trạng thái</div>
                  <div className="font-semibold text-slate-700">{detailUser.status}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
                  <div className="text-xs text-slate-500">Địa chỉ</div>
                  <div className="font-semibold text-slate-700">{detailUser.address || "—"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
                  <div className="text-xs text-slate-500">Ngày tạo</div>
                  <div className="font-semibold text-slate-700">
                    {formatDate(detailUser.createdAt || detailUser.createdDate || detailUser.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {docDetail && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-3">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-slate-800">Chi tiet tai lieu</div>
                <div className="mt-1 text-sm text-slate-500">Thong tin file</div>
              </div>
              <button
                type="button"
                onClick={() => setDocDetail(null)}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                aria-label="Dong"
              >
                <CloseOutlinedIcon fontSize="small" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-xs text-slate-500">Ten tai lieu</div>
                <div className="font-semibold text-slate-800">{docDetail.name}</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Chu so huu</div>
                  <div className="font-semibold text-slate-700">{docDetail.ownerLabel}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Loai file</div>
                  <div className="font-semibold text-slate-700">{docDetail.typeLabel}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Kich thuoc</div>
                  <div className="font-semibold text-slate-700">{formatFileSize(docDetail.size)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Ngay upload</div>
                  <div className="font-semibold text-slate-700">{formatDateTime(docDetail.createdAt)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
                  <div className="text-xs text-slate-500">Trang thai</div>
                  <div className="font-semibold text-slate-700">{docDetail.status}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
                  <div className="text-xs text-slate-500">Duong dan</div>
                  <div className="break-all font-semibold text-slate-700">{docDetail.resolvedUrl || "—"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {docPreviewState.open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 p-3">
          <div
            onMouseEnter={() => setDocPreviewWindowState((prev) => ({ ...prev, hovered: true }))}
            onMouseLeave={() => setDocPreviewWindowState((prev) => ({ ...prev, hovered: false }))}
            className={`relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all ${
              docPreviewWindowState.minimized
                ? "h-16 max-w-xl self-end"
                : docPreviewWindowState.maximized
                  ? "h-[95vh] max-w-none"
                  : "h-[90vh] max-w-6xl"
            } ${docPreviewWindowState.hovered ? "ring-2 ring-slate-300/80" : ""}`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">Xem truoc file</div>
                <div className="text-xs text-slate-500">{docPreviewState.file?.name}</div>
              </div>
              <div
                className={`flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 transition-all duration-200 ${
                  docPreviewWindowState.hovered
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setDocPreviewWindowState((prev) => ({ ...prev, minimized: true, hovered: false }))}
                  className="rounded-md p-1 text-slate-600 transition hover:bg-slate-100"
                  aria-label="Minimize preview"
                  title="Thu nho"
                >
                  <RemoveOutlinedIcon fontSize="small" />
                </button>
                <button
                  type="button"
                  onClick={() => setDocPreviewWindowState((prev) => ({
                    ...prev,
                    maximized: !prev.maximized,
                  }))}
                  className="rounded-md p-1 text-slate-600 transition hover:bg-slate-100"
                  aria-label="Toggle maximize preview"
                  title={docPreviewWindowState.maximized ? "Khoi phuc" : "Phong to"}
                >
                  {docPreviewWindowState.maximized ? (
                    <FilterNoneOutlinedIcon fontSize="small" />
                  ) : (
                    <CropSquareOutlinedIcon fontSize="small" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDocPreviewClose}
                  className="rounded-md p-1 text-slate-600 transition hover:bg-red-100 hover:text-red-700"
                  aria-label="Close preview"
                  title="Dong"
                >
                  <CloseOutlinedIcon fontSize="small" />
                </button>
              </div>
            </div>

            {!docPreviewWindowState.minimized && (
              <div className="relative min-h-0 flex-1 bg-slate-50 p-3">
                <div
                  className={`pointer-events-none absolute inset-0 bg-slate-500/10 transition-opacity duration-200 ${
                    docPreviewWindowState.hovered ? "opacity-100" : "opacity-0"
                  }`}
                />

                {docPreviewState.loading && (
                  <div className="grid h-full place-items-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600">
                    Dang tai noi dung...
                  </div>
                )}

                {!docPreviewState.loading && docPreviewState.error && (
                  <div className="grid h-full place-items-center rounded-xl border border-amber-100 bg-amber-50 text-sm font-semibold text-amber-800">
                    {docPreviewState.error}
                  </div>
                )}

                {!docPreviewState.loading && !docPreviewState.error && docPreviewState.kind === PREVIEW_KIND.PDF && docPreviewState.objectUrl && (
                  <iframe
                    title="PDF Preview"
                    src={docPreviewState.objectUrl}
                    className="h-full w-full rounded-xl border border-slate-200 bg-white"
                  />
                )}

                {!docPreviewState.loading && !docPreviewState.error && docPreviewState.kind === PREVIEW_KIND.IMAGE && docPreviewState.objectUrl && (
                  <div className="grid h-full place-items-center rounded-xl border border-slate-200 bg-white p-3">
                    <img
                      src={docPreviewState.objectUrl}
                      alt={docPreviewState.file?.name || "preview"}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}

                {!docPreviewState.loading && !docPreviewState.error && docPreviewState.kind === PREVIEW_KIND.TEXT && (
                  <pre className="h-full overflow-auto rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
                    {docPreviewState.textContent || "Khong co noi dung"}
                  </pre>
                )}

                {!docPreviewState.loading && !docPreviewState.error && docPreviewState.kind === PREVIEW_KIND.OFFICE && docPreviewState.objectUrl && (
                  <div className="h-full rounded-xl border border-slate-200 bg-white p-2">
                    <iframe
                      title="Office Preview"
                      src={docPreviewState.objectUrl}
                      className="h-full w-full rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}

            {docPreviewWindowState.minimized && (
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="truncate text-sm font-semibold text-slate-700">
                  {docPreviewState.file?.name}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDocPreviewWindowState((prev) => ({ ...prev, minimized: false }))}
                    className="rounded-md p-1 text-slate-600 transition hover:bg-slate-100"
                    title="Mo lai"
                  >
                    <CropSquareOutlinedIcon fontSize="small" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDocPreviewClose}
                    className="rounded-md p-1 text-slate-600 transition hover:bg-red-100 hover:text-red-700"
                    title="Dong"
                  >
                    <CloseOutlinedIcon fontSize="small" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {docSummaryState.open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 p-3">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-slate-800">Ket qua tom tat</div>
                <div className="mt-1 text-sm text-slate-500">{docSummaryState.file?.name}</div>
              </div>
              <button
                type="button"
                onClick={handleDocSummaryClose}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                aria-label="Dong"
              >
                <CloseOutlinedIcon fontSize="small" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {(docSummaryState.status === "connecting" || docSummaryState.status === "processing") && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600">
                  {docSummaryState.status === "connecting" ? "Dang ket noi AI..." : "Dang tom tat..."}
                </div>
              )}

              {docSummaryState.status === "processing" && docSummaryState.progress.total > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Tien trinh xu ly</span>
                    <span className="text-blue-600">
                      {Math.round((docSummaryState.progress.current / docSummaryState.progress.total) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-sky-500 transition-all duration-300 ease-out"
                      style={{ width: `${(docSummaryState.progress.current / docSummaryState.progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {docSummaryState.status === "error" && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm font-semibold text-rose-700">
                  {docSummaryState.errorMessage}
                </div>
              )}

              <div className="max-h-[60vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {docSummaryState.summaries.length > 0 ? (
                  docSummaryState.summaries.map((text, idx) => (
                    <div
                      key={`${text.slice(0, 12)}-${idx}`}
                      className="relative mb-3 pl-5 leading-relaxed text-slate-700 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-blue-500"
                    >
                      {text}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">Chua co ket qua tom tat.</div>
                )}
                <div ref={docSummaryEndRef} />
              </div>

              {docSummaryState.status === "done" && (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-3 text-emerald-600">
                  <AutoAwesomeOutlinedIcon fontSize="small" />
                  <span className="text-sm font-bold">Da tom tat hoan tat!</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleDocDownloadCurrentSummary}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Tai summary
              </button>
              <button
                type="button"
                onClick={handleDocSummaryClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Dong
              </button>
            </div>
          </div>
        </div>
      )}

      {docRestoreDialog.open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 p-3">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="text-lg font-semibold text-slate-800">Khoi phuc tai lieu</div>
            <div className="mt-2 text-sm text-slate-600">
              Ban co muon khoi phuc tai lieu nay khong?
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeDocRestoreDialog}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Huy
              </button>
              <button
                type="button"
                onClick={handleDocRestoreConfirm}
                disabled={docRestoreDialog.submitting}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {docRestoreDialog.submitting ? "Dang khoi phuc..." : "Khoi phuc"}
              </button>
            </div>
          </div>
        </div>
      )}

      {docDeleteDialog.open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 p-3">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="text-lg font-semibold text-slate-800">
              {docDeleteDialog.mode === "hard" ? "Xoa vinh vien" : "Xoa mem tai lieu"}
            </div>
            <div className="mt-2 text-sm text-slate-600">
              {docDeleteDialog.mode === "hard"
                ? "Canh bao: Hanh dong nay se xoa vinh vien tai lieu khoi he thong va khong the khoi phuc."
                : "Ban co chac muon dua tai lieu nay vao thung rac khong?"}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeDocDeleteDialog}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Huy
              </button>
              <button
                type="button"
                onClick={handleDocDeleteConfirm}
                disabled={docDeleteDialog.submitting}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60 ${
                  docDeleteDialog.mode === "hard" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {docDeleteDialog.submitting
                  ? "Dang xu ly..."
                  : docDeleteDialog.mode === "hard"
                    ? "Xoa vinh vien"
                    : "Xoa mem"}
              </button>
            </div>
          </div>
        </div>
      )}

      {roleDialog.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-3">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="text-lg font-semibold text-slate-800">Cap nhat vai tro</div>
            <div className="mt-1 text-sm text-slate-500">
              {roleDialog.user?.username || "Nguoi dung"}
            </div>

            <select
              value={roleDialog.role}
              onChange={(event) => setRoleDialog((prev) => ({ ...prev, role: event.target.value }))}
              className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleRoleDialogClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Huy
              </button>
              <button
                type="button"
                onClick={handleRoleConfirm}
                disabled={roleDialog.submitting}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {roleDialog.submitting ? "Dang cap nhat..." : "Xac nhan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {softDeleteDialog.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-3">
          <div className="w-full max-w-md animate-[fadeUp_160ms_ease-out] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="text-lg font-semibold text-slate-800">Xoa mem nguoi dung</div>
            <div className="mt-2 text-sm text-slate-600">
              Ban co chac muon xoa mem nguoi dung nay khong?
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleSoftDeleteClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Huy
              </button>
              <button
                type="button"
                onClick={handleSoftDeleteConfirm}
                disabled={softDeleteDialog.submitting}
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
              >
                {softDeleteDialog.submitting ? "Dang xoa..." : "Xoa mem"}
              </button>
            </div>
          </div>
        </div>
      )}

      <RestoreUserDialog
        open={restoreDialog.open}
        user={restoreDialog.user}
        submitting={restoreDialog.submitting}
        onClose={handleRestoreClose}
        onConfirm={handleRestoreConfirm}
      />

      <HardDeleteDialog
        open={hardDeleteDialog.open}
        user={hardDeleteDialog.user}
        submitting={hardDeleteDialog.submitting}
        onClose={handleHardDeleteClose}
        onConfirm={handleHardDeleteConfirm}
      />

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
