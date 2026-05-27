export function EmptyState({ title, body, action }) {
  return (
    <div className="rounded-lg border border-dashed border-[#cbd7d1] bg-white p-6 text-center">
      <h3 className="font-display text-xl font-bold text-[#17201d]">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#66736d]">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
