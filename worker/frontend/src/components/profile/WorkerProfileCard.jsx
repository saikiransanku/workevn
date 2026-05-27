import { StatusBadge } from '../../../../shared/components/StatusBadge.jsx'

export function WorkerProfileCard({ profile, onAvailability }) {
  return (
    <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <img src={profile.photoUrl} alt={profile.name} className="h-24 w-24 rounded-full object-cover ring-4 ring-[#f3f6f4]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Worker profile</p>
              <h2 className="font-display text-2xl font-extrabold">{profile.name}</h2>
              <p className="text-sm font-semibold text-[#66736d]">{profile.primarySkill}</p>
            </div>
            <StatusBadge tone={profile.status === 'approved' ? 'success' : 'warning'}>{profile.status}</StatusBadge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-[#f8faf9] p-3">
              <strong className="font-display text-2xl">{profile.rating}</strong>
              <span className="block text-sm text-[#66736d]">Rating</span>
            </div>
            <div className="rounded-lg bg-[#f8faf9] p-3">
              <strong className="font-display text-2xl">{profile.completedJobs}</strong>
              <span className="block text-sm text-[#66736d]">Completed jobs</span>
            </div>
            <div className="rounded-lg bg-[#f8faf9] p-3">
              <strong className="font-display text-2xl">{profile.responseTimeMins}m</strong>
              <span className="block text-sm text-[#66736d]">Response time</span>
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm leading-6 text-[#66736d]">
            <p><strong className="text-[#17201d]">Education:</strong> {profile.education}</p>
            <p><strong className="text-[#17201d]">Experience:</strong> {profile.experience}</p>
            <p><strong className="text-[#17201d]">Previous work:</strong> {profile.previousWork}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Available now', 'Available today', 'Unavailable'].map((availability) => (
              <button
                type="button"
                key={availability}
                onClick={() => onAvailability(availability)}
                className={`rounded-lg border px-3 py-2 text-sm font-extrabold ${
                  profile.availability === availability
                    ? 'border-[#0f766e] bg-[#0f766e]/10 text-[#115e59]'
                    : 'border-[#cbd7d1] bg-white text-[#17201d]'
                }`}
              >
                {availability}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
