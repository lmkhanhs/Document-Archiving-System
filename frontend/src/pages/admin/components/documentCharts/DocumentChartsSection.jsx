import { useMemo } from "react";
import DocumentFileTypeChart from "./DocumentFileTypeChart";
import RecentUploadsChart from "./RecentUploadsChart";
import StorageUsageChart from "./StorageUsageChart";
import TopUploadersChart from "./TopUploadersChart";
import {
  DOCUMENT_STORAGE_LIMIT_BYTES,
  buildFileTypeData,
  buildRecentUploadData,
  buildStorageUsageData,
  buildTopUploadersData,
  getChartDocuments,
} from "./chartUtils";

const DocumentChartsSection = ({ documents = [], isLoading = false, storageLimitBytes = DOCUMENT_STORAGE_LIMIT_BYTES }) => {
  const chartDocuments = useMemo(() => getChartDocuments(documents), [documents]);

  const fileTypeData = useMemo(() => buildFileTypeData(chartDocuments), [chartDocuments]);
  const recentUploadData = useMemo(() => buildRecentUploadData(chartDocuments, 7), [chartDocuments]);
  const topUploadersData = useMemo(() => buildTopUploadersData(chartDocuments, 5), [chartDocuments]);
  const storageUsageData = useMemo(
    () => buildStorageUsageData(chartDocuments, storageLimitBytes),
    [chartDocuments, storageLimitBytes]
  );

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Biểu đồ quản lý tài liệu
        </div>
        <div className="text-lg font-bold text-slate-900">Tổng quan dữ liệu lưu trữ</div>
      </div>

      <div className="grid items-stretch gap-6 md:grid-cols-2">
        <DocumentFileTypeChart data={fileTypeData} isLoading={isLoading} />
        <StorageUsageChart data={storageUsageData} isLoading={isLoading} />
        <RecentUploadsChart data={recentUploadData} isLoading={isLoading} />
        <TopUploadersChart data={topUploadersData} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default DocumentChartsSection;
