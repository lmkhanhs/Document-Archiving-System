import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard, { ChartSkeleton, ChartTooltip, EmptyChartState } from "./ChartCard";

const RecentUploadsChart = ({ data, isLoading }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <ChartCard title="Tài liệu tải lên gần đây" className="min-h-[380px]">
      {isLoading ? (
        <ChartSkeleton />
      ) : total === 0 ? (
        <EmptyChartState message="Chưa có tài liệu tải lên trong 7 ngày gần đây" />
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
