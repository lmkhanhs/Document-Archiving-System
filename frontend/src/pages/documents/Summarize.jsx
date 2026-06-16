import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { WS_BASE_URL } from "../../services/api";
import TextSummarizer from "../../components/TextSummarizer";
import TextFieldsOutlinedIcon from "@mui/icons-material/TextFieldsOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";


const sidebarItems = [
  { key: "home", label: "Trang chủ", icon: HomeOutlinedIcon },
  { key: "documents", label: "Tài liệu của tôi", icon: FolderOpenOutlinedIcon },
  { key: "upload", label: "Tải lên tài liệu", icon: UploadFileOutlinedIcon },
  { key: "summarize", label: "Tóm tắt AI", icon: AutoAwesomeOutlinedIcon },
  { key: "color-board", label: "Bảng màu", icon: PaletteOutlinedIcon },
  { key: "trash", label: "Thùng rác", icon: DeleteOutlineOutlinedIcon },
  { key: "settings", label: "Cài đặt", icon: SettingsOutlinedIcon },
];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB - khớp với server config

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
  const [activeTab, setActiveTab] = useState("file"); // "file" | "text"


  const SUMMARY_WS_URL =
    import.meta.env.VITE_SUMMARY_WS_URL || `${WS_BASE_URL}/ws/summarize`;

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
      if (selectedFile.size > MAX_FILE_SIZE) {
        setStatus("error");
        setErrorMessage(
          `File quá lớn (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB). Giới hạn tối đa là ${MAX_FILE_SIZE / (1024 * 1024)} MB.`
        );
        setFile(null);
        e.target.value = "";
        return;
      }
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

  const connectWebSocket = (filename, base64Content) => {
    const token = localStorage.getItem("accessToken") || "";
    const ws = new WebSocket(`${SUMMARY_WS_URL}?token=${token}`);
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
              {activeTab === "file" ? (
                <>
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
                    className="flex w-full items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-60"
                  >
                    <AutoAwesomeOutlinedIcon fontSize="small" />
                    <span className="md:hidden lg:inline"> Tóm tắt file</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => document.getElementById('text-summarizer-textarea')?.focus()}
                    className="flex w-full items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    <TextFieldsOutlinedIcon fontSize="small" />
                    <span className="md:hidden lg:inline">Nhập văn bản</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('text-summarizer-submit')?.click()}
                    disabled={status === "processing"}
                    className="flex w-full items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-60"
                  >
                    <AutoAwesomeOutlinedIcon fontSize="small" />
                    <span className="md:hidden lg:inline">Tóm tắt văn bản</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <header className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700/50 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Tóm Tắt Văn Bản AI</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Phân tích và tóm tắt tài liệu.
              </p>
            </div>
          </header>

          {/* ── Tab Bar ── */}
          <div className="mt-5 mb-0 flex overflow-hidden rounded-t-2xl border border-b-0 border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setActiveTab("file"); setSummaries([]); setStatus("idle"); setErrorMessage(""); }}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition ${
                activeTab === "file"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <InsertDriveFileOutlinedIcon fontSize="small" />
              Tóm tắt từ file
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("text"); setSummaries([]); setStatus("idle"); setErrorMessage(""); }}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition ${
                activeTab === "text"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <TextFieldsOutlinedIcon fontSize="small" />
              Tóm tắt từ văn bản
            </button>
          </div>

          <section className="rounded-b-2xl rounded-t-none border border-t-0 border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 p-4">
            {activeTab === "file" ? (
              /* ── File Summarizer (original) ── */
              <div>
                <div
                  onClick={openUploadDialog}
                  className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                    file ? "border-blue-300 dark:border-blue-700 bg-blue-50/70 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/60 dark:hover:bg-blue-900/20"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileChange}
                  />

                  <div className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl ${file ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none" : "bg-white dark:bg-slate-800 text-blue-500 shadow-sm border border-slate-100 dark:border-slate-700"} transition-all group-hover:scale-110`}>
                    <CloudUploadOutlinedIcon fontSize="large" />
                  </div>

                  {file ? (
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{file.name}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Nhấn để chọn file</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Hỗ trợ định dạng: .txt, .pdf, .docx</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleStartSummarize}
                    disabled={!file || status === "connecting" || status === "processing"}
                    className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 dark:shadow-none transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-60"
                  >
                    <AutoAwesomeOutlinedIcon className={status === "processing" ? "animate-spin" : ""} fontSize="small" />
                    {status === "processing" ? "Đang tóm tắt..." : status === "connecting" ? "Đang kết nối..." : "Bắt đầu tóm tắt AI"}
                  </button>
                </div>

                {status === "processing" && progress.total > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <span>Tiến trình xử lý</span>
                      <span className="text-blue-600 dark:text-blue-400">{Math.round((progress.current / progress.total) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-sky-500 transition-all duration-300 ease-out"
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {status === "error" && (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400">
                    <ErrorOutlineOutlinedIcon fontSize="small" />
                    <p className="font-semibold">{errorMessage}</p>
                  </div>
                )}
              </div>
            ) : (
              /* ── Text Summarizer ── */
              <TextSummarizer
                status={status}
                setStatus={setStatus}
                setErrorMessage={setErrorMessage}
                setSummaries={setSummaries}
                setToast={setToast}
              />
            )}
          </section>

          {(summaries.length > 0 || status === "done") && (
            <section className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
                <AutoAwesomeOutlinedIcon className="text-amber-500" fontSize="small" />
                Kết quả tóm tắt
              </h3>
              <div className="space-y-3">
                {summaries.length > 0 ? (
                  summaries.map((text, idx) => (
                    <div
                      key={idx}
                      className="animate-fade-in-up relative pl-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-blue-500"
                    >
                      {text}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Chưa có ý tóm tắt nào được tạo.
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {status === "done" && (
                <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 py-3 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
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
