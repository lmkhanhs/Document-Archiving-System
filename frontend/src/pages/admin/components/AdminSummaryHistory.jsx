import { useEffect, useMemo, useState } from "react";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import LoopOutlinedIcon from "@mui/icons-material/LoopOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchSummaryStatistics } from "../../../services/summaryService";

const defaultSummaryStatistics = {
  summaryHistory30Days: {
    total: 0,
    unit: "lượt",
    todayIncrease: 0,
  },
  summarizedContent: {
    total: 0,
    thisWeekIncrease: 0,
    fileCount: 0,
    textCount: 0,
  },
  averageProcessingTime: {
    value: 0,
    unit: "s",
    changePercent: 0,
  },
  processingTasks: {
    total: 0,
    isLoading: false,
  },
};

const toSafeNumber = (value) => (value === null || value === undefined ? 0 : Number(value) || 0);

const formatSignedNumber = (value) => {
  const safeValue = toSafeNumber(value);
  return `${safeValue > 0 ? "+" : ""}${safeValue}`;
};

const formatStatValue = (value) => {
  const safeValue = toSafeNumber(value);
  return Number.isInteger(safeValue) ? safeValue.toLocaleString("vi-VN") : safeValue.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
};

const trendData = [
  { label: "0 ngày", value: 18 },
  { label: "1 ngày", value: 80 },
  { label: "2 ngày", value: 50 },
  { label: "3 ngày", value: 38 },
  { label: "4 ngày", value: 75 },
  { label: "5 ngày", value: 40 },
  { label: "6 ngày", value: 73 },
  { label: "7 ngày", value: 22 },
];

const inputTypeData = [
  { name: "Text", value: 578, color: "#7fc5ee" },
  { name: "File", value: 312, color: "#2563a9" },
];

const inputTypeTotal = inputTypeData.reduce((sum, item) => sum + item.value, 0);

const historyRows = [
  {
    id: 1,
    title: "Báo cáo tài chính Q4",
    type: "Chi tiết",
    user: "admin",
    time: "09:15, 25/05/2024",
    size: "4.2 MB",
    status: "Hoàn thành",
    inputType: "file",
  },
  {
    id: 2,
    title: "Tóm tắt tin tức sáng nay",
    type: "Ngắn gọn",
    user: "admin",
    time: "09:15, 25/05/2024",
    size: "-",
    status: "Hoàn thành",
    inputType: "text",
  },
  {
    id: 3,
    title: "Hợp đồng lao động - NV X",
    type: "Chi tiết",
    user: "admin",
    time: "15:42, 24/05/2024",
    size: "1.1 MB",
    status: "Hoàn thành",
    inputType: "file",
  },
  {
    id: 4,
    title: "Mô tả dự án AI mới",
    type: "Đoạn ngắn",
    user: "admin",
    time: "11:00, 24/05/2024",
    size: "-",
    status: "Đang xử lý",
    inputType: "text",
  },
  {
    id: 5,
    title: "Bài viết kỹ thuật AI mới",
    type: "Chi tiết",
    user: "admin",
    time: "09:30, 23/05/2024",
    size: "-",
    status: "Lỗi (Nội dung quá dài)",
    inputType: "text",
    canRetry: true,
  },
];

const statusClassMap = {
  "Hoàn thành": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Đang xử lý": "border-amber-200 bg-amber-50 text-amber-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

const getStatusClass = (status) => (
  status.startsWith("Lỗi") ? statusClassMap.error : statusClassMap[status]
);

const AdminSummaryHistory = ({ onNotify }) => {
  const [summaryStatistics, setSummaryStatistics] = useState(defaultSummaryStatistics);
  const [isStatisticsLoading, setIsStatisticsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSummaryStatistics = async () => {
      setIsStatisticsLoading(true);

      try {
        const data = await fetchSummaryStatistics();
        if (isMounted) {
          setSummaryStatistics({
            summaryHistory30Days: {
              total: toSafeNumber(data?.summaryHistory30Days?.total),
              unit: data?.summaryHistory30Days?.unit || "lượt",
              todayIncrease: toSafeNumber(data?.summaryHistory30Days?.todayIncrease),
            },
            summarizedContent: {
              total: toSafeNumber(data?.summarizedContent?.total),
              thisWeekIncrease: toSafeNumber(data?.summarizedContent?.thisWeekIncrease),
              fileCount: toSafeNumber(data?.summarizedContent?.fileCount),
              textCount: toSafeNumber(data?.summarizedContent?.textCount),
            },
            averageProcessingTime: {
              value: toSafeNumber(data?.averageProcessingTime?.value),
              unit: data?.averageProcessingTime?.unit || "s",
              changePercent: toSafeNumber(data?.averageProcessingTime?.changePercent),
            },
            processingTasks: {
              total: toSafeNumber(data?.processingTasks?.total),
              isLoading: Boolean(data?.processingTasks?.isLoading),
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch summary statistics:", error);
        if (isMounted) {
          setSummaryStatistics(defaultSummaryStatistics);
        }
      } finally {
        if (isMounted) {
          setIsStatisticsLoading(false);
        }
      }
    };

    loadSummaryStatistics();

    return () => {
      isMounted = false;
    };
  }, []);

  const summaryStats = useMemo(() => {
    const history = summaryStatistics.summaryHistory30Days;
    const content = summaryStatistics.summarizedContent;
    const averageTime = summaryStatistics.averageProcessingTime;
    const processingTasks = summaryStatistics.processingTasks;

    return [
      {
        key: "history",
        label: "Lịch sử tóm tắt (30 ngày)",
        value: `${formatStatValue(history.total)} ${history.unit || "lượt"}`,
        sub: `${formatSignedNumber(history.todayIncrease)} hôm nay`,
        tone: "from-blue-600 to-sky-500",
      },
      {
        key: "content",
        label: "Nội dung đã tóm tắt",
        value: formatStatValue(content.total),
        sub: `${formatSignedNumber(content.thisWeekIncrease)} tuần này`,
        tone: "from-sky-600 to-cyan-500",
        tooltip: [
          `Tổng: ${formatStatValue(content.total)}`,
          `File: ${formatStatValue(content.fileCount)}`,
          `Text: ${formatStatValue(content.textCount)}`,
        ],
      },
      {
        key: "time",
        label: "Thời gian TB",
        value: `${formatStatValue(averageTime.value)}${averageTime.unit || "s"}`,
        sub: `${formatSignedNumber(averageTime.changePercent)}% so với tháng`,
        tone: "from-emerald-600 to-emerald-400",
      },
      {
        key: "task",
        label: "Task đang xử lý",
        value: formatStatValue(processingTasks.total),
        sub: processingTasks.isLoading ? "Loader" : "Không có task chạy",
        tone: "from-violet-600 to-purple-500",
        loading: processingTasks.isLoading,
      },
    ];
  }, [summaryStatistics]);

  const handleAction = (message) => {
    if (onNotify) {
      onNotify(message);
    }
  };

  return (
    <section className="mt-6 space-y-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          QUẢN LÝ LỊCH SỬ TÓM TẮT
        </div>
        <div className="text-lg font-bold text-slate-900">Quản lý lịch sử tóm tắt</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map((card) => (
          <div
            key={card.key}
            className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${card.tone}`}>
              <AutoAwesomeOutlinedIcon fontSize="inherit" />
              Báo cáo
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-600">{card.label}</div>
            {isStatisticsLoading ? (
              <>
                <div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
                <div className="mt-3 h-3 w-20 animate-pulse rounded bg-slate-100" />
              </>
            ) : (
              <>
                <div className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
                  {card.value}
                  {card.loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />}
                </div>
                <div className="mt-2 text-xs text-slate-500">{card.sub}</div>
              </>
            )}

            {card.tooltip && (
              <div className="pointer-events-none absolute right-4 top-10 z-10 w-28 rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-600 opacity-100 shadow-sm transition md:opacity-0 md:group-hover:opacity-100">
                {card.tooltip.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-base font-bold text-slate-900">
              Báo cáo: Xu hướng tóm tắt theo thời gian
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-slate-50 p-1 text-xs font-semibold text-slate-600">
              <button type="button" className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700 shadow-sm">
                7 ngày
              </button>
              <button type="button" className="rounded-lg px-3 py-1.5 transition hover:bg-white hover:text-slate-900">
                30 ngày
              </button>
              <button type="button" className="rounded-lg px-2 py-1.5 transition hover:bg-white hover:text-slate-900" aria-label="Tùy chọn biểu đồ">
                <MoreHorizOutlinedIcon fontSize="small" />
              </button>
            </div>
          </div>

          <div className="mt-4 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="summaryTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.34} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#334155", fontSize: 12 }} interval={0} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={42} />
                <Tooltip
                  formatter={(value) => [`${value} lượt`, "Tóm tắt"]}
                  contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2f8fbd"
                  strokeWidth={2.5}
                  fill="url(#summaryTrendFill)"
                  dot={{ r: 4, fill: "#2f8fbd", stroke: "#ffffff", strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-base font-bold text-slate-900">Báo cáo: Tỷ lệ loại đầu vào</div>
          <div className="mt-4 grid min-h-[260px] items-center gap-4 sm:grid-cols-[1fr_auto]">
            <div className="relative h-[230px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inputTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={1}
                    stroke="#ffffff"
                    strokeWidth={3}
                  >
                    {inputTypeData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} lượt`, name]}
                    contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <DescriptionOutlinedIcon className="text-blue-600" fontSize="small" />
                  <div className="mt-1 text-sm font-bold text-slate-700">Tổng: {inputTypeTotal}</div>
                </div>
              </div>
              <div className="absolute right-2 top-8 text-xs font-semibold text-slate-700">≈ 65%<br />Text</div>
              <div className="absolute left-2 top-12 text-xs font-semibold text-slate-700">≈ 35%<br />File</div>
            </div>

            <div className="space-y-3 pr-2 text-sm font-semibold text-slate-700">
              {inputTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 whitespace-nowrap">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-3">
          <label className="text-sm font-semibold text-slate-700">
            Ngày tóm tắt
            <div className="relative mt-1">
              <CalendarTodayOutlinedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
              <input
                type="text"
                placeholder="ngày tóm tắt - date tóm tắt"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-600 outline-none transition focus:border-blue-300 focus:bg-white"
              />
            </div>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Loại đầu vào
            <select className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-300">
              <option>Tất cả</option>
              <option>File</option>
              <option>Text</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Trạng thái
            <select className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-300">
              <option>Tất cả</option>
              <option>Hoàn thành</option>
              <option>Đang xử lý</option>
              <option>Lỗi</option>
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-auto">
          <table className="min-w-[980px] w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nội dung</th>
                <th className="px-4 py-3">Kiểu tóm tắt</th>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Dung lượng (File)</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {historyRows.map((row) => {
                const ContentIcon = row.inputType === "file" ? InsertDriveFileOutlinedIcon : TextSnippetOutlinedIcon;

                return (
                  <tr key={row.id} className="border-t border-slate-100 text-sm text-slate-700 transition hover:bg-blue-50/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                          <ContentIcon fontSize="small" />
                        </div>
                        <span className="font-semibold text-slate-800">{row.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-600">{row.type}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{row.user}</td>
                    <td className="px-4 py-3 text-slate-600">{row.time}</td>
                    <td className="px-4 py-3 text-slate-600">{row.size}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleAction("Tính năng xem chi tiết sẽ được gắn API sau")}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                          title="Xem chi tiết"
                          aria-label="Xem chi tiết"
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </button>
                        {row.canRetry && (
                          <button
                            type="button"
                            onClick={() => handleAction("Đã gửi yêu cầu xử lý lại")}
                            className="rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50"
                            title="Tải lại / xử lý lại"
                            aria-label="Tải lại / xử lý lại"
                          >
                            <LoopOutlinedIcon fontSize="small" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleAction("Tính năng xóa sẽ được gắn API sau")}
                          className="rounded-lg border border-rose-100 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
                          title="Xóa"
                          aria-label="Xóa"
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
          {["Prev", "1", "2", "3", "...", "10", "Next"].map((item) => (
            <button
              key={item}
              type="button"
              className={`rounded-lg border px-3 py-1.5 transition ${
                item === "1"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-transparent hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminSummaryHistory;
