import { StatusBadge } from '../../../../shared/components/StatusBadge.jsx'

export function VerificationQueue({ workers, onDecision }) {
  return (
    <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Verification</p>
      <h2 className="font-display text-xl font-extrabold">Worker verification management</h2>
      <div className="mt-4 grid gap-3">
        {workers.map((worker) => (
          <article key={worker.id} className="rounded-lg border border-[#dfe6e2] bg-[#f8faf9] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-3">
                <img src={worker.photoUrl} alt={worker.name} className="h-14 w-14 rounded-full object-cover" />
                <div>
                  <h3 className="font-display text-lg font-extrabold">{worker.name}</h3>
                  <p className="text-sm text-[#66736d]">{worker.primarySkill} · {worker.completedJobs} jobs · {worker.rating} rating</p>
                </div>
              </div>
              <StatusBadge tone={worker.status === 'approved' ? 'success' : 'warning'}>{worker.status}</StatusBadge>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {Object.entries(worker.verification).map(([key, layer]) => (
                <div key={key} className="rounded-lg bg-white p-3">
                  <span className="block text-xs font-extrabold uppercase text-[#66736d]">{key}</span>
                  <strong className="font-display text-2xl">{layer.score}</strong>
                  <StatusBadge tone={layer.status === 'verified' ? 'success' : 'warning'}>{layer.status}</StatusBadge>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-[#66736d]">{worker.previousWork}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="rounded-lg bg-[#0f766e] px-3 py-2 text-sm font-extrabold text-white" onClick={() => onDecision(worker.id, 'approve')}>Approve</button>
              <button type="button" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-extrabold text-red-700" onClick={() => onDecision(worker.id, 'reject')}>Reject</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
