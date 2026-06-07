import { useEffect, useMemo, useState } from "react";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DataObjectOutlinedIcon from "@mui/icons-material/DataObjectOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import { summaryHistoryService } from "../../../services/summaryService";

const statusLabelMap = {
  COMPLETED: "Hoàn thành",
  PROCESSING: "Đang xử lý",
  FAILED: "Lỗi",
};

const statusClassMap = {
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PROCESSING: "border-amber-200 bg-amber-50 dark:bg-amber-900/20 text-amber-700",
  FAILED: "border-rose-200 bg-rose-50 text-rose-700",
};

const formatDetailDate = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  const normalizedDate = String(dateValue).replace(/\.(\d{3})\d*/, ".$1");
  const date = new Date(normalizedDate);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} - ${hour}:${minute}`;
};

const getStatusLabel = (status) => statusLabelMap[status] || status || "-";
const getStatusClass = (status) => statusClassMap[status] || "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 dark:text-slate-500";

const getSummaryContent = (detail) => (
  detail?.summaryContent
  || detail?.content
  || detail?.summary
  || detail?.result
  || ""
);

const inputTypeLabelMap = {
  FILE: "File",
  TEXT: "Text",
};

const getInputTypeLabel = (inputType) => inputTypeLabelMap[inputType] || inputType || "-";

const InfoCard = ({ icon: Icon, label, value, children }) => (
  <div className="flex min-h-[76px] gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:text-blue-400">
      <Icon fontSize="small" />
    </div>
    <div className="min-w-0">
      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">{label}</div>
      {children || <div className="mt-1 break-words text-sm font-bold text-slate-900">{value}</div>}
    </div>
  </div>
);

const formatProcessingTime = (seconds) => {
  if (seconds === null || seconds === undefined || seconds === "") {
    return "-";
  }

  const safeSeconds = Number(seconds);

  if (Number.isNaN(safeSeconds)) {
    return "-";
  }

  return `${safeSeconds.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} giây`;
};

const formatLengthInfo = (originalLength, summaryLength) => {
  const hasOriginalLength = originalLength !== null && originalLength !== undefined && originalLength !== "";
  const hasSummaryLength = summaryLength !== null && summaryLength !== undefined && summaryLength !== "";

  if (!hasOriginalLength && !hasSummaryLength) {
    return "-";
  }

  return `gốc: ${hasOriginalLength ? Number(originalLength).toLocaleString("vi-VN") : "-"} từ\ntóm tắt: ${hasSummaryLength ? Number(summaryLength).toLocaleString("vi-VN") : "-"} từ`;
};

const formatCompressionRate = (compressionRate) => {
  if (compressionRate === null || compressionRate === undefined || compressionRate === "") {
    return "-";
  }

  const safeRate = Number(compressionRate);

  if (Number.isNaN(safeRate)) {
    return "-";
  }

  return `${safeRate.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
};

const MetricCard = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">{label}</div>
    <div className="mt-2 whitespace-pre-line text-sm font-bold leading-snug text-slate-950">{value || "-"}</div>
  </div>
);

const ModalSkeleton = () => (
  <div className="space-y-4 p-4">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-[76px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700" />
      ))}
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-[78px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700" />
      ))}
    </div>
    <div className="h-56 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700" />
  </div>
);

const SummaryDetailModal = ({ open, summaryId, initialData, onClose, onNotify }) => {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !summaryId) {
      return undefined;
    }

    let isMounted = true;

    const loadDetail = async () => {
      setDetail(initialData || null);
      setIsLoading(true);
      setError("");

      try {
        const response = await summaryHistoryService.getHistoryDetail(summaryId);
        const nextDetail = response?.data?.data || null;

        if (isMounted) {
          setDetail(nextDetail);
        }
      } catch (detailError) {
        console.error("Failed to fetch summary detail:", detailError);
        if (isMounted) {
          setDetail(initialData || null);
          setError("Không thể tải chi tiết tóm tắt");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [open, summaryId, initialData]);

  const displayData = detail || initialData || {};
  const title = displayData?.title?.trim() || "Không có tiêu đề";
  const summaryContent = useMemo(() => getSummaryContent(displayData), [displayData]);
  const hasSummaryContent = Boolean(summaryContent?.trim());
  const visibleContent = hasSummaryContent ? summaryContent : "Chưa có nội dung tóm tắt";

  if (!open) {
    return null;
  }

  const notify = (message) => {
    if (onNotify) {
      onNotify(message);
    }
  };

  const handleCopy = async () => {
    if (!hasSummaryContent) {
      notify("Không có nội dung để copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(summaryContent);
      notify("Đã copy nội dung");
    } catch (copyError) {
      console.error("Failed to copy summary content:", copyError);
      notify("Không thể copy nội dung");
    }
  };

  const handleDownload = () => {
    if (!hasSummaryContent) {
      return;
    }

    const blob = new Blob([summaryContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `summary-${summaryId}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 px-3 py-6 backdrop-blur-[1px] sm:items-center"
      onMouseDown={onClose}
    >
      <div
        className="w-[95vw] max-w-[700px] overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-slate-900/10"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/50 bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <DescriptionOutlinedIcon className="shrink-0 text-slate-600 dark:text-slate-400 dark:text-slate-500" fontSize="small" />
            <div className="truncate text-base font-black uppercase text-slate-900">
              CHI TIẾT TÓM TẮT TÀI LIỆU #{summaryId}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100"
            title="Đóng"
            aria-label="Đóng"
          >
            <CloseOutlinedIcon fontSize="small" />
          </button>
        </div>

        <div className="max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800">
          {isLoading ? (
            <ModalSkeleton />
          ) : (
            <div className="space-y-4 bg-white dark:bg-slate-800 p-4">
              {error && (
                <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                  Không thể tải chi tiết tóm tắt
                </div>
              )}

              <div>
                <div className="mb-2 text-sm font-black text-slate-900">Thông tin tài liệu</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoCard icon={InsertDriveFileOutlinedIcon} label="Tên tài liệu" value={title} />
                  <InfoCard icon={DataObjectOutlinedIcon} label="Mô hình AI" value={displayData?.aiModel || displayData?.modelName || "-"} />
                  <InfoCard icon={CalendarTodayOutlinedIcon} label="Ngày thực hiện" value={formatDetailDate(displayData?.createdAt)} />
                  <InfoCard icon={TextSnippetOutlinedIcon} label="Loại tóm tắt" value={getInputTypeLabel(displayData?.inputType)} />
                  <InfoCard icon={StorageOutlinedIcon} label="Dung lượng gốc" value={displayData?.fileSize ?? "-"} />
                  <InfoCard icon={CheckCircleOutlinedIcon} label="Trạng thái">
                    <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${getStatusClass(displayData?.status)}`}>
                      {getStatusLabel(displayData?.status)}
                    </span>
                  </InfoCard>
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-black text-slate-900">Thống kê hiệu suất</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard label="Thời gian xử lý" value={formatProcessingTime(displayData?.processingTimeSeconds)} />
                  <MetricCard label="Độ dài" value={formatLengthInfo(displayData?.originalLength, displayData?.summaryLength)} />
                  <MetricCard label="Tỷ lệ nén" value={formatCompressionRate(displayData?.compressionRate)} />
                  <MetricCard label="Độ chính xác" value="-" />
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-black text-slate-900">Văn bản tóm tắt chi tiết</div>
                <div className="max-h-60 min-h-[180px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm leading-6 text-slate-800 dark:text-slate-100">
                  {visibleContent}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={isLoading || !hasSummaryContent}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ContentCopyOutlinedIcon fontSize="small" />
            Copy nội dung
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isLoading || !hasSummaryContent}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DownloadOutlinedIcon fontSize="small" />
            Tải xuống kết quả
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryDetailModal;
