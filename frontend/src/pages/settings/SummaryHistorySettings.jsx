import { useEffect, useMemo, useState } from "react";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TextFieldsOutlinedIcon from "@mui/icons-material/TextFieldsOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { previewDocument } from "../../services/documentService";
import { getMySummaryHistories, getSummaryHistoryDetail } from "../../services/summaryHistoryService";

const TYPE_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "FILE", label: "File" },
  { value: "TEXT", label: "Văn bản" },
];

const TIME_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "today", label: "Hôm nay" },
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
];

const formatDateTime = (value) => value
  ? new Date(value).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  : "-";

const normalizeStatus = (status) => {
  if (status === "COMPLETED" || status === "SUCCESS") {
    return { label: "Hoàn thành", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  }
  if (status === "FAILED" || status === "ERROR") {
    return { label: "Thất bại", className: "border-rose-200 bg-rose-50 text-rose-700" };
  }
  return { label: "Đang xử lý", className: "border-amber-200 bg-amber-50 text-amber-700" };
};

const truncateText = (value = "", max = 180) => {
  const text = String(value || "").trim();
  if (!text) return "-";
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

const getTitle = (item) => {
  if (item?.inputType === "TEXT") {
    return "Văn bản nhập trực tiếp";
  }
  return item?.fileName || item?.title || "File";
};

const getFileExtension = (fileName = "") => {
  const index = String(fileName).lastIndexOf(".");
  return index >= 0 ? String(fileName).slice(index + 1).toLowerCase() : "";
};

const detectPreviewKind = ({ name = "", mimeType = "" }) => {
  const extension = getFileExtension(name);
  const mime = String(mimeType).toLowerCase();
  if (mime.includes("pdf") || extension === "pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("text/") || ["txt", "md", "json", "csv", "log", "xml", "html", "css", "js", "ts"].includes(extension)) return "text";
  return "pdf";
};

const SummaryHistorySettings = ({ showToast }) => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [time, setTime] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filePreview, setFilePreview] = useState({ loading: false, error: "", kind: "", objectUrl: "", textContent: "" });

  const filters = useMemo(() => ({ search, type, time }), [search, type, time]);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const payload = await getMySummaryHistories(filters);
        if (isMounted) {
          setItems(Array.isArray(payload) ? payload : []);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || "Không thể tải lịch sử tóm tắt");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [filters]);

  useEffect(() => () => {
    if (filePreview.objectUrl) {
      URL.revokeObjectURL(filePreview.objectUrl);
    }
  }, [filePreview.objectUrl]);

  const loadFilePreview = async (historyDetail) => {
    if (filePreview.objectUrl) {
      URL.revokeObjectURL(filePreview.objectUrl);
    }

    if (historyDetail?.inputType !== "FILE" || !historyDetail?.fileId) {
      setFilePreview({ loading: false, error: "", kind: "", objectUrl: "", textContent: "" });
      return;
    }

    setFilePreview({ loading: true, error: "", kind: "", objectUrl: "", textContent: "" });
    try {
      const { blob, contentType } = await previewDocument(historyDetail.fileId);
      const kind = detectPreviewKind({ name: historyDetail.fileName || historyDetail.title, mimeType: contentType });

      if (kind === "text") {
        const textContent = await blob.text();
        setFilePreview({ loading: false, error: "", kind, objectUrl: "", textContent });
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      setFilePreview({ loading: false, error: "", kind, objectUrl, textContent: "" });
    } catch {
      setFilePreview({
        loading: false,
        error: "File gốc không còn tồn tại hoặc đã bị xóa",
        kind: "",
        objectUrl: "",
        textContent: "",
      });
    }
  };

  const openDetail = async (item) => {
    setDetailLoading(true);
    setDetail(null);
    setFilePreview({ loading: false, error: "", kind: "", objectUrl: "", textContent: "" });
    try {
      const payload = await getSummaryHistoryDetail(item.id);
      setDetail(payload);
      await loadFilePreview(payload);
    } catch (requestError) {
      showToast?.("error", requestError.message || "Không thể tải chi tiết lịch sử tóm tắt");
    } finally {
      setDetailLoading(false);
    }
  };

  const copySummary = async () => {
    if (!detail?.summaryContent) {
      showToast?.("error", "Không có nội dung tóm tắt để sao chép");
      return;
    }

    try {
      await navigator.clipboard.writeText(detail.summaryContent);
      showToast?.("success", "Đã sao chép tóm tắt");
    } catch {
      showToast?.("error", "Không thể sao chép tóm tắt");
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <AutoAwesomeOutlinedIcon fontSize="small" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Lịch sử tóm tắt</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Xem lại các nội dung bạn đã tóm tắt từ file hoặc văn bản nhập trực tiếp.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo nội dung hoặc tên file"
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-blue-300"
          />
          <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none">
            {TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={time} onChange={(event) => setTime(event.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none">
            {TIME_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />)}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-semibold text-rose-700">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">Chưa có lịch sử tóm tắt phù hợp.</div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => {
            const status = normalizeStatus(item.status);
            const Icon = item.inputType === "TEXT" ? TextFieldsOutlinedIcon : DescriptionOutlinedIcon;
            return (
              <article key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <Icon fontSize="small" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-slate-800 dark:text-slate-100">{getTitle(item)}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{item.inputType === "TEXT" ? "Văn bản" : "File"}</span>
                        <span>•</span>
                        <span>{formatDateTime(item.createdAt)}</span>
                        <span className={`rounded-full border px-2 py-0.5 font-semibold ${status.className}`}>{status.label}</span>
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => openDetail(item)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700">
                    <VisibilityOutlinedIcon fontSize="small" />
                    Xem chi tiết
                  </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3">
                    <div className="mb-1 text-xs font-bold uppercase text-slate-400">Nội dung gốc</div>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{truncateText(item.originalPreview)}</p>
                  </div>
                  <div className="rounded-xl bg-blue-50/60 dark:bg-blue-900/20 p-3">
                    <div className="mb-1 text-xs font-bold uppercase text-blue-500">Tóm tắt</div>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{truncateText(item.summaryPreview)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Chi tiết tóm tắt</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{detail ? `${getTitle(detail)} • ${formatDateTime(detail.createdAt)}` : "Đang tải..."}</p>
              </div>
              <button type="button" onClick={() => setDetail(null)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                <CloseOutlinedIcon fontSize="small" />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-6 text-sm font-semibold text-slate-500">Đang tải chi tiết...</div>
            ) : (
              <div className="grid min-h-0 flex-1 gap-4 overflow-auto p-5 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
                  <h4 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">Nội dung gốc</h4>
                  {detail?.inputType === "FILE" ? (
                    <div className="h-[60vh] overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                      {filePreview.loading && <div className="grid h-full place-items-center text-sm font-semibold text-slate-500">Đang tải file gốc...</div>}
                      {!filePreview.loading && filePreview.error && <div className="grid h-full place-items-center p-4 text-center text-sm font-semibold text-amber-700">{filePreview.error}</div>}
                      {!filePreview.loading && !filePreview.error && filePreview.kind === "text" && (
                        <pre className="h-full overflow-auto p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{filePreview.textContent}</pre>
                      )}
                      {!filePreview.loading && !filePreview.error && filePreview.kind === "image" && filePreview.objectUrl && (
                        <div className="grid h-full place-items-center overflow-auto p-3"><img src={filePreview.objectUrl} alt={detail.fileName || detail.title} className="max-h-full max-w-full object-contain" /></div>
                      )}
                      {!filePreview.loading && !filePreview.error && filePreview.kind === "pdf" && filePreview.objectUrl && (
                        <object data={`${filePreview.objectUrl}#navpanes=0&view=FitH`} type="application/pdf" className="h-full w-full" />
                      )}
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{detail?.originalContent || "-"}</pre>
                  )}
                </section>
                <section className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/20 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Nội dung tóm tắt</h4>
                    <button type="button" onClick={copySummary} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700">
                      <ContentCopyOutlinedIcon fontSize="inherit" />
                      Sao chép
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{detail?.summaryContent || "-"}</pre>
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryHistorySettings;
