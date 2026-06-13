import { useEffect, useMemo, useState } from "react";
import { Check, ShieldCheck, UserCheck2, Wallet, XCircle } from "lucide-react";
import { getUsers, patchUser } from "../api/adminApi";
import { UserAccount, UserRole } from "../types/admin";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";

const tabs: { label: string; role: UserRole }[] = [
  { label: "Customers", role: "customer" },
  { label: "Service Partners", role: "partner" },
  { label: "Admins / Staff", role: "admin" }
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentTab, setCurrentTab] = useState<UserRole>("customer");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getUsers(currentTab)
      .then((result) => {
        setUsers(result);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, [currentTab]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      return [user.name, user.email, user.phone, user.city].join(" ").toLowerCase().includes(search.toLowerCase());
    });
  }, [users, search]);

  const toggleActive = async (user: UserAccount) => {
    const updated = await patchUser(user.id, {
      accountStatus: user.accountStatus === "active" ? "suspended" : "active"
    });
    setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">User management</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Manage customers, partners, and staff</h2>
        </div>
        <Button variant="secondary">Export users</Button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.role}
                onClick={() => setCurrentTab(tab.role)}
                className={`rounded-full px-4 py-2 text-sm transition ${currentTab === tab.role ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="max-w-md flex-1">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, city..."
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
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="No accounts found" description="Try a different search term or switch tabs." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm leading-6 text-slate-700">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Key data</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.role}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p>{user.email}</p>
                      <p className="text-xs text-slate-500">{user.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">{currentTab === "partner" ? `${user.completedJobs ?? 0} jobs` : `${user.totalBookings} bookings`}</p>
                      <p className="text-xs text-slate-500">
                        {currentTab === "partner" ? `Rating ${user.rating?.toFixed(1) ?? "—"}` : `Spent ₹${user.totalSpend.toLocaleString()}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={user.accountStatus === "active" ? "success" : user.accountStatus === "pending" ? "warning" : "danger"}>{user.accountStatus}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {currentTab === "partner" ? <Button variant="secondary"><ShieldCheck className="mr-2 h-4 w-4" /> Verify</Button> : null}
                        <Button variant={user.accountStatus === "active" ? "danger" : "primary"} onClick={() => void toggleActive(user)}>
                          {user.accountStatus === "active" ? <XCircle className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />} 
                          {user.accountStatus === "active" ? "Suspend" : "Activate"}
                        </Button>
                      </div>
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
