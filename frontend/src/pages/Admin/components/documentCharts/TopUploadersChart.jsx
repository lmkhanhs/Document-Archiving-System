import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

const TopUploadersChart = ({ data, isLoading }) => {
  const isDark = useDarkMode();
  const tickColor = isDark ? "#94a3b8" : "#64748b";
  const hasData = data.length > 0;

  return (
    <ChartCard title="Top người dùng tải tài liệu nhiều nhất" className="min-h-[380px]">
      {isLoading ? (
        <ChartSkeleton />
      ) : !hasData ? (
        <EmptyChartState />
      ) : (
        <div className="grid h-full min-h-[300px] min-w-0 gap-4">
          <div className="h-[210px] min-w-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 8, right: 18, left: 8, bottom: 4 }}>
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: tickColor, fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={130} tickLine={false} axisLine={false} tick={{ fill: tickColor, fontSize: 12, fontWeight: 700 }} />
                <Tooltip content={<ChartTooltip formatter={(value, item) => `${item?.payload?.name}: ${value} tài liệu`} />} />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 10, 10, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid min-w-0 gap-2 sm:grid-cols-2">
            {data.map((user) => (
              <div key={user.name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-8 w-8 shrink-0 rounded-full border border-slate-200 object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:text-blue-400">
                      {user.label}
                    </div>
                  )}
                  <span className="break-all text-sm font-bold text-slate-700 dark:text-slate-200">{user.name}</span>
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-sm font-black text-blue-700 dark:text-blue-400">{user.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
};

export default TopUploadersChart;
