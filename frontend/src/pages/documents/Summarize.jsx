import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { AI_URL } from "../../services/api";

const sidebarItems = [
  { key: "home", label: "Trang chủ", icon: HomeOutlinedIcon },
  { key: "documents", label: "Tài liệu của tôi", icon: FolderOpenOutlinedIcon },
  { key: "upload", label: "Tải lên tài liệu", icon: UploadFileOutlinedIcon },
  { key: "summarize", label: "Tóm tắt AI", icon: AutoAwesomeOutlinedIcon },
  { key: "trash", label: "Thùng rác", icon: DeleteOutlineOutlinedIcon },
  { key: "settings", label: "Cài đặt", icon: SettingsOutlinedIcon },
];
const Summarize = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const websocketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, connecting, processing, done, error
  const [errorMessage, setErrorMessage] = useState("");
  const [summaries, setSummaries] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const statusRef = useRef("idle");
  const receivedDoneRef = useRef(false);
  const [activeMenu, setActiveMenu] = useState("summarize");
  const [toast, setToast] = useState("");

  const SUMMARY_WS_URL =
    import.meta.env.VITE_SUMMARY_WS_URL || `${AI_URL}/ws/summarize`;

  // Auto scroll to bottom when new summaries arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [summaries]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Clean up websocket on unmount
  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSummaries([]);
      setStatus("idle");
      setErrorMessage("");
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleStartSummarize = () => {
    if (!file) return;

    setStatus("connecting");
    setSummaries([]);
    setErrorMessage("");
    receivedDoneRef.current = false;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Content = event.target.result;
      connectWebSocket(file.name, base64Content);
    };
    reader.onerror = () => {
      setStatus("error");
      setErrorMessage("Không thể đọc file.");
    };
    reader.readAsDataURL(file);
  };

  const openUploadDialog = () => {
    fileInputRef.current?.click();
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

    if (menuKey === "trash") {
      navigate("/trash");
      return;
    }

    if (menuKey === "settings") {
      navigate("/settings");
      return;
    }
  };

  const connectWebSocket = (filename, base64Content) => {
    const ws = new WebSocket(SUMMARY_WS_URL);
    websocketRef.current = ws;

    ws.onopen = () => {
      setStatus("processing");
      ws.send(
        JSON.stringify({
          filename: filename,
          content: base64Content,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "start") {
          setProgress({ current: 0, total: data.total_chunks });
        } else if (data.type === "progress") {
          // Cập nhật tiến trình xử lý từng chunk
          setProgress((prev) => ({ ...prev, current: data.chunk_index }));
        } else if (data.type === "chunk") {
          // Nhận kết quả tóm tắt cho 1 section (đã gộp các sub-chunks)
          if (data.summary) {
            setSummaries((prev) => [...prev, data.summary]);
          }
        } else if (data.type === "done") {
          receivedDoneRef.current = true;
          setStatus("done");
          ws.close();
        } else if (data.type === "error") {
          setStatus("error");
          setErrorMessage(data.message || "Đã xảy ra lỗi.");
          ws.close();
        }
      } catch (err) {
        console.error("Lỗi parse dữ liệu WebSocket:", err);
      }
    };

    ws.onerror = () => {
      setStatus("error");
      setErrorMessage("Lỗi kết nối WebSocket. Vui lòng kiểm tra server tóm tắt.");
    };

    ws.onclose = (event) => {
      if (statusRef.current === "done" || statusRef.current === "error") {
        return;
      }

      if (statusRef.current !== "idle" && !receivedDoneRef.current) {
        setStatus("error");
        setErrorMessage("Kết nối bị đóng trước khi hoàn tất tóm tắt.");
        return;
      }

      if (!event.wasClean && statusRef.current !== "idle") {
        setStatus("error");
        setErrorMessage("Mất kết nối WebSocket khi đang xử lý.");
      }
    };
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
                disabled={status === "processing" || status === "connecting"}
                className="flex w-full items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <CloudUploadOutlinedIcon fontSize="small" />
                <span className="md:hidden lg:inline">Chọn file</span>
              </button>
              <button
                type="button"
                onClick={handleStartSummarize}
                disabled={!file || status === "processing" || status === "connecting"}
                className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <AutoAwesomeOutlinedIcon fontSize="small" />
                <span className="md:hidden lg:inline">Bắt đầu tóm tắt</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <header className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Tóm Tắt Văn Bản AI</h1>
              <p className="mt-1 text-sm text-slate-500">
                Phân tích và tóm tắt tài liệu.
              </p>
            </div>
          </header>

          <section className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <div
              onClick={openUploadDialog}
              className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                file ? "border-blue-300 bg-blue-50/70" : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/60"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".txt,.pdf,.docx"
                onChange={handleFileChange}
              />

              <div className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl ${file ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-blue-500 shadow-sm"} transition-all group-hover:scale-110`}>
                <CloudUploadOutlinedIcon fontSize="large" />
              </div>

              {file ? (
                <div>
                  <h3 className="text-base font-bold text-slate-800">{file.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-base font-bold text-slate-800">Nhấn để chọn file</h3>
                  <p className="mt-1 text-sm text-slate-500">Hỗ trợ định dạng: .txt, .pdf, .docx</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={handleStartSummarize}
                disabled={!file || status === "connecting" || status === "processing"}
                className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-60"
              >
                <AutoAwesomeOutlinedIcon className={status === "processing" ? "animate-spin" : ""} fontSize="small" />
                {status === "processing" ? "Đang tóm tắt..." : status === "connecting" ? "Đang kết nối..." : "Bắt đầu tóm tắt AI"}
              </button>
              {status === "processing" && progress.total > 0 && (
                <span className="text-sm font-semibold text-blue-700">{progress.current} / {progress.total} đoạn</span>
              )}
            </div>

            {status === "processing" && progress.total > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Tiến trình xử lý</span>
                  <span className="text-blue-600">{Math.round((progress.current / progress.total) * 100)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-sky-500 transition-all duration-300 ease-out"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <ErrorOutlineOutlinedIcon fontSize="small" />
                <p className="font-semibold">{errorMessage}</p>
              </div>
            )}
          </section>

          {(summaries.length > 0 || status === "done") && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                <AutoAwesomeOutlinedIcon className="text-amber-500" fontSize="small" />
                Kết quả tóm tắt
              </h3>
              <div className="space-y-3">
                {summaries.length > 0 ? (
                  summaries.map((text, idx) => (
                    <div
                      key={idx}
                      className="animate-fade-in-up relative pl-5 text-sm text-slate-700 leading-relaxed before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-blue-500"
                    >
                      {text}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">
                    Chưa có ý tóm tắt nào được tạo.
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {status === "done" && (
                <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-3 text-emerald-600">
                  <CheckCircleOutlineOutlinedIcon fontSize="small" />
                  <span className="text-sm font-bold">Đã tóm tắt hoàn tất!</span>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default Summarize;
