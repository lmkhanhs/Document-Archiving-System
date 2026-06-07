import { useEffect, useMemo, useState } from "react";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SummaryDetailModal from "./SummaryDetailModal";
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
import { API_ORIGIN } from "../../../services/api";
import { fetchSummaryStatistics, summaryStatisticsService } from "../../../services/summaryService";

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

const formatTrendLabel = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const [year, month, day] = String(dateValue).split("-");
  if (!year || !month || !day) {
    return String(dateValue);
  }

  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}`;
};

const mapTrendData = (items = []) => (
  Array.isArray(items)
    ? items.map((item) => ({
      label: formatTrendLabel(item?.date),
      value: toSafeNumber(item?.count),
    }))
    : []
);

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-lg">
      <div className="font-bold text-slate-800 dark:text-slate-100">{label}</div>
      <div className="mt-1 font-semibold text-blue-700">
        Tóm tắt: {formatStatValue(payload[0]?.value)} lượt
      </div>
    </div>
  );
};

const defaultInputTypeStatistics = {
  total: 0,
  fileCount: 0,
  textCount: 0,
  filePercent: 0,
  textPercent: 0,
};

const getInputTypeData = (inputTypeStatistics) => [
  { name: "Text", value: toSafeNumber(inputTypeStatistics.textCount), percent: toSafeNumber(inputTypeStatistics.textPercent), color: "#7fc5ee" },
  { name: "File", value: toSafeNumber(inputTypeStatistics.fileCount), percent: toSafeNumber(inputTypeStatistics.filePercent), color: "#2563a9" },
];

const defaultPagination = {
  page: 1,
  size: 5,
  totalItems: 0,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
};

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

const getStatusLabel = (status, errorMessage) => {
  const label = statusLabelMap[status] || status || "-";

  if (status === "FAILED" && errorMessage) {
    return `${label} (${errorMessage})`;
  }

  return label;
};

const getStatusClass = (status) => statusClassMap[status] || "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 dark:text-slate-500";

const formatHistoryTime = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  const normalizedDate = String(dateValue).replace(/\.(\d{3})\d*/, ".$1");
  const date = new Date(normalizedDate);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour12: false,
  });
};

const getContentIcon = (inputType) => {
  if (inputType === "FILE") {
    return InsertDriveFileOutlinedIcon;
  }

  if (inputType === "TEXT") {
    return TextSnippetOutlinedIcon;
  }

  return DescriptionOutlinedIcon;
};

const getAvatarUrl = (thumbnailUrl) => {
  if (!thumbnailUrl) {
    return null;
  }

  if (thumbnailUrl.startsWith("http")) {
    return thumbnailUrl;
  }

  return `${API_ORIGIN}${thumbnailUrl}`;
};

const UserCell = ({ username, thumbnailUrl }) => {
  const [imageError, setImageError] = useState(false);
  const avatarUrl = getAvatarUrl(thumbnailUrl);
  const displayName = username || "-";
  const fallbackLetter = username?.trim()?.charAt(0)?.toUpperCase() || "?";
  const shouldShowImage = avatarUrl && !imageError;

  useEffect(() => {
    setImageError(false);
  }, [thumbnailUrl]);

  return (
    <div className="flex items-center gap-2.5">
      {shouldShowImage ? (
        <img
          src={avatarUrl}
          alt={displayName}
          onError={() => setImageError(true)}
          className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
          {fallbackLetter}
        </div>
      )}
      <span className="font-semibold text-slate-700 dark:text-slate-200">{displayName}</span>
    </div>
  );
};

const AdminSummaryHistory = ({ onNotify }) => {
  const [summaryStatistics, setSummaryStatistics] = useState(defaultSummaryStatistics);
  const [isStatisticsLoading, setIsStatisticsLoading] = useState(true);
  const [selectedTrendDays, setSelectedTrendDays] = useState(7);
  const [customTrendDays, setCustomTrendDays] = useState("7");
  const [trendData, setTrendData] = useState([]);
  const [isTrendLoading, setIsTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState("");
  const [inputTypeStatistics, setInputTypeStatistics] = useState(defaultInputTypeStatistics);
  const [isInputTypeLoading, setIsInputTypeLoading] = useState(true);
  const [inputTypeError, setInputTypeError] = useState("");
  const [historyItems, setHistoryItems] = useState([]);
  const [historyPagination, setHistoryPagination] = useState(defaultPagination);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [historyFilters, setHistoryFilters] = useState({
    page: 1,
    size: 5,
    inputType: "ALL",
    status: "ALL",
    startDate: "",
    endDate: "",
  });
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [historyReloadKey, setHistoryReloadKey] = useState(0);

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

  useEffect(() => {
    let isMounted = true;

    const loadTrendData = async () => {
      setIsTrendLoading(true);
      setTrendError("");

      try {
        const data = await summaryStatisticsService.getTrend(selectedTrendDays);
        if (isMounted) {
          setTrendData(mapTrendData(data));
        }
      } catch (error) {
        console.error("Failed to fetch summary trend:", error);
        if (isMounted) {
          setTrendData([]);
          setTrendError("Không có dữ liệu");
        }
      } finally {
        if (isMounted) {
          setIsTrendLoading(false);
        }
      }
    };

    loadTrendData();

    return () => {
      isMounted = false;
    };
  }, [selectedTrendDays]);

  useEffect(() => {
    let isMounted = true;

    const loadInputTypeStatistics = async () => {
      setIsInputTypeLoading(true);
      setInputTypeError("");

      try {
        const data = await summaryStatisticsService.getInputType();
        if (isMounted) {
          setInputTypeStatistics({
            total: toSafeNumber(data?.total),
            fileCount: toSafeNumber(data?.fileCount),
            textCount: toSafeNumber(data?.textCount),
            filePercent: toSafeNumber(data?.filePercent),
            textPercent: toSafeNumber(data?.textPercent),
          });
        }
      } catch (error) {
        console.error("Failed to fetch input type statistics:", error);
        if (isMounted) {
          setInputTypeStatistics(defaultInputTypeStatistics);
          setInputTypeError("Không có dữ liệu");
        }
      } finally {
        if (isMounted) {
          setIsInputTypeLoading(false);
        }
      }
    };

    loadInputTypeStatistics();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      setIsHistoryLoading(true);
      setHistoryError("");

      try {
        const response = await summaryStatisticsService.getHistory(historyFilters);
        const items = response?.data?.data?.items || [];
        const pagination = response?.data?.data?.pagination || defaultPagination;

        if (isMounted) {
          setHistoryItems(Array.isArray(items) ? items : []);
          setHistoryPagination({ ...defaultPagination, ...pagination });
        }
      } catch (error) {
        console.error("Failed to fetch summary history:", error);
        if (isMounted) {
          setHistoryItems([]);
          setHistoryPagination(defaultPagination);
          setHistoryError("Không thể tải lịch sử tóm tắt");
        }
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [historyFilters, historyReloadKey]);

  const inputTypeData = useMemo(() => getInputTypeData(inputTypeStatistics), [inputTypeStatistics]);
  const inputTypeTotal = toSafeNumber(inputTypeStatistics.total);

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

  const handleTrendDaysChange = (event) => {
    const nextValue = event.target.value;
    setCustomTrendDays(nextValue);

    const nextDays = Number(nextValue);
    if (Number.isInteger(nextDays) && nextDays > 0) {
      setSelectedTrendDays(nextDays);
    }
  };

  const handleHistoryFilterChange = (key, value) => {
    setHistoryFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
      page: 1,
    }));
  };

  const handleHistoryPageChange = (page) => {
    setHistoryFilters((currentFilters) => ({
      ...currentFilters,
      page,
    }));
  };

  const handleOpenDetail = (item) => {
    setSelectedSummary(item);
  };

  const handleCloseDetail = () => {
    setSelectedSummary(null);
  };

  const historyPageButtons = useMemo(() => {
    const totalPages = Math.max(1, toSafeNumber(historyPagination.totalPages));
    const currentPage = Math.min(Math.max(1, toSafeNumber(historyPagination.page) || 1), totalPages);
    const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);

    return Array.from(pages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((firstPage, secondPage) => firstPage - secondPage);
  }, [historyPagination.page, historyPagination.totalPages]);

  const handleAction = (message) => {
    if (onNotify) {
      onNotify(message);
    }
  };

  return (
    <section className="mt-6 space-y-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          QUẢN LÝ LỊCH SỬ TÓM TẮT
        </div>
        <div className="text-lg font-bold text-slate-900">Quản lý lịch sử tóm tắt</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map((card) => (
          <div
            key={card.key}
            className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${card.tone}`}>
              <AutoAwesomeOutlinedIcon fontSize="inherit" />
              Báo cáo
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500">{card.label}</div>
            {isStatisticsLoading ? (
              <>
                <div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
                <div className="mt-3 h-3 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
              </>
            ) : (
              <>
                <div className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
                  {card.value}
                  {card.loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />}
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{card.sub}</div>
              </>
            )}

            {card.tooltip && (
              <div className="pointer-events-none absolute right-4 top-10 z-10 w-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2 text-xs font-semibold text-slate-600 dark:text-slate-400 opacity-100 shadow-sm transition md:opacity-0 md:group-hover:opacity-100">
                {card.tooltip.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-base font-bold text-slate-900">
              Báo cáo: Xu hướng tóm tắt theo thời gian
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-1 text-xs font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setCustomTrendDays("7");
                  setSelectedTrendDays(7);
                }}
                className={`rounded-lg px-3 py-1.5 transition ${
                  selectedTrendDays === 7
                    ? "border border-blue-200 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm"
                    : "hover:bg-white hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                7 ngày
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomTrendDays("30");
                  setSelectedTrendDays(30);
                }}
                className={`rounded-lg px-3 py-1.5 transition ${
                  selectedTrendDays === 30
                    ? "border border-blue-200 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm"
                    : "hover:bg-white hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                30 ngày
              </button>
              <label className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200">
                <input
                  type="number"
                  min="1"
                  value={customTrendDays}
                  onChange={handleTrendDaysChange}
                  className="w-14 bg-transparent text-center text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                  aria-label="Số ngày tùy chọn"
                />
                <span>ngày</span>
              </label>
              <MoreHorizOutlinedIcon fontSize="small" className="mx-1 text-slate-500 dark:text-slate-400 dark:text-slate-500" />
            </div>
          </div>

          <div className="mt-4 h-[260px] w-full">
            {isTrendLoading ? (
              <div className="flex h-full flex-col justify-end gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4">
                <div className="h-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700" />
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div key={index} className="h-2 animate-pulse rounded bg-slate-200" />
                  ))}
                </div>
              </div>
            ) : trendError || trendData.length === 0 ? (
              <div className="grid h-full place-items-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">
                Không có dữ liệu
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="summaryTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.34} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#334155", fontSize: 12 }} interval="preserveStartEnd" />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={42} allowDecimals={false} />
                  <Tooltip content={<TrendTooltip />} />
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
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <div className="text-base font-bold text-slate-900">Báo cáo: Tỷ lệ loại đầu vào</div>
          <div className="mt-4 grid min-h-[260px] items-center gap-4 sm:grid-cols-[1fr_auto]">
            {isInputTypeLoading ? (
              <div className="grid min-h-[230px] animate-pulse place-items-center rounded-2xl bg-slate-50 sm:col-span-2">
                <div className="h-36 w-36 rounded-full border-[26px] border-slate-200" />
              </div>
            ) : inputTypeError || inputTypeTotal === 0 ? (
              <div className="grid min-h-[230px] place-items-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm font-semibold text-slate-500 dark:text-slate-400 sm:col-span-2">
                Không có dữ liệu
              </div>
            ) : (
              <>
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
                        formatter={(value, name) => [`${formatStatValue(value)} lượt`, name]}
                        contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <DescriptionOutlinedIcon className="text-blue-600 dark:text-blue-400" fontSize="small" />
                      <div className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">Tổng: {formatStatValue(inputTypeTotal)}</div>
                    </div>
                  </div>
                  <div className="absolute right-2 top-8 text-xs font-semibold text-slate-700 dark:text-slate-200">≈ {formatStatValue(inputTypeStatistics.textPercent)}%<br />Text</div>
                  <div className="absolute left-2 top-12 text-xs font-semibold text-slate-700 dark:text-slate-200">≈ {formatStatValue(inputTypeStatistics.filePercent)}%<br />File</div>
                </div>

                <div className="space-y-3 pr-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {inputTypeData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 whitespace-nowrap">
                      <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span>{item.name} ({formatStatValue(item.value)})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Ngày bắt đầu
            <div className="relative mt-1">
              <CalendarTodayOutlinedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" fontSize="small" />
              <input
                type="date"
                value={historyFilters.startDate}
                onChange={(event) => handleHistoryFilterChange("startDate", event.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-600 dark:text-slate-400 outline-none transition focus:border-blue-300 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
          </label>

          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Ngày kết thúc
            <div className="relative mt-1">
              <CalendarTodayOutlinedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" fontSize="small" />
              <input
                type="date"
                value={historyFilters.endDate}
                onChange={(event) => handleHistoryFilterChange("endDate", event.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-600 dark:text-slate-400 outline-none transition focus:border-blue-300 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
          </label>

          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Loại đầu vào
            <select
              value={historyFilters.inputType}
              onChange={(event) => handleHistoryFilterChange("inputType", event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 outline-none transition focus:border-blue-300 dark:focus:border-blue-500/50"
            >
              <option value="ALL">Tất cả</option>
              <option value="FILE">File</option>
              <option value="TEXT">Text</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Trạng thái
            <select
              value={historyFilters.status}
              onChange={(event) => handleHistoryFilterChange("status", event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 outline-none transition focus:border-blue-300 dark:focus:border-blue-500/50"
            >
              <option value="ALL">Tất cả</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="FAILED">Lỗi</option>
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="overflow-auto">
          <table className="min-w-[980px] w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">
              <tr>
                <th className="px-4 py-3">Nội dung</th>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Dung lượng (File)</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isHistoryLoading ? (
                Array.from({ length: historyFilters.size }).map((_, index) => (
                  <tr key={index} className="border-t border-slate-100 text-sm text-slate-700 dark:text-slate-200">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700" />
                        <div className="h-4 w-48 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
                      </div>
                    </td>
                    <td className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-700" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-700" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-700" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-24 animate-pulse rounded-full bg-slate-100 dark:bg-slate-700" /></td>
                    <td className="px-4 py-3"><div className="ml-auto h-9 w-28 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700" /></td>
                  </tr>
                ))
              ) : historyError ? (
                <tr className="border-t border-slate-100">
                  <td colSpan={6} className="px-4 py-10 text-center text-sm font-semibold text-rose-600">
                    Không thể tải lịch sử tóm tắt
                  </td>
                </tr>
              ) : historyItems.length === 0 ? (
                <tr className="border-t border-slate-100">
                  <td colSpan={6} className="px-4 py-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    Không có lịch sử tóm tắt
                  </td>
                </tr>
              ) : (
                historyItems.map((item) => {
                  const ContentIcon = getContentIcon(item?.inputType);
                  const title = item?.title?.trim() || "Không có tiêu đề";
                  const statusText = getStatusLabel(item?.status, item?.errorMessage);

                  return (
                    <tr key={item?.id} className="border-t border-slate-100 text-sm text-slate-700 dark:text-slate-200 transition hover:bg-blue-50/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:text-blue-400">
                            <ContentIcon fontSize="small" />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <UserCell username={item?.username} thumbnailUrl={item?.thumbnailUrl} />
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 dark:text-slate-500">{formatHistoryTime(item?.createdAt)}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 dark:text-slate-500">{item?.fileSize ?? "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(item?.status)}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700/50 dark:bg-slate-700"
                            title="Xem chi tiết"
                            aria-label="Xem chi tiết"
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(`Xóa lịch sử #${item?.id}`)}
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
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 dark:border-slate-700/50 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500">
          <button
            type="button"
            disabled={!historyPagination.hasPrevious || isHistoryLoading}
            onClick={() => handleHistoryPageChange(Math.max(1, historyPagination.page - 1))}
            className="rounded-lg border border-transparent px-3 py-1.5 transition hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-transparent disabled:hover:bg-transparent"
          >
            Prev
          </button>
          {historyPageButtons.map((page) => (
            <button
              key={page}
              type="button"
              disabled={isHistoryLoading}
              onClick={() => handleHistoryPageChange(page)}
              className={`rounded-lg border px-3 py-1.5 transition ${
                page === historyPagination.page
                  ? "border-blue-200 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  : "border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-800/50"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            disabled={!historyPagination.hasNext || isHistoryLoading}
            onClick={() => handleHistoryPageChange(historyPagination.page + 1)}
            className="rounded-lg border border-transparent px-3 py-1.5 transition hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-transparent disabled:hover:bg-transparent"
          >
            Next
          </button>
        </div>
      </div>

      <SummaryDetailModal
        open={Boolean(selectedSummary)}
        summaryId={selectedSummary?.id}
        initialData={selectedSummary}
        onClose={handleCloseDetail}
        onNotify={onNotify}
      />
    </section>
  );
};

export default AdminSummaryHistory;
