import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { API_ORIGIN } from "../services/api";
import { getInfoUser, logout } from "../services/authService";
import {
  createMyFolder,
  downloadDocument,
  getHomeDashboard,
  uploadDocument,
} from "../services/documentService";
import { deleteDocument, renameDocument } from "../services/fileActionService";

const sidebarItems = [
  { key: "home", label: "Trang chủ", icon: HomeOutlinedIcon },
  { key: "documents", label: "Tài liệu của tôi", icon: FolderOpenOutlinedIcon },
  { key: "upload", label: "Tải lên tài liệu", icon: UploadFileOutlinedIcon },
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
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Home = () => {
  const navigate = useNavigate();
  const uploadInputRef = useRef(null);
  const menuRef = useRef(null);

  const [activeMenu, setActiveMenu] = useState("home");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userName, setUserName] = useState("Người dùng");
  const [avatarLabel, setAvatarLabel] = useState("U");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const user = await getInfoUser();

        if (!isMounted) {
          return;
        }

        setAvatarUrl(resolveThumbnailUrl(user?.thumbnailUrl));
        setUserName(user?.username || "Người dùng");
        setAvatarLabel(user?.username?.trim()?.charAt(0)?.toUpperCase() || "U");
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
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
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

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
      navigate("/login", { replace: true });
      setIsLoggingOut(false);
    }
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
      await uploadDocument({ file });
      setToast("Tải file thành công");
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

  const openFileUrl = (url) => {
    if (!url) {
      setToast("Tệp này chưa có URL để mở");
      return;
    }

    const targetUrl = url.startsWith("http")
      ? url
      : `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const onOpenItem = (item) => {
    if (item.itemType === "FOLDER") {
      setToast(`Mở thư mục: ${item.name}`);
      return;
    }

    openFileUrl(item.url);
  };

  const onDownloadItem = async (item) => {
    if (item.itemType === "FOLDER") {
      setToast("Thư mục không hỗ trợ tải xuống trực tiếp");
      return;
    }

    if (!item.id) {
      setToast("Không thể tải tệp này");
      return;
    }

    try {
      const blob = await downloadDocument(item.id);
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
        if (item.itemType !== "FOLDER" && item.id) {
          try {
            await renameDocument(item.id, nextName.trim());
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
      if (item.itemType !== "FOLDER" && item.id) {
        try {
          await deleteDocument(item.id);
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

  const storagePercent = useMemo(() => {
    const value = homeData?.storage?.usagePercent ?? 0;
    return Math.min(100, Math.max(0, value));
  }, [homeData?.storage?.usagePercent]);

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
                  }}
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
                className="flex w-full items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <CloudUploadOutlinedIcon fontSize="small" />
                <span className="md:hidden lg:inline">Tải lên file</span>
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
          <header className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <SearchOutlinedIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm kiếm file theo tên"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
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
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Tạo tài liệu mới
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
              >
                <NotificationsNoneOutlinedIcon fontSize="small" />
              </button>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5">
                <img
                  src={avatarUrl || undefined}
                  alt={userName}
                  onError={() => setAvatarUrl("")}
                  className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                />
                <span className="max-w-28 truncate text-sm font-semibold text-slate-700">{userName || avatarLabel}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100"
                >
                  <LogoutOutlinedIcon fontSize="small" />
                </button>
              </div>
            </div>
          </header>

          <section className="mt-5 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 md:grid-cols-2 lg:grid-cols-5">
            <select
              value={fileType}
              onChange={(event) => setFileType(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
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
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
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
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
            />

            <button
              type="button"
              onClick={() => setSort((prev) => (prev === "desc" ? "asc" : "desc"))}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Đặt lại bộ lọc
            </button>
          </section>

          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Truy cập nhanh</h2>
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
                      className="group relative rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenItem(item)}
                        className="w-full text-left"
                      >
                        <div className={`mb-3 inline-flex rounded-xl p-2.5 ${iconMeta.className}`}>
                          <Icon fontSize="small" />
                        </div>
                        <div className="truncate text-sm font-semibold text-slate-800">{item.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{formatDateTime(item.lastAccessedAt)}</div>
                      </button>

                      <button
                        type="button"
                        onClick={(event) => showActionMenu(event, item, "menu")}
                        className="absolute right-2 top-2 rounded-lg p-1 text-slate-500 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
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
              <h2 className="text-xl font-bold text-slate-800">Gần đây</h2>
              <span className="text-sm text-slate-500">Sắp xếp theo thời gian cập nhật</span>
            </div>

            {isLoading ? (
              renderTableSkeleton()
            ) : (
              <div className="overflow-auto rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Tên file</th>
                      <th className="px-4 py-3">Người chỉnh sửa</th>
                      <th className="px-4 py-3">Cập nhật</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeData.recent.map((item) => {
                      const normalized = { ...item, itemType: "FILE" };

                      return (
                        <tr
                          key={item.id}
                          onContextMenu={(event) => showActionMenu(event, normalized, "context")}
                          className="group border-t border-slate-100 transition hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{item.editedBy}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{formatDateTime(item.updatedAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={(event) => showActionMenu(event, normalized, "menu")}
                              className="rounded-lg p-1 text-slate-500 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
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

          <section className="mt-8 grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="mb-3 text-xl font-bold text-slate-800">Đề xuất</h2>

              {isLoading ? (
                renderSkeletonCards(3)
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {homeData.suggested.map((item) => {
                    const iconMeta = getFileIcon(item.fileType);
                    const Icon = iconMeta.icon;
                    const normalized = { ...item, itemType: "FILE" };

                    return (
                      <div
                        key={item.id}
                        onContextMenu={(event) => showActionMenu(event, normalized, "context")}
                        className="group relative rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm"
                      >
                        <button type="button" onClick={() => onOpenItem(normalized)} className="w-full text-left">
                          <div className={`mb-3 inline-flex rounded-xl p-2.5 ${iconMeta.className}`}>
                            <Icon fontSize="small" />
                          </div>
                          <div className="truncate text-sm font-semibold text-slate-800">{item.name}</div>
                          <div className="mt-1 text-xs text-slate-500">{item.reason}</div>
                          <div className="mt-1 text-xs text-slate-400">{formatDateTime(item.updatedAt)}</div>
                        </button>

                        <button
                          type="button"
                          onClick={(event) => showActionMenu(event, normalized, "menu")}
                          className="absolute right-2 top-2 rounded-lg p-1 text-slate-500 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
                        >
                          <MoreHorizOutlinedIcon fontSize="small" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-slate-800">Trạng thái hệ thống</h2>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-700">Dung lượng đã sử dụng</div>
                <div className="mt-1 text-sm text-slate-500">
                  {homeData.storage.usedText} / {homeData.storage.totalText}
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all"
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
                <div className="mt-2 text-xs font-semibold text-blue-700">{storagePercent}% đã sử dụng</div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <input ref={uploadInputRef} type="file" hidden onChange={handleUpload} />

      {menuState && (
        <div
          ref={menuRef}
          style={{ left: menuState.x, top: menuState.y }}
          className="fixed z-50 w-44 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          {actionItems.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => onAction(action.key, menuState.item)}
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

export default Home;
