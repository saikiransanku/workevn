export function LocationSelector({ locations, selectedLocationId, onSelect, onDetectCurrent }) {
  return (
    <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Location</p>
          <h2 className="font-display text-xl font-extrabold">Choose where service is needed</h2>
        </div>
        <button
          type="button"
          onClick={onDetectCurrent}
          className="rounded-lg border border-[#cbd7d1] px-4 py-2 text-sm font-extrabold text-[#17201d]"
        >
          Detect current location
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {locations.map((location) => (
          <button
            type="button"
            key={location.id}
            onClick={() => onSelect(location.id)}
            className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 ${
              selectedLocationId === location.id
                ? 'border-[#0f766e] bg-[#0f766e]/10'
                : 'border-[#dfe6e2] bg-[#f8faf9]'
            }`}
          >
            <strong className="font-display text-lg">{location.label}</strong>
            <span className="mt-1 block text-sm leading-6 text-[#66736d]">{location.address}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-dashed border-[#cbd7d1] bg-[#f8faf9] p-3 text-sm font-semibold text-[#66736d]">
        Manual search and map pin selection are API-ready: save an address with lat/lng from Google Maps or Mapbox.
      </div>
    </section>
  )
}
