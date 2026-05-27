export function ServiceGrid({ services, selectedServiceId, query, onQuery, onSelect }) {
  const filteredServices = services.filter((service) =>
    `${service.name} ${service.category} ${service.description}`.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Services</p>
          <h2 className="font-display text-xl font-extrabold">Book trusted home service</h2>
        </div>
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search AC, fan, appliance, plumber..."
          className="min-h-11 rounded-lg border border-[#cbd7d1] bg-[#f8faf9] px-4 text-sm outline-none ring-[#0f766e]/20 focus:ring-4 lg:w-96"
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filteredServices.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service.id)}
            className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 ${
              selectedServiceId === service.id
                ? 'border-[#0f766e] bg-[#0f766e]/10'
                : 'border-[#dfe6e2] bg-white'
            }`}
          >
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#17201d] font-display text-sm font-extrabold text-white">
              {service.icon}
            </span>
            <h3 className="font-display mt-3 text-lg font-extrabold">{service.name}</h3>
            <p className="mt-1 text-sm leading-6 text-[#66736d]">{service.description}</p>
            <span className="mt-3 block text-sm font-extrabold text-[#0f766e]">{service.eta}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
