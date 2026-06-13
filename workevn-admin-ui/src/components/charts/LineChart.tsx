interface LineChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartPoint[];
  title: string;
}

export default function LineChart({ data, title }: LineChartProps) {
  const values = data.map((item) => item.value);
  const maxValue = Math.max(...values, 1);
  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="h-52 w-full">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <polyline
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2"
            points={points}
          />
          <polygon
            points={`${points} 100,100 0,100`}
            fill="rgba(14,165,233,0.12)"
          />
        </svg>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-500">
        {data.map((item) => (
          <div key={item.label} className="truncate">
            <span className="block font-semibold text-slate-900">{item.value}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
