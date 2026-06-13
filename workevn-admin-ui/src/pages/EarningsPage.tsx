import { useEffect, useState } from "react";
import { Download, DollarSign, FileText, PieChart, TrendingUp } from "lucide-react";
import { getEarnings } from "../api/adminApi";
import { EarningsPayload } from "../types/admin";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import LineChart from "../components/charts/LineChart";
import BarChart from "../components/charts/BarChart";
import EmptyState from "../components/ui/EmptyState";

function buildLineData(payload: EarningsPayload) {
  return payload.records.map((record) => ({ label: record.date, value: record.finalCharge }));
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<EarningsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getEarnings()
      .then((data) => {
        setEarnings(data);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, []);

  const downloadCsv = () => {
    if (!earnings) return;
    const rows = [
      ["Booking ID", "Service Price", "Tax", "Discount", "Final Charge", "Partner Share", "Platform Share", "Status", "Partner", "Category", "City", "Date"],
      ...earnings.records.map((record) => [
        record.bookingId,
        record.servicePrice,
        record.tax,
        record.discount,
        record.finalCharge,
        record.partnerShare,
        record.platformShare,
        record.settlementStatus,
        record.partnerName,
        record.category,
        record.city,
        record.date
      ])
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "earnings-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Revenue operations</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Income and payouts</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={downloadCsv}>
            <Download className="mr-2 h-4 w-4" /> Export report
          </Button>
          <Button>Run settlement</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-3xl bg-slate-200" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : earnings ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Total customer payment", value: earnings.summary.totalCustomerPayment, icon: DollarSign },
              { label: "Partner earnings", value: earnings.summary.partnerEarnings, icon: Wallet },
              { label: "Admin commission", value: earnings.summary.adminCommission, icon: TrendingUp }
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-slate-600" />
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                </div>
                <p className="mt-4 text-3xl font-semibold text-slate-900">₹{item.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <LineChart title="Daily settlement" data={buildLineData(earnings)} />
            <div className="space-y-4">
              <BarChart title="Earnings by partner" data={earnings.breakdownByPartner} />
              <BarChart title="Revenue by category" data={earnings.breakdownByCategory} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Recent settlements</h3>
                <p className="mt-1 text-sm text-slate-500">Review the latest earnings records and settlement status.</p>
              </div>
              <Badge tone="info">{earnings.records.length} records</Badge>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Booking</th>
                    <th className="px-6 py-4">Partner</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Final charge</th>
                    <th className="px-6 py-4">Platform share</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {earnings.records.map((record) => (
                    <tr key={record.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">{record.bookingId}</td>
                      <td className="px-6 py-4">{record.partnerName}</td>
                      <td className="px-6 py-4">{record.category}</td>
                      <td className="px-6 py-4">₹{record.finalCharge.toLocaleString()}</td>
                      <td className="px-6 py-4">₹{record.platformShare.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge tone={record.settlementStatus === "settled" ? "success" : "warning"}>{record.settlementStatus}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <EmptyState title="No earnings data" description="Unable to load revenue summary." />
      )}
    </section>
  );
}
