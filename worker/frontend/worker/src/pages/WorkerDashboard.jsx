import { AppShell } from '../../../shared/components/AppShell.jsx'
import { EmptyState } from '../../../shared/components/EmptyState.jsx'
import { MetricCard } from '../../../shared/components/MetricCard.jsx'
import { SkeletonGrid } from '../../../shared/components/Skeleton.jsx'
import { useApiResource } from '../../../shared/hooks/useApiResource.js'
import { formatCurrency } from '../../../shared/utils/formatters.js'
import { JobBoard } from '../components/jobs/JobBoard.jsx'
import { WorkerProfileCard } from '../components/profile/WorkerProfileCard.jsx'
import { VerificationCard } from '../components/verification/VerificationCard.jsx'
import { workerApi } from '../services/workerApi.js'

export function WorkerDashboard() {
  const { data, loading, error, reload } = useApiResource(workerApi.bootstrap, [])

  async function refreshAfter(action) {
    await action()
    await reload()
  }

  if (loading) {
    return (
      <AppShell eyebrow="Worker app" title="Workven Partner" subtitle="Loading worker dashboard.">
        <SkeletonGrid count={6} />
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell eyebrow="Worker app" title="Workven Partner" subtitle="The frontend is ready, but the API is not reachable.">
        <EmptyState title="Start the Workven API" body={error} />
      </AppShell>
    )
  }

  return (
    <AppShell eyebrow="Worker app" title="Workven Partner" subtitle="Accept jobs, navigate, upload proof and track earnings from one clean dashboard.">
      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Today earnings" value={formatCurrency(data.earnings.today)} detail="After estimated commission" />
        <MetricCard label="Week earnings" value={formatCurrency(data.earnings.week)} detail="Completed and accepted jobs" />
        <MetricCard label="Month earnings" value={formatCurrency(data.earnings.month)} detail={`${data.earnings.commissionPercent}% platform commission`} />
        <MetricCard label="Open requests" value={data.jobs.filter((job) => job.status !== 'Completed').length} detail="New, accepted and on-the-way" />
      </section>
      <WorkerProfileCard profile={data.profile} onAvailability={(availability) => refreshAfter(() => workerApi.setAvailability(availability))} />
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <VerificationCard verificationLayers={data.verificationLayers} />
        <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Earnings</p>
          <h2 className="font-display text-xl font-extrabold">Payout summary</h2>
          <p className="mt-2 text-sm leading-6 text-[#66736d]">
            Earnings are calculated from completed jobs, platform commission, refund deductions and proof approval.
          </p>
          <div className="mt-4 rounded-lg premium-gradient p-5 text-white">
            <span className="text-sm font-bold opacity-90">Available payout</span>
            <strong className="font-display mt-2 block text-4xl">{formatCurrency(data.earnings.week)}</strong>
          </div>
        </section>
      </section>
      <JobBoard
        jobs={data.jobs}
        onStatus={(jobId, status) => refreshAfter(() => workerApi.updateJobStatus(jobId, status))}
        onProof={(jobId) => refreshAfter(() => workerApi.addProof(jobId, { label: 'Before/after proof uploaded', url: 'api-upload-placeholder' }))}
      />
    </AppShell>
  )
}
