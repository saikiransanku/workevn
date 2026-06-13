import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ClipboardList, ShieldAlert } from "lucide-react";
import { getDisputes, patchDispute } from "../api/adminApi";
import { Dispute } from "../types/admin";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getDisputes()
      .then((data) => {
        setDisputes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(
    () =>
      disputes.filter((item) =>
        [item.issue, item.bookingId, item.customerName, item.partnerName]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [disputes, search]
  );

  const resolveDispute = async (dispute: Dispute) => {
    const updated = await patchDispute(dispute.id, { status: "resolved" });
    setDisputes((current) => current.map((item) => (item.id === dispute.id ? updated : item)));
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Dispute management</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Customer & partner disputes</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button>
            <ClipboardList className="mr-2 h-4 w-4" /> Export report
          </Button>
          <Button variant="secondary">
            <ShieldAlert className="mr-2 h-4 w-4" /> Review policy
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Active disputes overview</p>
            <p className="mt-2 text-sm text-slate-500">Track open disputes, assign urgency, and resolve customer or partner issues quickly.</p>
          </div>
          <div className="w-full max-w-md">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search disputes by booking, customer, partner..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-3xl bg-slate-200" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No disputes yet" description="Everything looks resolved. Check back later for new cases." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm leading-6 text-slate-700">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Issue</th>
                  <th className="px-6 py-4">Booking</th>
                  <th className="px-6 py-4">Reporter</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((dispute) => (
                  <tr key={dispute.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{dispute.issue}</p>
                      <p className="text-xs text-slate-500">{dispute.details}</p>
                    </td>
                    <td className="px-6 py-4">{dispute.bookingId}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{dispute.customerName}</p>
                      <p className="text-xs text-slate-500">Partner: {dispute.partnerName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={dispute.priority === "high" ? "danger" : dispute.priority === "medium" ? "warning" : "muted"}>
                        {dispute.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={dispute.status === "resolved" ? "success" : dispute.status === "open" ? "warning" : "muted"}>
                        {dispute.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="primary" onClick={() => void resolveDispute(dispute)}>
                        Resolve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
