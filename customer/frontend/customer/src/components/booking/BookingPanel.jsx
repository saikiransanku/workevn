import { bookingSlots } from '../../../../shared/constants/booking.js'
import { formatCurrency } from '../../../../shared/utils/formatters.js'

export function BookingPanel({
  service,
  selectedWorker,
  issue,
  onIssue,
  slot,
  onSlot,
  emergency,
  onEmergency,
  estimate,
  creating,
  onConfirm,
}) {
  return (
    <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Booking flow</p>
      <h2 className="font-display text-xl font-extrabold">Choose issue, time and estimate</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-3">
          <label className="grid gap-2 text-sm font-bold text-[#44524c]">
            Issue
            <select
              value={issue}
              onChange={(event) => onIssue(event.target.value)}
              className="min-h-11 rounded-lg border border-[#cbd7d1] bg-white px-3"
            >
              {(service?.issues || []).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            {bookingSlots.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSlot(item)}
                className={`rounded-lg border p-3 text-left text-sm font-extrabold ${
                  slot === item ? 'border-[#0f766e] bg-[#0f766e]/10' : 'border-[#dfe6e2] bg-[#f8faf9]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-extrabold text-red-700">
            <input type="checkbox" checked={emergency} onChange={(event) => onEmergency(event.target.checked)} />
            Emergency booking
          </label>
        </div>
        <div className="rounded-lg border border-[#dfe6e2] bg-[#f8faf9] p-4">
          <h3 className="font-display text-lg font-extrabold">Price breakdown</h3>
          {estimate ? (
            <div className="mt-3 grid gap-2">
              {estimate.lineItems.map((item) => (
                <div key={item.label} className="flex justify-between gap-3 text-sm text-[#44524c]">
                  <span>{item.label}</span>
                  <strong>{formatCurrency(item.amount)}</strong>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-[#dfe6e2] pt-3 font-display text-xl font-extrabold">
                <span>Total</span>
                <strong>{formatCurrency(estimate.total)}</strong>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#66736d]">Select a verified worker to generate estimate.</p>
          )}
          <button
            type="button"
            disabled={!selectedWorker || !estimate || creating}
            onClick={onConfirm}
            className="mt-4 min-h-11 w-full rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? 'Confirming...' : 'Confirm booking'}
          </button>
        </div>
      </div>
    </section>
  )
}
