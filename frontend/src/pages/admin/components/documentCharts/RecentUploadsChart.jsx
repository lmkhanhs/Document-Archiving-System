import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard, { ChartSkeleton, ChartTooltip, EmptyChartState } from "./ChartCard";

const dayOptions = [7, 14, 30];

const RecentUploadsChart = ({
  data,
  isLoading,
  error = "",
  selectedDays = 7,
  onDaysChange,
}) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <ChartCard
      title="Tài liệu tải lên gần đây"
      className="min-h-[380px]"
      action={(
        <select
          value={selectedDays}
          onChange={(event) => onDaysChange?.(Number(event.target.value))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 outline-none transition hover:bg-slate-50 focus:border-blue-300"
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
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" interval={0} minTickGap={0} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
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
