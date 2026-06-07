import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard, { ChartSkeleton, ChartTooltip, EmptyChartState } from "./ChartCard";

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(document.documentElement.classList.contains("dark")));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
};

const dayOptions = [7, 14, 30];

const RecentUploadsChart = ({
  data,
  isLoading,
  error = "",
  selectedDays = 7,
  onDaysChange,
}) => {
  const isDark = useDarkMode();
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const tickColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <ChartCard
      title="Tài liệu tải lên gần đây"
      className="min-h-[380px]"
      action={(
        <select
          value={selectedDays}
          onChange={(event) => onDaysChange?.(Number(event.target.value))}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 outline-none transition hover:bg-slate-50 dark:hover:bg-slate-800/50 focus:border-blue-300 dark:focus:border-blue-500/50"
          aria-label="Chọn số ngày thống kê"
        >
          {dayOptions.map((days) => (
            <option key={days} value={days}>{days} ngày</option>
          ))}
        </select>
      )}
    >
      {isLoading ? (
        <ChartSkeleton />
      ) : error ? (
        <EmptyChartState message="Không thể tải dữ liệu" />
      ) : total === 0 ? (
        <EmptyChartState message={`Chưa có tài liệu tải lên trong ${selectedDays} ngày gần đây`} />
      ) : (
        <div className="h-[300px] min-h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 22, right: 12, left: -12, bottom: 8 }}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" interval={0} minTickGap={0} tickLine={false} axisLine={false} tick={{ fill: tickColor, fontSize: 12, fontWeight: 700 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: tickColor, fontSize: 11 }} />
              <Tooltip content={<ChartTooltip formatter={(value, item) => `${item?.payload?.fullDate}: ${value} tài liệu`} />} />
              <Bar dataKey="count" fill="#2563eb" radius={[10, 10, 0, 0]} maxBarSize={52} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
};

export default RecentUploadsChart;
