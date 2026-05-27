import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";

import { logout } from "../services/authService";
import ProfileSettings from "./settings/ProfileSettings";
import ChangePasswordSettings from "./settings/ChangePasswordSettings";
import AppearanceSettings from "./settings/AppearanceSettings";

const sidebarItems = [
  { key: "home", label: "Trang chủ", icon: HomeOutlinedIcon },
  { key: "documents", label: "Tài liệu của tôi", icon: FolderOpenOutlinedIcon },
  { key: "upload", label: "Tải lên tài liệu", icon: UploadFileOutlinedIcon },
  { key: "summarize", label: "Tóm tắt AI", icon: AutoAwesomeOutlinedIcon },
  { key: "trash", label: "Thùng rác", icon: DeleteOutlineOutlinedIcon },
  { key: "settings", label: "Cài đặt", icon: SettingsOutlinedIcon },
];

const settingTabs = [
  { key: "profile", label: "Hồ sơ cá nhân", icon: PersonOutlineOutlinedIcon },
  { key: "security", label: "Đổi mật khẩu", icon: LockOutlinedIcon },
  { key: "appearance", label: "Giao diện", icon: PaletteOutlinedIcon },
];

const USER_CACHE_KEY = "currentUser";

const Settings = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null); // { type: "success"|"error", message }
  const [activeTab, setActiveTab] = useState("profile");

  // Toast auto dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  const handleLogout = async () => {
    try {
      await logout({
        accessToken: localStorage.getItem("accessToken") || "",
        refreshToken: localStorage.getItem("refreshToken") || "",
      });
    } catch {
      // continue
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem(USER_CACHE_KEY);
      navigate("/login", { replace: true });
    }
  };

  const handleSidebarClick = (key) => {
    if (key === "home") navigate("/");
    if (key === "documents") navigate("/documents");
    if (key === "summarize") navigate("/summarize");
    if (key === "trash") navigate("/trash");
    if (key === "settings") return; // already here
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings showToast={showToast} />;
      case "security":
        return <ChangePasswordSettings showToast={showToast} />;
      case "appearance":
        return <AppearanceSettings />;
      default:
        return <ProfileSettings showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white p-3 md:p-5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-3xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-[0_20px_65px_rgba(27,78,163,0.12)] dark:shadow-none transition-colors">
        
        {/* Main Sidebar (App Navigation) */}
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
              const isActive = item.key === "settings";
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
                  <span className="truncate text-sm font-semibold md:hidden lg:inline">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto hidden lg:block">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <LogoutOutlinedIcon fontSize="small" />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Settings 2-Column Layout */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden bg-slate-50/30 dark:bg-transparent">
          
          {/* Settings Menu Column */}
          <div className="w-full border-b border-slate-200 dark:border-slate-700/50 p-4 md:w-64 md:border-b-0 md:border-r lg:w-72 md:p-6 bg-white/50 dark:bg-slate-800/20 transition-colors">
            <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-slate-100">Cài đặt</h2>
            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
              {settingTabs.map((tab) => {
                const isActive = activeTab === tab.key;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition whitespace-nowrap md:whitespace-normal flex-shrink-0 md:flex-shrink-1 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200"
                    }`}
                  >
                    <TabIcon fontSize="small" className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content Column */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {renderActiveTab()}
          </main>
          
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold shadow-xl transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white dark:bg-emerald-700"
              : "bg-red-600 text-white dark:bg-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircleOutlineIcon style={{ fontSize: 18 }} />
          ) : (
            <ErrorOutlineIcon style={{ fontSize: 18 }} />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Settings;
