export function MetricCard({ label, value, detail }) {
  return (
    <article className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
      <p className="text-sm font-bold text-[#66736d]">{label}</p>
      <strong className="font-display mt-2 block text-3xl font-extrabold text-[#17201d]">{value}</strong>
      {detail ? <span className="mt-1 block text-xs font-semibold text-[#66736d]">{detail}</span> : null}
    </article>
  )
}
