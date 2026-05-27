import { StatusBadge } from '../../../../shared/components/StatusBadge.jsx'

export function VerificationCard({ verificationLayers }) {
  const layers = [
    ['Education verification', verificationLayers.education],
    ['Work experience verification', verificationLayers.experience],
    ['Previous work verification', verificationLayers.previousWork],
  ]

  return (
    <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Trust score</p>
      <h2 className="font-display text-xl font-extrabold">Skill verification status</h2>
      <div className="mt-4 grid gap-3">
        {layers.map(([label, layer]) => (
          <div key={label} className="rounded-lg border border-[#dfe6e2] bg-[#f8faf9] p-3">
            <div className="flex items-center justify-between gap-3">
              <strong>{label}</strong>
              <StatusBadge tone={layer?.status === 'verified' ? 'success' : 'warning'}>{layer?.status || 'pending'}</StatusBadge>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dfe6e2]">
              <div className="h-full rounded-full bg-[#0f766e]" style={{ width: `${layer?.score || 0}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
