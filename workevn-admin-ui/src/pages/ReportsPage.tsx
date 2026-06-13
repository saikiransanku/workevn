import { Activity, BarChart3, PieChart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getReports } from "../api/adminApi";
import { ReportOverview } from "../types/admin";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getReports()
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, []);

  const summaryItems = useMemo(
    () => [
      { label: "Bookings", value: reports?.bookingsCount ?? 0, icon: Activity },
      { label: "Revenue", value: `$${reports?.revenue.toLocaleString() ?? "0"}`, icon: BarChart3 },
      { label: "New requests", value: reports?.newRequests ?? 0, icon: PieChart }
    ],
    [reports]
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Performance reports</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Operations intelligence</h2>
        </div>
        <Button variant="secondary">
          <Activity className="mr-2 h-4 w-4" /> Refresh data
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Overview</p>
              <p className="mt-2 text-sm text-slate-500">Review the latest operational metrics and growth signals.</p>
            </div>
            <Button variant="secondary">Download PDF</Button>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-3xl bg-slate-200" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
          ) : !reports ? (
            <EmptyState title="Report unavailable" description="No report data found." />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {summaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-3 text-slate-600">
                        <Icon className="h-5 w-5" />
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      </div>
                      <p className="mt-4 text-3xl font-semibold text-slate-900">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Top growth regions</p>
                  <div className="mt-4 space-y-3">
                    {reports.topRegions.map((region) => (
                      <div key={region.name} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <p className="font-medium text-slate-900">{region.name}</p>
                        <span className="text-sm text-slate-500">{region.growth}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Top requests</p>
                  <div className="mt-4 space-y-3">
                    {reports.topRequests.map((request) => (
                      <div key={request.title} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-slate-900">{request.title}</p>
                          <span className="text-sm text-slate-500">{request.count}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{request.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <PieChart className="h-5 w-5" />
            <p className="font-semibold">Performance summary</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Conversion rate</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{reports?.conversionRate ?? 0}%</p>
            <p className="mt-2 text-sm text-slate-500">Platform conversion across all operational flows.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Response health</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{reports?.averageResponseTime ?? 0} min</p>
            <p className="mt-2 text-sm text-slate-500">Average partner response time for service requests.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
