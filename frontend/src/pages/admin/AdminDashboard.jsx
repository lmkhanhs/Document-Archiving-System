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
import { API_ORIGIN } from "../../services/api";
import { getInfoUser, getRoles, logout } from "../../services/authService";

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

    setToast("Tinh nang nay se duoc cap nhat o buoc tiep theo");
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
                  placeholder="Tim kiem nguoi dung, tai lieu..."
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
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
