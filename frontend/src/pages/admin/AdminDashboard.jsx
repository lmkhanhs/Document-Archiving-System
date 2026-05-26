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
import { API_ORIGIN } from "../../services/api";
import { getInfoUser, getRoles, logout } from "../../services/authService";
import {
  deleteUser,
  filterUsers,
  getUsers,
  searchUsers,
  updateUserRole,
  updateUserStatus,
} from "../../services/userService";

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

const statusBadgeMap = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  LOCKED: "bg-rose-50 text-rose-700 border-rose-200",
};

const roleBadgeMap = {
  ADMIN: "bg-blue-50 text-blue-700 border-blue-200",
  USER: "bg-slate-50 text-slate-700 border-slate-200",
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
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [userReloadKey, setUserReloadKey] = useState(0);
  const [detailUser, setDetailUser] = useState(null);
  const [roleDialog, setRoleDialog] = useState({
    open: false,
    user: null,
    role: "USER",
    submitting: false,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    user: null,
    submitting: false,
  });
  const [toast, setToast] = useState("");
  const userMenuRef = useRef(null);
  const userTriggerRef = useRef(null);

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
    if (activeMenu !== "users") {
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
  }, [activeMenu, roleFilter, search, statusFilter, userReloadKey]);

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

    if (item.key === "users" || item.key === "dashboard") {
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
      await updateUserRole(roleDialog.user.id, [roleDialog.role]);
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

  const handleDeleteOpen = (user) => {
    setDeleteDialog({ open: true, user, submitting: false });
  };

  const handleDeleteClose = () => {
    setDeleteDialog({ open: false, user: null, submitting: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.user) {
      return;
    }

    setDeleteDialog((prev) => ({ ...prev, submitting: true }));

    try {
      await deleteUser(deleteDialog.user.id);
      setUsers((prev) => prev.filter((item) => item.id !== deleteDialog.user.id));
      setToast("Đã xóa người dùng");
      handleDeleteClose();
    } catch (error) {
      setToast(error.message || "Không thể xóa người dùng");
      setDeleteDialog((prev) => ({ ...prev, submitting: false }));
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
                He thong tom tat van ban
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
                    <div className="text-xs text-slate-500">Quan tri he thong</div>
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
                    Quan ly tai khoan
                  </div>
                  <div className="text-lg font-bold text-slate-900">Danh sách người dùng</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-300"
                  >
                    <option value="all">Tat ca vai tro</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-300"
                  >
                    <option value="all">Tat ca trang thai</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="LOCKED">LOCKED</option>
                  </select>
                </div>
              </div>

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
                    Lam moi
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
                    Khong tim thay nguoi dung phu hop.
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
                            <th className="px-4 py-3">Vai tro</th>
                            <th className="px-4 py-3">Trang thai</th>
                            <th className="px-4 py-3">Ngay tao</th>
                            <th className="px-4 py-3 text-right">Hanh dong</th>
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
                                    onClick={() => handleDeleteOpen(user)}
                                    className="rounded-lg border border-slate-200 p-2 text-rose-600 transition hover:bg-rose-50"
                                    title="Xoa nguoi dung"
                                    aria-label="Xoa nguoi dung"
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
            </section>
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
                <div className="text-lg font-semibold text-slate-800">Chi tiet nguoi dung</div>
                <div className="mt-1 text-sm text-slate-500">Thong tin tai khoan</div>
              </div>
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Dong
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
                  <div className="text-xs text-slate-500">So dien thoai</div>
                  <div className="font-semibold text-slate-700">{detailUser.phone || "—"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Vai tro</div>
                  <div className="font-semibold text-slate-700">{detailUser.role}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Trang thai</div>
                  <div className="font-semibold text-slate-700">{detailUser.status}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
                  <div className="text-xs text-slate-500">Dia chi</div>
                  <div className="font-semibold text-slate-700">{detailUser.address || "—"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
                  <div className="text-xs text-slate-500">Ngay tao</div>
                  <div className="font-semibold text-slate-700">
                    {formatDate(detailUser.createdAt || detailUser.createdDate || detailUser.created_at)}
                  </div>
                </div>
              </div>
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

      {deleteDialog.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-3">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="text-lg font-semibold text-slate-800">Xoa nguoi dung</div>
            <div className="mt-2 text-sm text-slate-600">
              Ban co chac muon xoa tai khoan <span className="font-semibold">{deleteDialog.user?.username}</span>?
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleDeleteClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Huy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteDialog.submitting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {deleteDialog.submitting ? "Dang xoa..." : "Xoa"}
              </button>
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

export default AdminDashboard;
