import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard, { ChartSkeleton, ChartTooltip } from "./ChartCard";
import { formatBytes } from "./chartUtils";

const StorageUsageChart = ({ data, isLoading }) => (
  <ChartCard title="Tổng dung lượng tệp lưu trữ" className="min-h-[340px] md:min-h-[360px]">
    {isLoading ? (
      <ChartSkeleton type="circle" />
    ) : (
      <div className="flex h-full min-h-[280px] flex-col items-center justify-center">
        <div className="text-center text-4xl font-black text-slate-900">{formatBytes(data.usedBytes)}</div>
        <div className="relative mt-3 h-[205px] w-full max-w-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="72%"
                startAngle={180}
                endAngle={0}
                innerRadius={82}
                outerRadius={118}
                paddingAngle={0}
                stroke="none"
              >
                {data.chartData.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip formatter={(value, item) => `${item?.payload?.name}: ${value}%`} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
              <InsertDriveFileOutlinedIcon fontSize="small" />
            </div>
          </div>
        </div>
        <div className="mt-1 flex w-full max-w-[320px] items-center justify-between text-xs font-semibold text-slate-500">
          <span>0</span>
          <span>{formatBytes(data.limitBytes)}</span>
        </div>
        <div className="mt-1 text-sm font-bold text-slate-600">
          {data.percent}% / {formatBytes(data.limitBytes)}
        </div>
      </div>
    )}
  </ChartCard>
);

export default StorageUsageChart;
