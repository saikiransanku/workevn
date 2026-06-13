import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, TrendingUp, UserPlus } from "lucide-react";
import { getPartners, patchPartner } from "../api/adminApi";
import { UserAccount } from "../types/admin";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";

export default function PartnersPage() {
  const [partners, setPartners] = useState<UserAccount[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getPartners()
      .then((data) => {
        setPartners(data);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(
    () =>
      partners.filter((partner) =>
        [partner.name, partner.email, partner.city, partner.serviceArea].join(" ").toLowerCase().includes(search.toLowerCase())
      ),
    [partners, search]
  );

  const toggleActive = async (partner: UserAccount) => {
    const updated = await patchPartner(partner.id, {
      accountStatus: partner.accountStatus === "active" ? "suspended" : "active"
    });
    setPartners((current) => current.map((item) => (item.id === partner.id ? updated : item)));
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Partner network</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Manage service partners</h2>
        </div>
        <Button variant="secondary">
          <UserPlus className="mr-2 h-4 w-4" /> Add partner
        </Button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Partner network overview</p>
            <p className="mt-2 text-sm text-slate-500">View partner performance, availability, and compliance at a glance.</p>
          </div>
          <div className="max-w-md w-full">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search partners by name, city, skill..."
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
        <EmptyState title="No partners found" description="Try broadening your search or checking partner filters." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm leading-6 text-slate-700">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Service area</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((partner) => (
                  <tr key={partner.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{partner.name}</p>
                      <p className="text-xs text-slate-500">{partner.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{partner.serviceArea || partner.city}</p>
                      <p className="text-xs text-slate-500">{partner.skills?.join(", ") || "No skills listed"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={partner.accountStatus === "active" ? "success" : partner.accountStatus === "pending" ? "warning" : "danger"}>
                        {partner.accountStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-slate-500" />
                        <span>{partner.rating?.toFixed(1) ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant={partner.accountStatus === "active" ? "danger" : "primary"} onClick={() => void toggleActive(partner)}>
                        {partner.accountStatus === "active" ? "Suspend" : "Activate"}
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
