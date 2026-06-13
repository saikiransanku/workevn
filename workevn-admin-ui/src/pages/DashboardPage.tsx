import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, Users2, Wallet, Zap } from "lucide-react";
import { getDashboard } from "../api/adminApi";
import { DashboardResponse } from "../types/admin";
import Badge from "../components/ui/Badge";
import LineChart from "../components/charts/LineChart";
import DonutChart from "../components/charts/DonutChart";
import BarChart from "../components/charts/BarChart";

const metricCards = [
  { label: "Bookings today", key: "totalBookingsToday", icon: Zap },
  { label: "Pending requests", key: "pendingRequests", icon: Users2 },
  { label: "Completed bookings", key: "completedBookings", icon: CheckCircle2 },
  { label: "Cancelled bookings", key: "statusDistribution", icon: ArrowUpRight }
] as const;

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getDashboard()
      .then((data) => {
        setDashboard(data);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, []);

  const stats = dashboard?.stats;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Executive view</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Operations dashboard</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
            Export CSV
          </button>
          <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Refresh data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-3xl bg-slate-200" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">Unable to load dashboard: {error}</div>
      ) : stats ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Total revenue</p>
                <Wallet className="h-5 w-5 text-slate-500" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-900">₹{stats.totalRevenue.toLocaleString()}</p>
              <p className="mt-2 text-sm text-slate-500">Partner earnings ₹{stats.partnerEarnings.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Admin commission</p>
                <CheckCircle2 className="h-5 w-5 text-slate-500" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-900">₹{stats.adminCommission.toLocaleString()}</p>
              <p className="mt-2 text-sm text-slate-500">Take rate {stats.platformTakeRate}%</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Active users</p>
                <Users2 className="h-5 w-5 text-slate-500" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.activeUsers.toLocaleString()}</p>
              <p className="mt-2 text-sm text-slate-500">Active partners {stats.activePartners}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Completion rate</p>
                <ArrowUpRight className="h-5 w-5 text-slate-500" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.completionRate}%</p>
              <p className="mt-2 text-sm text-slate-500">Avg rating {stats.averageRating.toFixed(1)}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="grid gap-4 md:grid-cols-2">
              <LineChart title="Bookings over time" data={stats.bookingsOverTime} />
              <LineChart title="Revenue over time" data={stats.revenueOverTime} />
            </div>
            <div className="space-y-4">
              <DonutChart title="Booking status distribution" data={stats.statusDistribution} />
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">City demand snapshot</h3>
                  <Badge tone="info">Live</Badge>
                </div>
                <div className="mt-5 space-y-3">
                  {stats.cityDemand.map((item) => (
                    <div key={item.city} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-900">{item.city}</p>
                        <p className="text-xs text-slate-500">Demand index</p>
                      </div>
                      <span className="text-sm text-slate-700">{item.demand}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Top service categories</h3>
              <div className="mt-4 space-y-3">
                {stats.topCategories.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-700">{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Top-performing workers</h3>
              <div className="mt-4 space-y-3">
                {stats.topWorkers.map((worker) => (
                  <div key={worker.name} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{worker.name}</p>
                      <p className="text-xs text-slate-500">{worker.completed} jobs</p>
                    </div>
                    <Badge tone="success">{worker.rating.toFixed(1)}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Cancellation reasons</h3>
              <div className="mt-4 space-y-3">
                {stats.cancellationReasons.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-700">{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
