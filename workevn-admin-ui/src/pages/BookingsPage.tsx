import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Phone, ShieldAlert } from "lucide-react";
import { Booking, BookingStatus } from "../types/admin";
import { getBookings, patchBooking } from "../api/adminApi";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";

const statusLabels: Record<BookingStatus, { label: string; tone: "success" | "warning" | "danger" | "info" | "neutral" }> = {
  requested: { label: "New request", tone: "info" },
  pending_assignment: { label: "Pending assignment", tone: "warning" },
  assigned: { label: "Assigned", tone: "info" },
  accepted: { label: "Accepted", tone: "success" },
  en_route: { label: "En route", tone: "info" },
  arrived: { label: "Arrived", tone: "success" },
  in_progress: { label: "In progress", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
  cancelled_by_user: { label: "Cancelled by user", tone: "danger" },
  cancelled_by_partner: { label: "Cancelled by partner", tone: "danger" },
  cancelled_by_admin: { label: "Cancelled by admin", tone: "danger" },
  refunded: { label: "Refunded", tone: "neutral" },
  disputed: { label: "Disputed", tone: "danger" },
  rejected: { label: "Rejected", tone: "danger" },
  rescheduled: { label: "Rescheduled", tone: "warning" }
};

const filters: { label: string; status?: BookingStatus }[] = [
  { label: "All" },
  { label: "Active", status: "assigned" },
  { label: "Completed", status: "completed" },
  { label: "Cancelled", status: "cancelled_by_user" },
  { label: "Disputed", status: "disputed" }
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getBookings()
      .then((result) => {
        setBookings(result);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, []);

  const filteredBookings = useMemo(() => {
    const activeFilter = filters.find((option) => option.label === filter);
    return bookings.filter((booking) => {
      const matchesSearch = [booking.bookingId, booking.customerName, booking.partnerName, booking.serviceCategory, booking.area]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter = !activeFilter?.status || booking.status === activeFilter.status;
      return matchesSearch && matchesFilter;
    });
  }, [bookings, filter, search]);

  const handleStatusUpdate = async (booking: Booking, status: BookingStatus) => {
    const patched = await patchBooking(booking.id, { status });
    setBookings((current) => current.map((item) => (item.id === booking.id ? patched : item)));
    setSelectedBooking(patched);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Booking operations</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Manage all bookings</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary">Export bookings</Button>
          <Button>New assignment</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search booking ID, customer, partner..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((option) => (
                <button
                  key={option.label}
                  onClick={() => setFilter(option.label)}
                  className={`rounded-full px-4 py-2 text-sm transition ${filter === option.label ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Workload summary</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total bookings</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{bookings.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Filtered results</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{filteredBookings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-3xl bg-slate-200" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState title="No bookings found" description="Try changing your filters or search terms to find bookings." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm leading-6 text-slate-700">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Booking</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Partner</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Date / status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{booking.bookingId}</p>
                      <p className="text-xs text-slate-500">{booking.sourceChannel}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{booking.customerName}</p>
                      <p className="text-xs text-slate-500">{booking.customerPhone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{booking.partnerName}</p>
                      <p className="text-xs text-slate-500">{booking.area}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{booking.serviceCategory}</p>
                      <p className="text-xs text-slate-500">{booking.subService}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="mb-2 text-sm font-medium text-slate-900">{booking.scheduledAt}</div>
                      <Badge tone={statusLabels[booking.status].tone}>{statusLabels[booking.status].label}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">₹{booking.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{booking.paymentStatus}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        title="Booking details"
        open={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        footer={
          selectedBooking ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void handleStatusUpdate(selectedBooking, "completed")}>Mark completed</Button>
              <Button variant="secondary" onClick={() => void handleStatusUpdate(selectedBooking, "cancelled_by_admin")}>Cancel booking</Button>
              <Button variant="ghost" onClick={() => setSelectedBooking(null)}>Close</Button>
            </div>
          ) : null
        }
      >
        {selectedBooking ? (
          <div className="space-y-5 text-sm text-slate-700">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500">Customer</h3>
                <p className="mt-2 font-semibold text-slate-900">{selectedBooking.customerName}</p>
                <p>{selectedBooking.customerPhone}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500">Partner</h3>
                <p className="mt-2 font-semibold text-slate-900">{selectedBooking.partnerName}</p>
                <p>{selectedBooking.area}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Service</p>
                <p className="mt-2 font-semibold text-slate-900">{selectedBooking.serviceCategory}</p>
                <p className="text-sm text-slate-600">{selectedBooking.subService}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Amount</p>
                <p className="mt-2 font-semibold text-slate-900">₹{selectedBooking.amount.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Partner ₹{selectedBooking.partnerPayout.toLocaleString()}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge tone={statusLabels[selectedBooking.status].tone}>{statusLabels[selectedBooking.status].label}</Badge>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Notes</p>
                <div className="text-slate-500 text-xs">{selectedBooking.issueFlag ? "Issue flagged" : "No issue"}</div>
              </div>
              <p className="mt-3 text-sm text-slate-700">{selectedBooking.notes || "No internal notes."}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Scheduled</p>
                <p className="mt-2 font-semibold text-slate-900">{selectedBooking.scheduledAt}</p>
                <p className="text-sm text-slate-600">Start {selectedBooking.startTime ?? "—"}</p>
                <p className="text-sm text-slate-600">End {selectedBooking.endTime ?? "—"}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contact</p>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                  <Phone className="h-4 w-4 text-slate-500" />
                  {selectedBooking.customerPhone}
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                  <ShieldAlert className="h-4 w-4 text-slate-500" />
                  {selectedBooking.sourceChannel}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
