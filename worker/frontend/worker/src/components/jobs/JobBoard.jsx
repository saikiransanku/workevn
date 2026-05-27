import { formatCurrency } from '../../../../shared/utils/formatters.js'
import { StatusBadge } from '../../../../shared/components/StatusBadge.jsx'

export function JobBoard({ jobs, onStatus, onProof }) {
  const groups = ['New request', 'Accepted', 'On the way', 'Completed']

  return (
    <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Jobs</p>
      <h2 className="font-display text-xl font-extrabold">Worker job dashboard</h2>
      <div className="mt-4 grid gap-4 xl:grid-cols-4">
        {groups.map((group) => (
          <div key={group} className="grid content-start gap-3 rounded-lg bg-[#f8faf9] p-3">
            <h3 className="font-display font-extrabold">{group}</h3>
            {jobs.filter((job) => job.status === group).map((job) => (
              <article key={job.id} className="rounded-lg border border-[#dfe6e2] bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <strong className="font-display">{job.serviceName}</strong>
                    <p className="text-sm text-[#66736d]">{job.issue}</p>
                  </div>
                  <StatusBadge tone={group === 'New request' ? 'warning' : 'info'}>{job.difficulty}</StatusBadge>
                </div>
                <div className="mt-3 grid gap-1 text-sm text-[#44524c]">
                  <span>{job.customerName}</span>
                  <span>{job.distanceKm} km away</span>
                  <span>{job.slot}</span>
                  <strong>{formatCurrency(job.estimateTotal)}</strong>
                </div>
                <div className="mt-3 grid gap-2">
                  {group === 'New request' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" className="rounded-lg bg-[#0f766e] px-3 py-2 text-sm font-extrabold text-white" onClick={() => onStatus(job.id, 'Accepted')}>Accept</button>
                      <button type="button" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-extrabold text-red-700" onClick={() => onStatus(job.id, 'Rejected')}>Reject</button>
                    </div>
                  ) : null}
                  {group === 'Accepted' ? <button type="button" className="rounded-lg bg-[#17201d] px-3 py-2 text-sm font-extrabold text-white" onClick={() => onStatus(job.id, 'On the way')}>Navigate</button> : null}
                  {group === 'On the way' ? <button type="button" className="rounded-lg bg-[#0f766e] px-3 py-2 text-sm font-extrabold text-white" onClick={() => onStatus(job.id, 'Completed')}>Complete job</button> : null}
                  <button type="button" className="rounded-lg border border-[#cbd7d1] px-3 py-2 text-sm font-extrabold" onClick={() => onProof(job.id)}>Upload proof</button>
                </div>
              </article>
            ))}
            {!jobs.some((job) => job.status === group) ? <p className="text-sm text-[#66736d]">No jobs in this lane.</p> : null}
          </div>
        ))}
      </div>
    </section>
  )
}
