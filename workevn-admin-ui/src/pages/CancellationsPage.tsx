import { useEffect, useMemo, useState } from "react";
import { ArrowRight, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { CancellationRecord } from "../types/admin";
import { getCancellations } from "../api/adminApi";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";

export default function CancellationsPage() {
  const [cancellations, setCancellations] = useState<CancellationRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"user" | "partner">("user");
  const [selected, setSelected] = useState<CancellationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getCancellations()
      .then((data) => {
        setCancellations(data);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => cancellations.filter((item) => item.canceledBy === activeTab), [cancellations, activeTab]);

  const handleAction = (record: CancellationRecord, approve: boolean) => {
    setSelected({ ...record, refundStatus: approve ? "approved" : "denied" });
    setCancellations((current) => current.map((item) => (item.id === record.id ? { ...item, refundStatus: approve ? "approved" : "denied" } : item)));
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Refund operations</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Manage cancellation workflows</h2>
        </div>
        <Button variant="secondary">Export cancellations</Button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("user")}
            className={`rounded-full px-4 py-2 text-sm transition ${activeTab === "user" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            User Cancelled
          </button>
          <button
            onClick={() => setActiveTab("partner")}
            className={`rounded-full px-4 py-2 text-sm transition ${activeTab === "partner" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            Partner Cancelled
          </button>
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
        <EmptyState title="No cancellations" description="No cancellations in this workflow yet." />
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.8fr] lg:items-center">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{item.bookingId}</p>
                  <p className="mt-2 text-sm text-slate-500">{activeTab === "user" ? item.customerName : item.partnerName}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.canceledAt}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reason</p>
                  <p className="mt-2 font-semibold text-slate-900">{item.reason}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Refund</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">₹{item.refundAmount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{item.refundStatus}</p>
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <Badge tone={item.refundStatus === "approved" ? "success" : item.refundStatus === "pending" ? "warning" : "danger"}>{item.refundStatus}</Badge>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setSelected(item)} variant="secondary">
                      <ArrowRight className="mr-2 h-4 w-4" /> Review
                    </Button>
                    <Button variant="ghost">Reschedule</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        title="Cancellation review"
        onClose={() => setSelected(null)}
        footer={
          selected ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => selected && handleAction(selected, true)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve refund
              </Button>
              <Button variant="danger" onClick={() => selected && handleAction(selected, false)}>
                <AlertTriangle className="mr-2 h-4 w-4" /> Deny refund
              </Button>
              <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-5 text-sm text-slate-700">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Booking</p>
                <p className="mt-2 font-semibold text-slate-900">{selected.bookingId}</p>
                <p className="text-sm text-slate-500">{selected.canceledAt}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Penalty</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">₹{selected.penalty.toLocaleString()}</p>
                <p className="text-xs text-slate-500">{selected.partnerAssigned ? "Partner assigned" : "No partner assigned"}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin notes</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{selected.notes ?? "No notes available for this case."}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Action needed</p>
                <p className="mt-2 font-semibold text-slate-900">{selected.actionNeeded}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Repeat count</p>
                <p className="mt-2 font-semibold text-slate-900">{selected.repeatCount ?? "—"}</p>
                <p className="mt-1 text-xs text-slate-500">Reliability impact {selected.reliabilityImpact ?? "—"}</p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
