import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bell, CheckCircle2, Clock3, MapPin, UserPlus } from "lucide-react";
import { getRequests, postAssignment } from "../api/adminApi";
import { RequestRecord } from "../types/admin";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";

const urgencyTone: Record<RequestRecord["urgency"], "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger"
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestRecord | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "matched" | "assigned" | "held" | "rejected">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getRequests()
      .then((result) => {
        setRequests(result);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((request) => {
      const matchText = [request.customerName, request.serviceRequested, request.location, request.suggestedPartners.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || request.status === statusFilter;
      return matchText && matchStatus;
    });
  }, [requests, search, statusFilter]);

  const assignRequest = async (request: RequestRecord) => {
    const partnerId = request.suggestedPartners[0] || "partner_1";
    await postAssignment({ bookingId: request.id, partnerId });
    const updated: RequestRecord = { ...request, status: "assigned", suggestedPartners: request.suggestedPartners };
    setRequests((current) => current.map((item) => (item.id === request.id ? updated : item)));
    setSelectedRequest(updated);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">New request queue</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Review incoming service requests</h2>
        </div>
        <Button variant="secondary">Refresh request feed</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-2">
              <p className="text-sm text-slate-500">Search queue</p>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Request ID, customer, location..."
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "matched", "assigned", "held", "rejected"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`rounded-full px-4 py-2 text-sm transition ${statusFilter === value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                  {value === "all" ? "All" : value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Live queue</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Open requests</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{filtered.filter((item) => item.status === "pending").length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Assigned requests</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{filtered.filter((item) => item.status === "assigned").length}</p>
            </div>
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
        <EmptyState title="No new requests" description="No requests match the selected filters." />
      ) : (
        <div className="space-y-4">
          {filtered.map((request) => (
            <div key={request.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr_0.9fr_0.8fr] lg:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{request.customerName}</h3>
                    <Badge tone={urgencyTone[request.urgency]}>Urgent</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{request.serviceRequested}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{request.requestedAt}</span>
                    <span>•</span>
                    <span>{request.preferredSlot}</span>
                    <span>•</span>
                    <span>{request.location}</span>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estimate</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">₹{request.estimatedPrice.toLocaleString()}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Matches</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{request.suggestedPartners.length}</p>
                  <p className="text-xs text-slate-500">Nearest {request.distanceToPartner}</p>
                </div>
                <div className="flex flex-col items-start justify-between gap-3 sm:items-end">
                  <Badge tone={request.status === "assigned" ? "success" : request.status === "pending" ? "warning" : "neutral"}>{request.status}</Badge>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => assignRequest(request)}>
                      <UserPlus className="mr-2 h-4 w-4" /> Assign
                    </Button>
                    <Button variant="ghost" onClick={() => setSelectedRequest(request)}>
                      <ArrowRight className="mr-2 h-4 w-4" /> View
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(selectedRequest)}
        title="Request review"
        onClose={() => setSelectedRequest(null)}
        footer={
          selectedRequest ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void assignRequest(selectedRequest)}>Auto assign</Button>
              <Button variant="secondary" onClick={() => setSelectedRequest(null)}>Close</Button>
            </div>
          ) : null
        }
      >
        {selectedRequest ? (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Customer</p>
                <p className="mt-2 font-semibold text-slate-900">{selectedRequest.customerName}</p>
                <p className="text-sm text-slate-600">{selectedRequest.customerPhone}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Location</p>
                <p className="mt-2 font-semibold text-slate-900">{selectedRequest.location}</p>
                <p className="text-sm text-slate-600">Preferred {selectedRequest.preferredSlot}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reason for assignment</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{selectedRequest.unassignedReason ?? "Matching suggested partners that meet customer SLA and location."}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Suggested partners</p>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  {selectedRequest.suggestedPartners.map((partner) => (
                    <div key={partner} className="rounded-2xl bg-white p-3 shadow-sm">{partner}</div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Request details</p>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-slate-500" /> Requested at {selectedRequest.requestedAt}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-500" /> Location {selectedRequest.location}</div>
                  <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-slate-500" /> Urgency {selectedRequest.urgency}</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
