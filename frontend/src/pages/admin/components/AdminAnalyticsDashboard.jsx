import { useEffect, useMemo, useState } from "react";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HourglassBottomOutlinedIcon from "@mui/icons-material/HourglassBottomOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { summaryStatisticsService } from "../../../services/summaryService";
import { statisticsService } from "../../../services/statisticsService";
import { API_ORIGIN } from "../../../services/api";

const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

function getAvatarUrl(thumbnailUrl) {
  if (!thumbnailUrl) return null;
  if (thumbnailUrl.startsWith("http://") || thumbnailUrl.startsWith("https://")) {
    return thumbnailUrl;
  }
  return `${API_ORIGIN}${thumbnailUrl}`;
}

const UserAvatar = ({ user }) => {
  const [hasError, setHasError] = useState(false);
  const avatarUrl = getAvatarUrl(user.thumbnailUrl);

  if (!avatarUrl || hasError) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
        {user.username ? user.username.charAt(0).toUpperCase() : "U"}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={user.username}
      className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
      onError={() => setHasError(true)}
    />
  );
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
      value: Number(item?.count) || 0,
    }))
    : []
);

const formatRelativeTime = (dateString) => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "vừa xong";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} năm trước`;
};

const timeRangeOptions = [
  { label: "Hôm nay", days: 1 },
  { label: "7 ngày gần nhất", days: 7 },
  { label: "30 ngày gần nhất", days: 30 },
  { label: "3 tháng", days: 90 },
  { label: "1 năm", days: 365 },
];

const analyticsSummaryCardsTemplate = [
  {
    key: "users",
    dataKey: "totalUsers",
    format: "number",
    label: "Tổng số người dùng",
    Icon: GroupsOutlinedIcon,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    key: "documents",
    dataKey: "totalDocuments",
    format: "number",
    label: "Tổng số tài liệu",
    Icon: FolderOpenOutlinedIcon,
    tone: "bg-cyan-50 text-cyan-700",
  },
  {
    key: "summaries",
    dataKey: "totalSummaries",
    format: "number",
    label: "Tổng số lượt tóm tắt",
    Icon: AutoAwesomeOutlinedIcon,
    tone: "bg-teal-50 text-teal-700",
  },
  {
    key: "active",
    dataKey: "activeUsers",
    format: "number",
    label: "Người dùng đang hoạt động",
    Icon: PersonOutlinedIcon,
    tone: "bg-violet-50 text-violet-700",
  },
  {
    key: "success",
    dataKey: "successRate",
    format: "percent",
    label: "Tỷ lệ thành công",
    Icon: CheckCircleOutlinedIcon,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "time",
    dataKey: "averageProcessingTime",
    format: "time",
    label: "Thời gian xử lý trung bình",
    Icon: HourglassBottomOutlinedIcon,
    tone: "bg-orange-50 text-orange-700",
  },
];


const documentTypeColors = {
  "PDF": "#2563eb",
  "DOCX": "#0891b2",
  "TXT": "#eab308",
  "Khác": "#7c3aed"
};

const defaultFileTypeData = [
  { name: "PDF", value: 0, color: "#2563eb" },
  { name: "DOCX", value: 0, color: "#0891b2" },
  { name: "TXT", value: 0, color: "#eab308" },
  { name: "Khác", value: 0, color: "#7c3aed" },
];

const activityLogs = [
  { text: "Nguyễn Văn B vừa đăng ký", time: "2 phút trước", type: "success" },
  { text: "Tài liệu \"Báo cáo Anh PhoGPT\" được tải lên", time: "2 phút trước", type: "success" },
  { text: "Tài liệu \"Báo cáo Q1.pdf\" được tải lên", time: "10 phút trước", type: "success" },
  { text: "Tài liệu \"Báo cáo Q1.pdf\" được tải lên", time: "10 phút trước", type: "warning" },
  { text: "Tài liệu \"Báo cáo Q1.pdf\" được tải lên", time: "10 phút trước", type: "success" },
  { text: "Thất bại đơn B vừa đăng ký", time: "10 phút trước", type: "error" },
];

const badgeClassMap = {
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
  error: "border-rose-100 bg-rose-50 text-rose-700",
};

const badgeLabelMap = {
  success: "Status",
  warning: "Warning",
  error: "Error",
};

const activityIconMap = {
  success: CheckCircleOutlinedIcon,
  warning: WarningAmberOutlinedIcon,
  error: ErrorOutlineOutlinedIcon,
};

const AnalyticsCard = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md ${className}`}>
    {children}
  </div>
);

const AnalyticsTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg">
      <div>{label}</div>
      <div className="mt-1 text-blue-700">{formatNumber(payload[0]?.value)} lượt</div>
    </div>
  );
};

const AdminAnalyticsDashboard = () => {
  const [selectedRange, setSelectedRange] = useState("7 ngày gần nhất");
  const [customTrendDays, setCustomTrendDays] = useState("7");
  const [selectedTrendDays, setSelectedTrendDays] = useState(7);
  const [summaryTrendData, setSummaryTrendData] = useState([]);
  const [isTrendLoading, setIsTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState("");

  const [overviewData, setOverviewData] = useState(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  const [docTypeData, setDocTypeData] = useState(defaultFileTypeData);
  const [isDocTypeLoading, setIsDocTypeLoading] = useState(true);
  const [docTypeError, setDocTypeError] = useState("");

  const [topUsersData, setTopUsersData] = useState([]);
  const [isTopUsersLoading, setIsTopUsersLoading] = useState(true);
  const [topUsersError, setTopUsersError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTrendData = async () => {
      setIsTrendLoading(true);
      setTrendError("");

      try {
        const data = await summaryStatisticsService.getTrend(selectedTrendDays);
        if (isMounted) {
          setSummaryTrendData(mapTrendData(data));
        }
      } catch (error) {
        console.error("Failed to fetch summary trend:", error);
        if (isMounted) {
          setSummaryTrendData([]);
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
    const loadOverviewData = async () => {
      setIsOverviewLoading(true);
      setOverviewError("");
      try {
        const data = await statisticsService.getOverview();
        if (isMounted) {
          setOverviewData(data);
        }
      } catch (error) {
        if (isMounted) {
          setOverviewError(error.message || "Lỗi tải dữ liệu");
        }
      } finally {
        if (isMounted) {
          setIsOverviewLoading(false);
        }
      }
    };

    loadOverviewData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadDocTypes = async () => {
      setIsDocTypeLoading(true);
      setDocTypeError("");
      try {
        const data = await statisticsService.getDocumentTypes();
        if (isMounted) {
          const mappedData = data.map(item => ({
            name: item.type,
            value: item.count,
            color: documentTypeColors[item.type] || "#cbd5e1"
          }));
          setDocTypeData(mappedData);
        }
      } catch (error) {
        if (isMounted) {
          setDocTypeError(error.message || "Lỗi tải dữ liệu");
        }
      } finally {
        if (isMounted) {
          setIsDocTypeLoading(false);
        }
      }
    };

    loadDocTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadTopUsers = async () => {
      setIsTopUsersLoading(true);
      setTopUsersError("");
      try {
        const data = await statisticsService.getTopActiveUsers();
        if (isMounted) {
          setTopUsersData(data);
        }
      } catch (error) {
        if (isMounted) {
          setTopUsersError(error.message || "Lỗi tải dữ liệu");
        }
      } finally {
        if (isMounted) {
          setIsTopUsersLoading(false);
        }
      }
    };

    loadTopUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTrendRangeChange = (option) => {
    setSelectedRange(option.label);
    setCustomTrendDays(String(option.days));
    setSelectedTrendDays(option.days);
  };

  const handleCustomTrendDaysChange = (event) => {
    const nextValue = event.target.value;
    setCustomTrendDays(nextValue);
    setSelectedRange("Tùy chỉnh");

    const nextDays = Number(nextValue);
    if (Number.isInteger(nextDays) && nextDays > 0) {
      setSelectedTrendDays(nextDays);
    }
  };

  return (
    <section className="mt-6 space-y-4 bg-slate-50/40">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {analyticsSummaryCardsTemplate.map((card) => {
          const Icon = card.Icon;
          
          let displayValue = (
            <span className="flex items-center gap-1">
              <span className="h-4 w-4 animate-bounce rounded-full bg-slate-300 inline-block"></span>
              <span className="h-4 w-4 animate-bounce rounded-full bg-slate-300 inline-block" style={{ animationDelay: "0.2s" }}></span>
              <span className="h-4 w-4 animate-bounce rounded-full bg-slate-300 inline-block" style={{ animationDelay: "0.4s" }}></span>
            </span>
          );

          if (!isOverviewLoading) {
            if (overviewError || !overviewData) {
              displayValue = "--";
            } else {
              const rawValue = overviewData[card.dataKey];
              if (card.format === "number") {
                displayValue = formatNumber(rawValue);
              } else if (card.format === "percent") {
                displayValue = Number(rawValue || 0).toFixed(1) + "%";
              } else if (card.format === "time") {
                displayValue = Number(rawValue || 0).toFixed(1) + "s";
              }
            }
          }

          return (
            <AnalyticsCard key={card.key} className="p-4 hover:-translate-y-0.5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}>
                <Icon fontSize="small" />
              </div>
              <div className="mt-3 min-h-[32px] text-xs font-semibold text-slate-600">{card.label}</div>
              <div className="mt-2 flex h-8 items-center text-2xl font-black text-slate-950">
                {displayValue}
              </div>
            </AnalyticsCard>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <AnalyticsCard className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-base font-bold text-slate-900">Báo cáo: Xu hướng tóm tắt theo thời gian</div>
            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-50 p-1 text-xs font-semibold text-slate-600">
              {timeRangeOptions.slice(1, 3).map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleTrendRangeChange(item)}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    selectedRange === item.label
                      ? "border border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                      : "hover:bg-white hover:text-slate-900"
                  }`}
                >
                  {item.days} ngày
                </button>
              ))}
              <label className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-slate-600 ring-1 ring-slate-200">
                <input
                  type="number"
                  min="1"
                  value={customTrendDays}
                  onChange={handleCustomTrendDaysChange}
                  className="w-14 bg-transparent text-center text-xs font-bold text-slate-700 outline-none"
                  aria-label="Số ngày tùy chọn"
                />
                <span>ngày</span>
              </label>
              <span className="px-1 text-lg leading-none text-slate-500">...</span>
            </div>
          </div>

          <div className="mt-4 h-[260px] w-full">
            {isTrendLoading ? (
              <div className="flex h-full flex-col justify-end gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="h-full animate-pulse rounded-xl bg-slate-100" />
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div key={index} className="h-2 animate-pulse rounded bg-slate-200" />
                  ))}
                </div>
              </div>
            ) : trendError || summaryTrendData.length === 0 ? (
              <div className="grid h-full place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
                Không có dữ liệu
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summaryTrendData} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.34} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#334155", fontSize: 12 }} interval="preserveStartEnd" />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={42} allowDecimals={false} />
                  <Tooltip content={<AnalyticsTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2f8fbd"
                    strokeWidth={2.5}
                    fill="url(#analyticsTrendFill)"
                    dot={{ r: 4, fill: "#2f8fbd", stroke: "#ffffff", strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </AnalyticsCard>

        <AnalyticsCard className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-black uppercase text-slate-900">Phân tích loại tài liệu</div>
            <div className="text-xs font-semibold text-slate-500">(Bar Chart)</div>
          </div>
          <div className="h-[280px]">
            {isDocTypeLoading ? (
              <div className="flex h-full flex-col justify-end gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-full items-end justify-between gap-4 px-6 pb-2">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="w-16 animate-pulse rounded-t-lg bg-slate-200" style={{ height: `${Math.max(20, Math.random() * 100)}%`, animationDelay: `${index * 0.15}s` }} />
                  ))}
                </div>
                <div className="flex justify-between border-t border-slate-200 px-6 pt-3">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="h-3 w-10 animate-pulse rounded bg-slate-200" style={{ animationDelay: `${index * 0.15}s` }} />
                  ))}
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={docTypeError ? defaultFileTypeData : docTypeData} margin={{ top: 20, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} formatter={(value) => [formatNumber(value), "Số lượng"]} />
                  <Bar 
                    dataKey="value" 
                    radius={[8, 8, 0, 0]} 
                    label={{ position: "top", fill: "#0f172a", fontSize: 11, fontWeight: 700, formatter: (value) => formatNumber(value) }}
                  >
                    {(docTypeError ? defaultFileTypeData : docTypeData).map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </AnalyticsCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <AnalyticsCard className="overflow-hidden p-4">
          <div className="mb-3 text-sm font-black uppercase text-slate-900">Top người dùng hoạt động nhiều nhất</div>
          <div className="overflow-auto rounded-xl border border-slate-100">
            <table className="min-w-[560px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Người dùng</th>
                  <th className="px-3 py-2">Số tài liệu đã tải</th>
                  <th className="px-3 py-2">Số lượt tóm tắt</th>
                  <th className="px-3 py-2">Hoạt động gần nhất</th>
                </tr>
              </thead>
              <tbody>
                {isTopUsersLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-200"></div>
                          <div className="h-4 w-24 animate-pulse rounded bg-slate-200"></div>
                        </div>
                      </td>
                      <td className="px-3 py-2"><div className="h-4 w-10 animate-pulse rounded bg-slate-200"></div></td>
                      <td className="px-3 py-2"><div className="h-4 w-10 animate-pulse rounded bg-slate-200"></div></td>
                      <td className="px-3 py-2"><div className="h-4 w-20 animate-pulse rounded bg-slate-200"></div></td>
                    </tr>
                  ))
                ) : topUsersError || topUsersData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-sm font-semibold text-slate-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  topUsersData.map((user) => (
                    <tr key={user.userId} className="border-t border-slate-100 transition hover:bg-blue-50/40">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={user} />
                          <span className="font-semibold text-slate-800">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-600">{formatNumber(user.uploadedDocuments)}</td>
                      <td className="px-3 py-2 font-semibold text-slate-600">{formatNumber(user.summaryCount)}</td>
                      <td className="px-3 py-2 text-slate-500">{formatRelativeTime(user.lastActiveAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AnalyticsCard>

        <div className="space-y-4">
          <AnalyticsCard className="flex items-center gap-4 p-5">
            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircleOutlinedIcon />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-[600] leading-[1.4] text-[#64748b]">Tỷ lệ thành công</div>
              <div className="mt-0.5 flex items-center truncate text-sm font-semibold text-slate-800">
                {isOverviewLoading ? (
                  <span className="flex h-[28px] items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300"></span>
                    <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: "0.2s" }}></span>
                    <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: "0.4s" }}></span>
                  </span>
                ) : overviewError || !overviewData ? "--" : (
                  Number(overviewData.successRate || 0).toFixed(1) + "%"
                )}
              </div>
            </div>
          </AnalyticsCard>
          
          <AnalyticsCard className="flex items-center gap-4 p-5">
            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <HourglassBottomOutlinedIcon />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-[600] leading-[1.4] text-[#64748b]">Thời gian xử lý trung bình</div>
              <div className="mt-0.5 flex items-center truncate text-sm font-semibold text-slate-800">
                {isOverviewLoading ? (
                  <span className="flex h-[28px] items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300"></span>
                    <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: "0.2s" }}></span>
                    <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: "0.4s" }}></span>
                  </span>
                ) : overviewError || !overviewData ? "--" : (
                  Number(overviewData.averageProcessingTime || 0).toFixed(1) + "s"
                )}
              </div>
            </div>
          </AnalyticsCard>
          
          <AnalyticsCard className="flex items-center gap-4 p-5">
            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <StarRoundedIcon />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-[600] leading-[1.4] text-[#64748b]">Đánh giá trung bình từ người dùng</div>
              <div className="mt-0.5 flex items-center truncate text-sm font-semibold text-slate-800">
                {isOverviewLoading ? (
                  <span className="flex h-[28px] items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300"></span>
                    <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: "0.2s" }}></span>
                    <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: "0.4s" }}></span>
                  </span>
                ) : overviewError || !overviewData ? "--" : "--"}
              </div>
            </div>
          </AnalyticsCard>
        </div>
      </div>

      <AnalyticsCard className="p-4">
        <div className="mb-3 text-sm font-black uppercase text-slate-900">Nhật ký hoạt động mới nhất</div>
        <div className="grid gap-2 md:grid-cols-2">
          {activityLogs.map((log, index) => {
            const Icon = activityIconMap[log.type];

            return (
              <div key={`${log.text}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm transition hover:bg-slate-50">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${log.type === "success" ? "bg-blue-50 text-blue-700" : log.type === "warning" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
                    <Icon fontSize="small" />
                  </div>
                  <div className="truncate font-semibold text-slate-700">{log.text}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">{log.time}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${badgeClassMap[log.type]}`}>{badgeLabelMap[log.type]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </AnalyticsCard>
    </section>
  );
};

export default AdminAnalyticsDashboard;
