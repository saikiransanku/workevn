import { formatCurrency } from '../../../../shared/utils/formatters.js'
import { StatusBadge } from '../../../../shared/components/StatusBadge.jsx'

export function BookingTable({ bookings }) {
  return (
    <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Bookings</p>
      <h2 className="font-display text-xl font-extrabold">Booking operations</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-[#66736d]">
            <tr>
              <th className="px-3 py-2">Invoice</th>
              <th className="px-3 py-2">Service</th>
              <th className="px-3 py-2">Slot</th>
              <th className="px-3 py-2">Payment</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="bg-[#f8faf9]">
                <td className="rounded-l-lg px-3 py-3 font-bold">{booking.invoiceNumber}</td>
                <td className="px-3 py-3">{booking.serviceName}</td>
                <td className="px-3 py-3">{booking.slot}</td>
                <td className="px-3 py-3">{formatCurrency(booking.finalTotal || booking.estimateTotal)} · {booking.paymentStatus}</td>
                <td className="rounded-r-lg px-3 py-3"><StatusBadge tone={booking.status === 'Completed' ? 'success' : 'info'}>{booking.status}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
