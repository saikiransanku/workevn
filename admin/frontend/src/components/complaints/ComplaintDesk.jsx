import { formatCurrency } from '../../../../shared/utils/formatters.js'
import { StatusBadge } from '../../../../shared/components/StatusBadge.jsx'

export function ComplaintDesk({ complaints, onResolve }) {
  return (
    <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Support</p>
      <h2 className="font-display text-xl font-extrabold">Complaint and refund handling</h2>
      <div className="mt-4 grid gap-3">
        {complaints.map((complaint) => (
          <article key={complaint.id} className="rounded-lg border border-[#dfe6e2] bg-[#f8faf9] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-lg font-extrabold">{complaint.reason}</h3>
                <p className="text-sm text-[#66736d]">Booking {complaint.bookingId}</p>
              </div>
              <StatusBadge tone={complaint.status === 'Resolved' ? 'success' : 'warning'}>{complaint.status}</StatusBadge>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold text-[#44524c]">
              <span>Refund: {formatCurrency(complaint.requestedRefund)}</span>
              <span>{complaint.refundStatus}</span>
            </div>
            <button
              type="button"
              onClick={() => onResolve(complaint.id)}
              className="mt-3 rounded-lg bg-[#17201d] px-3 py-2 text-sm font-extrabold text-white"
            >
              Resolve and close
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
