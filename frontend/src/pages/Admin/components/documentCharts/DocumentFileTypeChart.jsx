import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard, { ChartSkeleton, ChartTooltip, EmptyChartState } from "./ChartCard";

const DocumentFileTypeChart = ({ data, isLoading }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const visibleData = data.filter((item) => item.value > 0);

  return (
    <ChartCard title="Tỷ lệ định dạng tệp" className="min-h-[340px] md:min-h-[360px]">
      {isLoading ? (
        <ChartSkeleton type="circle" />
      ) : total === 0 ? (
        <EmptyChartState />
      ) : (
        <div className="grid h-full min-h-[280px] grid-cols-1 items-center gap-4 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="h-[230px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={104}
                  paddingAngle={2}
                  stroke="none"
                >
                  {visibleData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip formatter={(value, item) => `${item?.payload?.name}: ${value} tài liệu`} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                </div>
                <div className="text-right font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  <span className="text-base font-black text-blue-700 dark:text-blue-400">{item.percent}%</span> ({item.value})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
};

export default DocumentFileTypeChart;
