import React, { useState, useRef, useEffect } from "react";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import TextFieldsOutlinedIcon from "@mui/icons-material/TextFieldsOutlined";
import { WS_BASE_URL } from "../services/api";

/**
 * TextSummarizer – tab "Tóm tắt từ văn bản"
 *
 * Sử dụng WebSocket qua Spring Boot proxy → Python AI server
 * Endpoint: ws://localhost:8080/ws/summarize-text
 *
 * Props:
 *   status        – global status string (idle | connecting | processing | done | error)
 *   setStatus     – setter
 *   setErrorMessage
 *   setSummaries  – receives [summaryString, ...]
 *   setToast      – optional toast for transient messages
 */
const MAX_CHAR_COUNT = 30000; // Giới hạn tối đa 100,000 ký tự

const TextSummarizer = ({
  status,
  setStatus,
  setErrorMessage,
  setSummaries,
  setToast,
}) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const textareaRef = useRef(null);
  const websocketRef = useRef(null);
  const statusRef = useRef("idle");
  const receivedDoneRef = useRef(false);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const SUMMARY_TEXT_WS_URL =
    import.meta.env.VITE_SUMMARY_TEXT_WS_URL || `${WS_BASE_URL}/ws/summarize-text`;

  // Sync status ref
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Clean up websocket on unmount
  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  /* ---- public handle (can be called from parent via ref or prop) ---- */
  const focusTextarea = () => {
    textareaRef.current?.focus();
  };

  const handleSummarize = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (trimmed.length > MAX_CHAR_COUNT) {
      setStatus("error");
      setErrorMessage(
        `Văn bản quá dài (${trimmed.length.toLocaleString()} ký tự). Giới hạn tối đa là ${MAX_CHAR_COUNT.toLocaleString()} ký tự.`
      );
      return;
    }

    setLoading(true);
    setStatus("connecting");
    setSummaries([]);
    setErrorMessage("");
    setProgress({ current: 0, total: 0 });
    receivedDoneRef.current = false;

    const ws = new WebSocket(SUMMARY_TEXT_WS_URL);
    websocketRef.current = ws;

    ws.onopen = () => {
      setStatus("processing");
      // Gửi text tới Python server (qua Spring Boot proxy)
      ws.send(JSON.stringify({ text: trimmed }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "start") {
          setProgress({ current: 0, total: data.total_chunks });
        } else if (data.type === "progress") {
          setProgress((prev) => ({
            ...prev,
            current: data.chunk_index,
          }));
        } else if (data.type === "chunk") {
          if (data.summary) {
            setSummaries((prev) => [...prev, data.summary]);
          }
        } else if (data.type === "done") {
          receivedDoneRef.current = true;
          setStatus("done");
          setLoading(false);
          ws.close();
        } else if (data.type === "error") {
          setStatus("error");
          setErrorMessage(data.message || "Đã xảy ra lỗi.");
          setLoading(false);
          ws.close();
        }
      } catch (err) {
        console.error("Lỗi parse dữ liệu WebSocket:", err);
      }
    };

    ws.onerror = () => {
      setStatus("error");
      setErrorMessage("Lỗi kết nối WebSocket. Vui lòng kiểm tra server tóm tắt.");
      setLoading(false);
    };

    ws.onclose = (event) => {
      if (statusRef.current === "done" || statusRef.current === "error") {
        return;
      }

      if (statusRef.current !== "idle" && !receivedDoneRef.current) {
        setStatus("error");
        setErrorMessage("Kết nối bị đóng trước khi hoàn tất tóm tắt.");
        setLoading(false);
        return;
      }

      if (!event.wasClean && statusRef.current !== "idle") {
        setStatus("error");
        setErrorMessage("Mất kết nối WebSocket khi đang xử lý.");
        setLoading(false);
      }
    };
  };

  return (
    <div className="space-y-4">
      {/* Icon + heading */}
      <div className="flex items-center gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-sm">
          <TextFieldsOutlinedIcon fontSize="small" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Nhập văn bản cần tóm tắt
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nhập trực tiếp nội dung vào bên dưới
          </p>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        id="text-summarizer-textarea"
        ref={textareaRef}
        className="w-full min-h-[220px] resize-y rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-4 text-sm leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        placeholder="Nhập hoặc dán nội dung văn bản cần tóm tắt..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />

      {/* Counters */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span className={charCount > MAX_CHAR_COUNT ? "text-red-500 font-bold" : charCount > MAX_CHAR_COUNT * 0.9 ? "text-amber-500 font-semibold" : ""}>
          ✉️  {charCount.toLocaleString()} / {MAX_CHAR_COUNT.toLocaleString()} ký tự
          {charCount > MAX_CHAR_COUNT && " (Đã vượt giới hạn!)"}
        </span>
        <span>
          📖  {wordCount.toLocaleString()} từ
        </span>
      </div>

      {/* Progress bar */}
      {status === "processing" && progress.total > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>Tiến trình xử lý</span>
            <span className="text-blue-600 dark:text-blue-400">
              {Math.round((progress.current / progress.total) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-sky-500 transition-all duration-300 ease-out"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Submit button */}
      <button
        id="text-summarizer-submit"
        type="button"
        onClick={handleSummarize}
        disabled={!text.trim() || loading}
        className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 dark:shadow-none transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-60"
      >
        <AutoAwesomeOutlinedIcon
          className={loading ? "animate-spin" : ""}
          fontSize="small"
        />
        {loading ? "Đang tóm tắt..." : "Tóm tắt văn bản"}
      </button>
    </div>
  );
};

export default TextSummarizer;
