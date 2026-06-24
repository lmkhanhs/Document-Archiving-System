import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DocumentChartsSection from "./documentCharts/DocumentChartsSection";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const PaginationBar = ({
  currentPage,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalElements <= 0) {
    return null;
  }

  const start = currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalElements);

  const maxVisiblePages = 5;
  let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages);
  if (endPage - startPage < maxVisiblePages) {
    startPage = Math.max(0, endPage - maxVisiblePages);
  }
  const pageNumbers = [];
  for (let i = startPage; i < endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <div className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
        Hiển thị{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{start}-{end}</span>{" "}
        trên{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{totalElements}</span>{" "}
        tài liệu
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
            currentPage === 0
              ? "cursor-not-allowed border-slate-100 bg-slate-50 dark:bg-slate-800/50 text-slate-300"
              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-800/50"
          }`}
        >
          Trước
        </button>

        {pageNumbers.map((pageNum) => (
          <button
            type="button"
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
              pageNum === currentPage
                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-800/50"
            }`}
          >
            {pageNum + 1}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
            currentPage >= totalPages - 1
              ? "cursor-not-allowed border-slate-100 bg-slate-50 dark:bg-slate-800/50 text-slate-300"
              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-800/50"
          }`}
        >
          Sau
        </button>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 outline-none transition focus:border-blue-300 dark:focus:border-blue-500/50"
        >
          {PAGE_SIZE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt} / trang
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const ManagerDocument = ({
  normalizedDocuments,
  filteredDocuments,
  isDocLoading,
  docError,
  documentStats,
  fileTypeRatio,
  recentUploadStats,
  selectedRecentUploadDays,
  setSelectedRecentUploadDays,
  isDocumentStatsLoading,
  isRecentUploadsLoading,
  isTopUploadersLoading,
  recentUploadsError,
  topUploaders,
  documentsView,
  search,
  fileTypeFilter,
  fileTypeOptions,
  setDocumentsView,
  setSearch,
  setFileTypeFilter,
  onRefreshDocuments,
  onShowDetail,
  onPreview,
  onSummary,
  onDownload,
  onRestore,
  onOpenDeleteDialog,
  getFileIconMeta,
  getAvatarLabel,
  formatFileSize,
  formatDateTime,
  documentStatusBadgeMap,
  currentPage,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
  onPageSizeChange,
}) => (
  <section className="mt-6 min-w-0 space-y-4">
    <DocumentChartsSection
      documents={normalizedDocuments}
      isLoading={isDocLoading}
      documentStats={documentStats}
      fileTypeRatio={fileTypeRatio}
      recentUploadStats={recentUploadStats}
      selectedRecentUploadDays={selectedRecentUploadDays}
      onRecentUploadDaysChange={setSelectedRecentUploadDays}
      isDocumentStatsLoading={isDocumentStatsLoading}
      isRecentUploadsLoading={isRecentUploadsLoading}
      isTopUploadersLoading={isTopUploadersLoading}
      recentUploadsError={recentUploadsError}
      topUploaders={topUploaders}
    />

    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400">
          ADMIN DOCUMENTS
        </div>
        <div className="text-xl font-bold text-slate-800 dark:text-slate-100">Quản lý tài liệu</div>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <div className="inline-flex rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => setDocumentsView("all")}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              documentsView === "all"
                ? "bg-blue-600 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 dark:bg-slate-700"
            }`}
          >
            Tất cả tài liệu
          </button>
          <button
            type="button"
            onClick={() => setDocumentsView("trash")}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              documentsView === "trash"
                ? "bg-slate-900 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 dark:bg-slate-700"
            }`}
          >
            Thùng rác
          </button>
        </div>
        <div className="relative w-full sm:w-[300px] lg:w-[350px]">
          <SearchOutlinedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" fontSize="small" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên tài liệu..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-3 text-sm font-semibold text-slate-600 dark:text-slate-400 outline-none transition focus:border-blue-300 dark:focus:border-blue-500/50"
          />
        </div>
        <select
          value={fileTypeFilter}
          onChange={(event) => setFileTypeFilter(event.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 outline-none transition focus:border-blue-300 dark:focus:border-blue-500/50"
        >
          <option value="all">Tất cả các loại file</option>
          {fileTypeOptions.map((type) => (
            type === "all" ? null : (
              <option key={type} value={type}>{type}</option>
            )
          ))}
        </select>
        <button
          type="button"
          onClick={onRefreshDocuments}
          className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-800/50"
        >
          Làm mới
        </button>
      </div>
    </div>

    <div className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
          {totalElements} {documentsView === "trash" ? "tài liệu trong thùng rác" : "tài liệu"}
        </div>
      </div>

      {isDocLoading && (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 dark:bg-slate-800/50 px-4 py-6 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">
          Đang tải danh sách tài liệu...
        </div>
      )}

      {!isDocLoading && docError && (
        <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-6 text-center text-sm font-semibold text-rose-700">
          {docError}
        </div>
      )}

      {!isDocLoading && !docError && filteredDocuments.length === 0 && (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 dark:bg-slate-800/50 px-4 py-6 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">
          {documentsView === "trash" ? "Thùng rác đang trống" : "Không có tài liệu nào"}
        </div>
      )}

      {!isDocLoading && !docError && filteredDocuments.length > 0 && (
        <>
          <div className="mt-4 hidden md:block overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-auto">
              <table className="min-w-[1180px] w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  <tr>
                    <th className="px-4 py-3">File</th>
                    <th className="px-4 py-3">Tên tài liệu</th>
                    <th className="px-4 py-3">Chủ sở hữu</th>
                    <th className="px-4 py-3">Loại file</th>
                    <th className="px-4 py-3">Kích thước</th>
                    <th className="px-4 py-3">Ngày upload</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    {documentsView === "trash" && (
                      <th className="px-4 py-3">Ngày xóa</th>
                    )}
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((file) => {
                    const iconMeta = getFileIconMeta({ name: file.name, mimeType: file.mimeType });
                    const FileIcon = iconMeta.Icon;

                    return (
                      <tr
                        key={file.id}
                        className="border-t border-slate-100 dark:border-slate-700/50 text-sm text-slate-700 dark:text-slate-200 transition hover:bg-blue-50/40"
                      >
                        <td className="px-4 py-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <FileIcon className={iconMeta.className} fontSize="small" />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{file.name}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">ID: {file.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {file.ownerAvatar ? (
                              <img
                                src={file.ownerAvatar}
                                alt={file.ownerLabel}
                                onError={(event) => {
                                  event.currentTarget.src = "";
                                }}
                                className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500">
                                {getAvatarLabel(file.ownerLabel)}
                              </div>
                            )}
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                              {file.ownerLabel}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 dark:text-slate-500">{file.typeLabel}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 dark:text-slate-500">{formatFileSize(file.size)}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 dark:text-slate-500">{formatDateTime(file.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              documentStatusBadgeMap[file.status] || documentStatusBadgeMap.ACTIVE
                            }`}
                          >
                            {file.status}
                          </span>
                        </td>
                        {documentsView === "trash" && (
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 dark:text-slate-500">
                            {formatDateTime(file.deletedAt)}
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {documentsView === "trash" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onRestore(file)}
                                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-emerald-600 transition hover:bg-emerald-50"
                                  title="Khôi phục"
                                  aria-label="Khôi phục"
                                >
                                  <RestoreFromTrashOutlinedIcon fontSize="small" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onOpenDeleteDialog(file, "hard")}
                                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-rose-700 transition hover:bg-rose-50"
                                  title="Xóa vĩnh viễn"
                                  aria-label="Xóa vĩnh viễn"
                                >
                                  <DeleteForeverOutlinedIcon fontSize="small" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onShowDetail(file)}
                                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700/50 dark:bg-slate-700"
                                  title="Xem chi tiết"
                                  aria-label="Xem chi tiết"
                                >
                                  <VisibilityOutlinedIcon fontSize="small" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onPreview(file)}
                                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-blue-600 dark:text-blue-400 transition hover:bg-blue-50"
                                  title="Xem nội dung"
                                  aria-label="Xem nội dung"
                                >
                                  <DescriptionOutlinedIcon fontSize="small" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onSummary(file)}
                                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-amber-600 transition hover:bg-amber-50"
                                  title="Xem tóm tắt"
                                  aria-label="Xem tóm tắt"
                                >
                                  <AutoAwesomeOutlinedIcon fontSize="small" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDownload(file)}
                                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-emerald-600 transition hover:bg-emerald-50"
                                  title="Tải file gốc"
                                  aria-label="Tải file gốc"
                                >
                                  <DownloadOutlinedIcon fontSize="small" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onOpenDeleteDialog(file, "soft")}
                                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-amber-600 transition hover:bg-amber-50"
                                  title="Xóa mềm"
                                  aria-label="Xóa mềm"
                                >
                                  <DeleteOutlineOutlinedIcon fontSize="small" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:hidden">
            {filteredDocuments.map((file) => {
              const iconMeta = getFileIconMeta({ name: file.name, mimeType: file.mimeType });
              const FileIcon = iconMeta.Icon;

              return (
                <div key={file.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <FileIcon className={iconMeta.className} fontSize="small" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{file.name}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                          {file.ownerAvatar ? (
                            <img
                              src={file.ownerAvatar}
                              alt={file.ownerLabel}
                              onError={(event) => {
                                event.currentTarget.src = "";
                              }}
                              className="h-6 w-6 rounded-full border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-100 dark:bg-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500">
                              {getAvatarLabel(file.ownerLabel)}
                            </div>
                          )}
                          <span>{file.ownerLabel}</span>
                          <span>•</span>
                          <span>{file.typeLabel}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        documentStatusBadgeMap[file.status] || documentStatusBadgeMap.ACTIVE
                      }`}
                    >
                      {file.status}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    {formatFileSize(file.size)} • {formatDateTime(file.createdAt)}
                    {documentsView === "trash" && (
                      <span> • Xóa lúc {formatDateTime(file.deletedAt)}</span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {documentsView === "trash" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onRestore(file)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-emerald-600 transition hover:bg-emerald-50"
                          title="Khôi phục"
                          aria-label="Khôi phục"
                        >
                          <RestoreFromTrashOutlinedIcon fontSize="small" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenDeleteDialog(file, "hard")}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-rose-700 transition hover:bg-rose-50"
                          title="Xóa vĩnh viễn"
                          aria-label="Xóa vĩnh viễn"
                        >
                          <DeleteForeverOutlinedIcon fontSize="small" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onShowDetail(file)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700/50 dark:bg-slate-700"
                          title="Xem chi tiết"
                          aria-label="Xem chi tiết"
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onPreview(file)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-blue-600 dark:text-blue-400 transition hover:bg-blue-50"
                          title="Xem nội dung"
                          aria-label="Xem nội dung"
                        >
                          <DescriptionOutlinedIcon fontSize="small" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSummary(file)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-amber-600 transition hover:bg-amber-50"
                          title="Xem tóm tắt"
                          aria-label="Xem tóm tắt"
                        >
                          <AutoAwesomeOutlinedIcon fontSize="small" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDownload(file)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-emerald-600 transition hover:bg-emerald-50"
                          title="Tải file gốc"
                          aria-label="Tải file gốc"
                        >
                          <DownloadOutlinedIcon fontSize="small" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenDeleteDialog(file, "soft")}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-amber-600 transition hover:bg-amber-50"
                          title="Xóa mềm"
                          aria-label="Xóa mềm"
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <PaginationBar
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}
    </div>
  </section>
);

export default ManagerDocument;
