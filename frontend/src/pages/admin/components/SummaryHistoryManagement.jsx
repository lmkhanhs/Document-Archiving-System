import { useMemo, useState } from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const summaryStatusBadgeMap = {
  SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
  PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
};

const summaryStatusLabel = {
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  PROCESSING: "Đang xử lý",
};

const mockRows = Array.from({ length: 28 }).map((_, idx) => {
  const statuses = ["SUCCESS", "FAILED", "PROCESSING"];
  const status = statuses[idx % 3];
  const original = 900 + idx * 27;
  const summary = Math.floor(original * 0.28);
  return {
    key: idx + 1,
    stt: idx + 1,
    userName: `user_${idx + 1}`,
    email: `user${idx + 1}@mail.com`,
    documentName: `Tai_lieu_bao_cao_${idx + 1}.pdf`,
    fileType: "PDF",
    model: idx % 2 === 0 ? "claude-sonnet-4-6" : "claude-opus-4-8",
    originalLength: original,
    summaryLength: summary,
    duration: `${(2 + (idx % 9) * 0.7).toFixed(1)}s`,
    createdAt: `2026-05-${String((idx % 30) + 1).padStart(2, "0")} 10:${String((idx * 3) % 60).padStart(2, "0")}`,
    status,
    summaryContent: `Day la noi dung tom tat #${idx + 1}. He thong da rut gon van ban va giu lai cac y chinh quan trong de quan tri vien xem nhanh ket qua xu ly AI.`,
  };
});

const lineDataMap = {
  "7d": [
    { label: "T2", value: 108 },
    { label: "T3", value: 126 },
    { label: "T4", value: 119 },
    { label: "T5", value: 143 },
    { label: "T6", value: 160 },
    { label: "T7", value: 132 },
    { label: "CN", value: 118 },
  ],
  "30d": Array.from({ length: 30 }).map((_, i) => ({
    label: `${i + 1}`,
    value: 80 + ((i * 13) % 95),
  })),
  "12m": [
    { label: "T1", value: 2100 },
    { label: "T2", value: 2260 },
    { label: "T3", value: 2390 },
    { label: "T4", value: 2480 },
    { label: "T5", value: 2600 },
    { label: "T6", value: 2540 },
    { label: "T7", value: 2720 },
    { label: "T8", value: 2850 },
    { label: "T9", value: 2930 },
    { label: "T10", value: 3010 },
    { label: "T11", value: 3150 },
    { label: "T12", value: 3280 },
  ],
};

const pieData = [
  { name: "SUCCESS", value: 84, color: "#16a34a" },
  { name: "FAILED", value: 9, color: "#dc2626" },
  { name: "PROCESSING", value: 7, color: "#f59e0b" },
];

const PAGE_SIZE_OPTIONS = [8, 15, 25];

export default function SummaryHistoryManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [lineRange, setLineRange] = useState("7d");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [detailRow, setDetailRow] = useState(null);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return mockRows.filter((row) => {
      const passSearch =
        !keyword ||
        row.documentName.toLowerCase().includes(keyword) ||
        row.userName.toLowerCase().includes(keyword);
      const passStatus = statusFilter === "ALL" || row.status === statusFilter;
      return passSearch && passStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filteredRows.length / pageSize);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <section className="mt-6 space-y-4">
      {/* Title */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Lịch sử tóm tắt
        </div>
        <div className="text-lg font-bold text-slate-900">
          Danh sách lịch sử tóm tắt
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            key: "total-summaries",
            label: "Tổng lượt tóm tắt",
            value: "18,540",
            sub: "+12.4% so với kỳ trước",
            tone: "from-blue-600 to-sky-500",
          },
          {
            key: "today-summaries",
            label: "Tóm tắt hôm nay",
            value: "312",
            sub: "+18.9% so với hôm qua",
            tone: "from-indigo-600 to-blue-500",
          },
          {
            key: "success-rate",
            label: "Tỷ lệ thành công",
            value: "92%",
            sub: "+1.6% theo tuần",
            tone: "from-violet-600 to-purple-500",
          },
          {
            key: "avg-duration",
            label: "Thời gian xử lý trung bình",
            value: "12.4s",
            sub: "-8.0% so với tháng trước",
            tone: "from-amber-600 to-orange-500",
          },
        ].map((card) => (
          <div
            key={card.key}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200"
          >
            <div
              className={`inline-flex items-center rounded-2xl bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${card.tone}`}
            >
              Báo cáo
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-600">
              {card.label}
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {card.value}
            </div>
            <div className="mt-2 text-xs text-slate-500">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Line Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Thống kê tóm tắt
              </div>
              <div className="mt-1 text-base font-bold text-slate-900">
                Lượt tóm tắt theo thời gian
              </div>
            </div>
            <select
              value={lineRange}
              onChange={(e) => setLineRange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-300"
            >
              <option value="7d">7 ngày</option>
              <option value="30d">30 ngày</option>
              <option value="12m">12 tháng</option>
            </select>
          </div>
          <div className="mt-4 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineDataMap[lineRange]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={18}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value} lượt`, "Tóm tắt"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#2563eb" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Trạng thái xử lý
          </div>
          <div className="mt-1 text-base font-bold text-slate-900">
            Phân bố SUCCESS / FAILED / PROCESSING
          </div>
          <div className="mt-4 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={98}
                  paddingAngle={2}
                >
                  {pieData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap lg:justify-between">
          <div className="relative w-full lg:max-w-[520px] lg:flex-1">
            <SearchOutlinedIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tài liệu hoặc người dùng..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
            />
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-300"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="FAILED">Thất bại</option>
              <option value="PROCESSING">Đang xử lý</option>
            </select>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <DownloadOutlinedIcon fontSize="small" />
              Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-slate-600">
            {filteredRows.length} lịch sử tóm tắt
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-500">/ trang</span>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
            Không tìm thấy bản ghi nào phù hợp.
          </div>
        ) : (
          <>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-auto">
                <table className="min-w-[1200px] w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">STT</th>
                      <th className="px-4 py-3">Người dùng</th>
                      <th className="px-4 py-3">Tên tài liệu</th>
                      <th className="px-4 py-3">Loại file</th>
                      <th className="px-4 py-3">Độ dài gốc</th>
                      <th className="px-4 py-3">Độ dài tóm tắt</th>
                      <th className="px-4 py-3">Thời gian xử lý</th>
                      <th className="px-4 py-3">Ngày tạo</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.map((row) => (
                      <tr
                        key={row.key}
                        className="border-t border-slate-100 text-sm text-slate-700 transition hover:bg-blue-50/40"
                      >
                        <td className="px-4 py-3 font-semibold text-slate-500">
                          {row.stt}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {row.userName}
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">
                          {row.documentName}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.fileType}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.originalLength.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.summaryLength.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.duration}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.createdAt}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              summaryStatusBadgeMap[row.status] ||
                              summaryStatusBadgeMap.PROCESSING
                            }`}
                          >
                            {summaryStatusLabel[row.status] || row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setDetailRow(row)}
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                              title="Xem chi tiết"
                              aria-label="Xem chi tiết"
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-500">
                Trang {page} / {totalPages} — Hiển thị{" "}
                {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, filteredRows.length)} trên{" "}
                {filteredRows.length}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ‹ Trước
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map(
                  (_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (page <= 3) {
                      pageNum = idx + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = page - 2 + idx;
                    }
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          page === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sau ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Drawer (Side Panel) */}
      {detailRow && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 transition-opacity"
            onClick={() => setDetailRow(null)}
          />

          {/* Panel */}
          <div className="relative z-10 flex w-full max-w-lg flex-col bg-white shadow-2xl animate-[fadeUp_200ms_ease-out]">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Chi tiết
                </div>
                <div className="text-base font-bold text-slate-900">
                  Chi tiết lần tóm tắt
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailRow(null)}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
              >
                <CloseOutlinedIcon fontSize="small" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Thông tin chung
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">
                      Người dùng
                    </span>
                    <span className="font-semibold">{detailRow.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Email</span>
                    <span>{detailRow.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">
                      Tài liệu
                    </span>
                    <span className="max-w-[200px] truncate text-right">
                      {detailRow.documentName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">
                      Loại file
                    </span>
                    <span>{detailRow.fileType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">
                      Model AI
                    </span>
                    <span>{detailRow.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">
                      Thời gian xử lý
                    </span>
                    <span>{detailRow.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">
                      Ngày tạo
                    </span>
                    <span>{detailRow.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">
                      Trạng thái
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        summaryStatusBadgeMap[detailRow.status]
                      }`}
                    >
                      {summaryStatusLabel[detailRow.status]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Thông tin thống kê
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">
                      Số từ văn bản gốc
                    </span>
                    <span className="font-semibold">
                      {detailRow.originalLength.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">
                      Số từ bản tóm tắt
                    </span>
                    <span className="font-semibold">
                      {detailRow.summaryLength.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">
                      Tỷ lệ rút gọn
                    </span>
                    <span className="font-semibold text-blue-600">
                      {Math.round(
                        (1 -
                          detailRow.summaryLength / detailRow.originalLength) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Nội dung tóm tắt
                </div>
                <div className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
                  {detailRow.summaryContent}
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setDetailRow(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
