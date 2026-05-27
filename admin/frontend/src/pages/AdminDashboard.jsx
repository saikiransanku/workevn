import { AppShell } from '../../../shared/components/AppShell.jsx'
import { EmptyState } from '../../../shared/components/EmptyState.jsx'
import { MetricCard } from '../../../shared/components/MetricCard.jsx'
import { SkeletonGrid } from '../../../shared/components/Skeleton.jsx'
import { StatusBadge } from '../../../shared/components/StatusBadge.jsx'
import { useApiResource } from '../../../shared/hooks/useApiResource.js'
import { formatCurrency } from '../../../shared/utils/formatters.js'
import { BookingTable } from '../components/bookings/BookingTable.jsx'
import { ComplaintDesk } from '../components/complaints/ComplaintDesk.jsx'
import { CommissionSettings } from '../components/settings/CommissionSettings.jsx'
import { VerificationQueue } from '../components/workers/VerificationQueue.jsx'
import { adminApi } from '../services/adminApi.js'

export function AdminDashboard() {
  const { data, loading, error, reload } = useApiResource(adminApi.dashboard, [])

  async function refreshAfter(action) {
    await action()
    await reload()
  }

  if (loading) {
    return (
      <AppShell eyebrow="Admin app" title="Workven Admin" subtitle="Loading operations control plane.">
        <SkeletonGrid count={8} />
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell eyebrow="Admin app" title="Workven Admin" subtitle="The frontend is ready, but the API is not reachable.">
        <EmptyState title="Start the Workven API" body={error} />
      </AppShell>
    )
  }

  return (
    <AppShell
      eyebrow="Admin app"
      title="Workven Admin"
      subtitle="Manage bookings, verification, refunds, commission, fraud signals and support from one role-protected panel."
      actions={<StatusBadge tone="success">RBAC protected</StatusBadge>}
    >
      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Total bookings" value={data.summary.totalBookings} detail="All service categories" />
        <MetricCard label="Revenue" value={formatCurrency(data.summary.revenue)} detail="Completed bookings" />
        <MetricCard label="Cancellations" value={data.summary.cancellations} detail="Fraud monitor input" />
        <MetricCard label="Active workers" value={data.summary.activeWorkers} detail={`${data.summary.pendingVerification} pending review`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <VerificationQueue workers={data.workers} onDecision={(workerId, decision) => refreshAfter(() => adminApi.decideWorker(workerId, decision, 'Reviewed by admin'))} />
        <div className="grid content-start gap-4">
          <ComplaintDesk
            complaints={data.complaints}
            onResolve={(complaintId) => refreshAfter(() => adminApi.updateComplaint(complaintId, { status: 'Resolved', refundStatus: 'Closed', resolutionNote: 'Resolved by support.' }))}
          />
          <CommissionSettings settings={data.settings} onSave={(payload) => refreshAfter(() => adminApi.updateSettings(payload))} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <BookingTable bookings={data.bookings} />
        <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Risk</p>
          <h2 className="font-display text-xl font-extrabold">Fraud detection and support</h2>
          <div className="mt-4 grid gap-3">
            {data.fraudSignals.map((signal) => (
              <div key={signal.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <strong className="block">{signal.label}</strong>
                {signal.reason}
              </div>
            ))}
            {!data.fraudSignals.length ? <p className="text-sm text-[#66736d]">No high-risk signals right now.</p> : null}
          </div>
          <div className="mt-4 grid gap-2">
            {data.supportTickets.map((ticket) => (
              <div key={ticket.id} className="rounded-lg bg-[#f8faf9] p-3 text-sm">
                <strong>{ticket.subject}</strong>
                <span className="block text-[#66736d]">{ticket.status} · {ticket.priority} · {ticket.owner}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  )
}
