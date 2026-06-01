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
import { summaryStatisticsService } from "../../../services/summaryService";

const statusLabelMap = {
  COMPLETED: "Hoàn thành",
  PROCESSING: "Đang xử lý",
  FAILED: "Lỗi",
};

const statusClassMap = {
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PROCESSING: "border-amber-200 bg-amber-50 text-amber-700",
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
const getStatusClass = (status) => statusClassMap[status] || "border-slate-200 bg-slate-50 text-slate-600";

const getSummaryContent = (detail) => (
  detail?.summaryContent
  || detail?.content
  || detail?.summary
  || detail?.result
  || ""
);

const getFailureContent = (detail) => detail?.errorMessage || "Tóm tắt thất bại";

const InfoCard = ({ icon: Icon, label, value, children }) => (
  <div className="flex min-h-[76px] gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
      <Icon fontSize="small" />
    </div>
    <div className="min-w-0">
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      {children || <div className="mt-1 break-words text-sm font-bold text-slate-900">{value}</div>}
    </div>
  </div>
);

const MetricCard = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
    <div className="text-xs font-semibold text-slate-500">{label}</div>
    <div className="mt-2 text-lg font-black text-slate-950">{value || "-"}</div>
  </div>
);

const ModalSkeleton = () => (
  <div className="space-y-4 p-4">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-[76px] animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-[78px] animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
    <div className="h-56 animate-pulse rounded-xl bg-slate-100" />
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
        const response = await summaryStatisticsService.getHistoryDetail(summaryId);
        const nextDetail = response?.data?.data || initialData || null;

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
  const visibleContent = displayData?.status === "FAILED" ? getFailureContent(displayData) : summaryContent || "Chưa có nội dung tóm tắt";

  if (!open) {
    return null;
  }

  const notify = (message) => {
    if (onNotify) {
      onNotify(message);
    }
  };

  const handleCopy = async () => {
    const textToCopy = summaryContent || visibleContent;

    try {
      await navigator.clipboard.writeText(textToCopy || "");
      notify("Đã copy nội dung");
    } catch (copyError) {
      console.error("Failed to copy summary content:", copyError);
      notify("Không thể copy nội dung");
    }
  };

  const handleDownload = () => {
    const textToDownload = summaryContent || visibleContent || "";
    const blob = new Blob([textToDownload], { type: "text/plain;charset=utf-8" });
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
        className="w-[95vw] max-w-[700px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <DescriptionOutlinedIcon className="shrink-0 text-slate-600" fontSize="small" />
            <div className="truncate text-base font-black uppercase text-slate-900">
              CHI TIẾT TÓM TẮT TÀI LIỆU #{summaryId}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            title="Đóng"
            aria-label="Đóng"
          >
            <CloseOutlinedIcon fontSize="small" />
          </button>
        </div>

        <div className="max-h-[90vh] overflow-y-auto bg-white">
          {isLoading ? (
            <ModalSkeleton />
          ) : (
            <div className="space-y-4 bg-white p-4">
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
                  <InfoCard icon={TextSnippetOutlinedIcon} label="Loại tóm tắt" value={displayData?.summaryMode || displayData?.type || "-"} />
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
                  <MetricCard label="Thời gian xử lý" value={displayData?.processingTime || displayData?.processingDuration || "-"} />
                  <MetricCard label="Độ dài" value={displayData?.lengthInfo || displayData?.summaryLength || "-"} />
                  <MetricCard label="Tỷ lệ nén" value={displayData?.compressionRate || "-"} />
          
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-black text-slate-900">Văn bản tóm tắt chi tiết</div>
                <div className="max-h-60 min-h-[180px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm leading-6 text-slate-800">
                  {visibleContent}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ContentCopyOutlinedIcon fontSize="small" />
            Copy nội dung
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
