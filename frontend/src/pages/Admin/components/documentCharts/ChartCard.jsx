const ChartCard = ({ title, children, action, className = "" }) => (
  <div className={`flex h-full flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md ${className}`}>
    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
      <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">{title}</h3>
      {action}
    </div>
    <div className="min-h-0 flex-1">{children}</div>
  </div>
);

export const ChartSkeleton = ({ type = "bars" }) => (
  <div className="flex h-full min-h-[200px] animate-pulse items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4">
    {type === "circle" ? (
      <div className="h-32 w-32 rounded-full bg-slate-200" />
    ) : (
      <div className="flex h-36 w-full items-end justify-center gap-3">
        {[58, 86, 44, 70, 34].map((height, index) => (
          <div key={index} className="w-8 rounded-t-xl bg-slate-200" style={{ height: `${height}%` }} />
        ))}
      </div>
    )}
  </div>
);

export const EmptyChartState = ({ message = "Không có dữ liệu" }) => (
  <div className="grid h-full min-h-[200px] place-items-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">
    {message}
  </div>
);

export const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const value = formatter ? formatter(item.value, item, payload) : item.value;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-lg">
      {label && <div>{label}</div>}
      <div className="mt-1 text-blue-700 dark:text-blue-400">{value}</div>
    </div>
  );
};

export default ChartCard;
