import { useEffect, useState } from "react";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";

const AppearanceSettings = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
      return localStorage.getItem("theme");
    }
    return "light";
  });

  useEffect(() => {
    const htmlClassList = document.documentElement.classList;
    
    if (theme === "dark") {
      htmlClassList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (theme === "light") {
      htmlClassList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      localStorage.removeItem("theme");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        htmlClassList.add("dark");
      } else {
        htmlClassList.remove("dark");
      }
    }
  }, [theme]);

  // Listen to system changes if theme is "system"
  useEffect(() => {
    if (theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (e.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Giao diện</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Tùy chỉnh giao diện hiển thị của ứng dụng.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 max-w-2xl">
        <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100">Chế độ màu</h3>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Lựa chọn giao diện ưa thích của bạn hoặc để hệ thống tự quyết định.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setTheme("light")}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition ${
              theme === "light"
                ? "border-blue-600 bg-blue-50/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                : "border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-700/50 dark:text-slate-300"
            }`}
          >
            <div className={`rounded-full p-3 ${theme === "light" ? "bg-blue-100 dark:bg-blue-900/40" : "bg-slate-100 dark:bg-slate-700"}`}>
              <LightModeOutlinedIcon fontSize="medium" />
            </div>
            <span className="font-semibold text-sm">Chế độ sáng</span>
          </button>
          
          <button
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition ${
              theme === "dark"
                ? "border-blue-600 bg-blue-50/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                : "border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-700/50 dark:text-slate-300"
            }`}
          >
            <div className={`rounded-full p-3 ${theme === "dark" ? "bg-blue-100 dark:bg-blue-900/40" : "bg-slate-100 dark:bg-slate-700"}`}>
              <DarkModeOutlinedIcon fontSize="medium" />
            </div>
            <span className="font-semibold text-sm">Chế độ tối</span>
          </button>

          <button
            onClick={() => setTheme("system")}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition ${
              theme === "system"
                ? "border-blue-600 bg-blue-50/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                : "border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-700/50 dark:text-slate-300"
            }`}
          >
            <div className={`rounded-full p-3 ${theme === "system" ? "bg-blue-100 dark:bg-blue-900/40" : "bg-slate-100 dark:bg-slate-700"}`}>
              <SettingsSuggestOutlinedIcon fontSize="medium" />
            </div>
            <span className="font-semibold text-sm">Hệ thống</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AppearanceSettings;
