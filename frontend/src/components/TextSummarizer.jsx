import React, { useState, useRef } from "react";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import TextFieldsOutlinedIcon from "@mui/icons-material/TextFieldsOutlined";
import { AI_URL } from "../services/api";

/**
 * TextSummarizer – tab "Tóm tắt từ văn bản"
 *
 * Props:
 *   status        – global status string (idle | processing | done | error)
 *   setStatus     – setter
 *   setErrorMessage
 *   setSummaries  – receives [summaryString]
 *   setToast      – optional toast for transient messages
 */
const TextSummarizer = ({
  status,
  setStatus,
  setErrorMessage,
  setSummaries,
  setToast,
}) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  /* ---- public handle (can be called from parent via ref or prop) ---- */
  const focusTextarea = () => {
    textareaRef.current?.focus();
  };

  const handleSummarize = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLoading(true);
    setStatus("processing");
    setSummaries([]);
    setErrorMessage("");

    try {
      const response = await fetch(`${AI_URL}/api/v1/summarize/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Lỗi khi tóm tắt văn bản.");
      }

      setSummaries([data.summary]);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
      setStatus("error");
      if (setToast) setToast(err.message);
    } finally {
      setLoading(false);
    }
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
        <span>
          
        </span>
        <span>
          📖  {wordCount.toLocaleString()} từ
        </span>
      </div>

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
