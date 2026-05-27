import { useEffect, useState } from "react";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";

const AppearanceSettings = () => {
  // Determine initial state from localStorage or system preference
  const [isDark, setIsDark] = useState(() => {
    if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    const htmlClassList = document.documentElement.classList;
    if (isDark) {
      htmlClassList.add("dark");
      localStorage.theme = "dark";
    } else {
      htmlClassList.remove("dark");
      localStorage.theme = "light";
    }
  }, [isDark]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Giao diện</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tùy chỉnh giao diện hiển thị của ứng dụng.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 max-w-2xl">
        <h3 className="mb-4 text-lg font-bold text-slate-800">Chế độ màu</h3>
        <p className="mb-6 text-sm text-slate-500">
          Lựa chọn chế độ sáng hoặc tối để có trải nghiệm tốt nhất. Lưu ý: Chế độ Dark Mode hiện đang được thử nghiệm.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIsDark(false)}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition ${
              !isDark
                ? "border-blue-600 bg-blue-50/50 text-blue-700"
                : "border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600"
            }`}
          >
            <div className={`rounded-full p-3 ${!isDark ? "bg-blue-100" : "bg-slate-100"}`}>
              <LightModeOutlinedIcon fontSize="medium" />
            </div>
            <span className="font-semibold">Chế độ sáng</span>
          </button>
          
          <button
            onClick={() => setIsDark(true)}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition ${
              isDark
                ? "border-blue-600 bg-blue-50/50 text-blue-700"
                : "border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600"
            }`}
          >
            <div className={`rounded-full p-3 ${isDark ? "bg-blue-100" : "bg-slate-100"}`}>
              <DarkModeOutlinedIcon fontSize="medium" />
            </div>
            <span className="font-semibold">Chế độ tối (Dark Mode)</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AppearanceSettings;
