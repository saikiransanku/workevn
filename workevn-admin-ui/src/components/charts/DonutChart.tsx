interface DonutChartSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartSegment[];
  title: string;
}

export default function DonutChart({ data, title }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let offset = 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 42 42" className="h-36 w-36 shrink-0">
          {data.map((segment) => {
            const dashArray = `${(segment.value / total) * 100} 100`;
            const strokeDashoffset = 25 - offset;
            offset += (segment.value / total) * 100;
            return (
              <circle
                key={segment.label}
                r="15.9"
                cx="21"
                cy="21"
                fill="transparent"
                stroke={segment.color}
                strokeWidth="8"
                strokeDasharray={dashArray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
          <circle cx="21" cy="21" r="10" fill="#f8fafc" />
        </svg>
        <div className="space-y-3 text-sm">
          {data.map((segment) => (
            <div key={segment.label} className="flex items-center gap-2">
              <span className="inline-flex h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="font-medium text-slate-900">{segment.label}</span>
              <span className="text-slate-500">{((segment.value / total) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
