import { useMemo } from "react";
import DocumentFileTypeChart from "./DocumentFileTypeChart";
import RecentUploadsChart from "./RecentUploadsChart";
import TopUploadersChart from "./TopUploadersChart";
import {
  buildFileTypeData,
  buildFileTypeRatioData,
  buildRecentUploadApiData,
  buildRecentUploadData,
  buildTopUploadersApiData,
  buildTopUploadersData,
  getChartDocuments,
} from "./chartUtils";

const DocumentStatCard = ({ label, value, description, tone = "from-blue-600 to-sky-500", isLoading }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
    <div className={`inline-flex items-center rounded-2xl bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${tone}`}>
      Báo cáo
    </div>
    <div className="mt-3 text-sm font-semibold text-slate-600">{label}</div>
    {isLoading ? (
      <div className="mt-2 h-9 w-20 animate-pulse rounded-lg bg-slate-200" />
    ) : (
      <div className="mt-1 text-3xl font-black text-slate-900">{Number(value || 0).toLocaleString("vi-VN")}</div>
    )}
    <div className="mt-2 text-xs text-slate-500">{description}</div>
  </div>
);

const DocumentChartsSection = ({
  documents = [],
  isLoading = false,
  documentStats = null,
  fileTypeRatio = [],
  recentUploadStats = [],
  selectedRecentUploadDays = 7,
  onRecentUploadDaysChange,
  isDocumentStatsLoading = false,
  isRecentUploadsLoading = false,
  isTopUploadersLoading = false,
  recentUploadsError = "",
  topUploaders = [],
}) => {
  const chartDocuments = useMemo(() => getChartDocuments(documents), [documents]);

  const fallbackFileTypeData = useMemo(() => buildFileTypeData(chartDocuments), [chartDocuments]);
  const apiFileTypeData = useMemo(() => buildFileTypeRatioData(fileTypeRatio), [fileTypeRatio]);
  const fileTypeData = apiFileTypeData.length > 0 ? apiFileTypeData : fallbackFileTypeData;
  const fallbackRecentUploadData = useMemo(() => buildRecentUploadData(chartDocuments, selectedRecentUploadDays), [chartDocuments, selectedRecentUploadDays]);
  const apiRecentUploadData = useMemo(() => buildRecentUploadApiData(recentUploadStats), [recentUploadStats]);
  const recentUploadData = apiRecentUploadData.length > 0 ? apiRecentUploadData : fallbackRecentUploadData;
  const topUploadersData = useMemo(() => buildTopUploadersApiData(topUploaders), [topUploaders]);
  const fallbackStats = useMemo(() => ({
    totalDocuments: chartDocuments.length,
    deletedDocuments: chartDocuments.filter((file) => Boolean(file?.isDeleted || file?.deletedAt || file?.removedAt || file?.trashedAt)).length,
  }), [chartDocuments]);

  const resolvedStats = documentStats || fallbackStats;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <DocumentStatCard
          label="Tổng số tài liệu"
          value={resolvedStats.totalDocuments}
          description="Tất cả tài liệu trong hệ thống"
          isLoading={isDocumentStatsLoading}
        />
        <DocumentStatCard
          label="Tài liệu đã xóa mềm"
          value={resolvedStats.deletedDocuments}
          description="Tài liệu trong thùng rác"
          tone="from-amber-600 to-orange-500"
          isLoading={isDocumentStatsLoading}
        />
      </div>

      <div className="grid items-stretch gap-6 md:grid-cols-2">
        <DocumentFileTypeChart data={fileTypeData} isLoading={isDocumentStatsLoading} />
        <RecentUploadsChart
          data={recentUploadData}
          isLoading={isRecentUploadsLoading}
          error={recentUploadsError}
          selectedDays={selectedRecentUploadDays}
          onDaysChange={onRecentUploadDaysChange}
        />
        <div className="md:col-span-2">
          <TopUploadersChart data={topUploadersData} isLoading={isTopUploadersLoading} />
        </div>
      </div>
    </div>
  );
};

export default DocumentChartsSection;
