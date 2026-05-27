import { getInitials } from '../utils/formatters.js'
import { StatusBadge } from './StatusBadge.jsx'

export function WorkerCard({ worker, favorite, onFavorite, selected, onSelect }) {
  return (
    <article
      className={`rounded-lg border bg-white p-4 soft-shadow transition hover:-translate-y-0.5 ${
        selected ? 'border-[#0f766e] ring-2 ring-[#0f766e]/15' : 'border-[#dfe6e2]'
      }`}
    >
      <div className="flex gap-3">
        {worker.photoUrl ? (
          <img
            src={worker.photoUrl}
            alt={worker.name}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-white"
          />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#17201d] font-display font-bold text-white">
            {getInitials(worker.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-extrabold">{worker.name}</h3>
              <p className="text-sm font-semibold text-[#66736d]">{worker.primarySkill}</p>
            </div>
            <StatusBadge tone={worker.trustScore >= 88 ? 'success' : 'info'}>{worker.trustScore}% trust</StatusBadge>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-[#44524c] sm:grid-cols-2">
            <span>Rating {worker.rating} / 5</span>
            <span>{worker.distanceKm ?? '--'} km away</span>
            <span>{worker.completedJobs} jobs</span>
            <span>{worker.availability}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-sm leading-6 text-[#66736d]">
        <p>
          <strong className="text-[#17201d]">Education:</strong> {worker.education}
        </p>
        <p>
          <strong className="text-[#17201d]">Experience:</strong> {worker.experience}
        </p>
        <p>
          <strong className="text-[#17201d]">Previous work:</strong> {worker.previousWork}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(worker.badges || []).map((badge) => (
          <StatusBadge key={badge}>{badge}</StatusBadge>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSelect?.(worker)}
          className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#115e59]"
        >
          Select worker
        </button>
        <button
          type="button"
          onClick={() => onFavorite?.(worker)}
          className="rounded-lg border border-[#cbd7d1] bg-white px-4 py-2 text-sm font-extrabold text-[#17201d] transition hover:bg-[#f3f6f4]"
        >
          {favorite ? 'Favorited' : 'Save favorite'}
        </button>
      </div>
    </article>
  )
}
