import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, FileSearch, ShieldCheck, Sparkles } from "lucide-react";
import { getVerifications, resolveDispute } from "../api/adminApi";
import { VerificationCase } from "../types/admin";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";

export default function VerificationPage() {
  const [cases, setCases] = useState<VerificationCase[]>([]);
  const [activeCase, setActiveCase] = useState<VerificationCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getVerifications()
      .then((data) => {
        setCases(data);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, []);

  const actionOnCase = async (record: VerificationCase, approved: boolean) => {
    await resolveDispute(record.id, { resolvedBy: "Ops Admin", resolution: approved ? "Approved" : "Rejected" });
    setCases((current) => current.map((item) => (item.id === record.id ? { ...item, status: approved ? "resolved" : "closed" } : item)));
    setActiveCase((current) => (current?.id === record.id ? { ...record, status: approved ? "resolved" : "closed" } : current));
  };

  const openCases = cases.filter((item) => item.status === "open" || item.status === "in_review");

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Verification center</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Review disputes and approvals</h2>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Pending cases</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{openCases.length}</p>
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
      ) : cases.length === 0 ? (
        <EmptyState title="No verification tasks" description="All trust workflows are up to date." />
      ) : (
        <div className="grid gap-4">
          {cases.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{item.subject}</h3>
                    <Badge tone={item.status === "open" ? "warning" : item.status === "in_review" ? "info" : "success"}>{item.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{item.details}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Priority</p>
                    <p className="mt-2 font-semibold text-slate-900">{item.priority}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Owner</p>
                    <p className="mt-2 font-semibold text-slate-900">{item.owner}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" onClick={() => setActiveCase(item)}>
                      <ArrowRight className="mr-2 h-4 w-4" /> Review
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(activeCase)}
        title="Verification task"
        onClose={() => setActiveCase(null)}
        footer={
          activeCase ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void actionOnCase(activeCase, true)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark resolved
              </Button>
              <Button variant="secondary" onClick={() => void actionOnCase(activeCase, false)}>
                <ShieldCheck className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button variant="ghost" onClick={() => setActiveCase(null)}>Close</Button>
            </div>
          ) : null
        }
      >
        {activeCase ? (
          <div className="space-y-5 text-sm text-slate-700">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Case type</p>
              <p className="mt-2 font-semibold text-slate-900">{activeCase.type}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Summary</p>
              <p className="mt-3 leading-7 text-slate-700">{activeCase.details}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Created</p>
                <p className="mt-2 font-semibold text-slate-900">{activeCase.createdAt}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Subject</p>
                <p className="mt-2 font-semibold text-slate-900">{activeCase.subject}</p>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Related user</p>
              <p className="mt-2 text-slate-900">{activeCase.customerName ?? activeCase.partnerName ?? "Not assigned"}</p>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
