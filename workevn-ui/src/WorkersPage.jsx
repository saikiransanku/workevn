import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarCheck,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SESSION_KEY = "workevn_customer_session";

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWorkers();
  }, []);

  async function loadWorkers() {
    try {
      setLoading(true);

      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");

      if (!session?.token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(`${API_URL}/api/workers/all`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load workers");
      }

      setWorkers(data.workers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#171717]">
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <a
                href="/"
                className="mb-3 inline-flex items-center gap-2 text-sm font-bold"
              >
                <ArrowLeft size={16} />
                Back
              </a>

              <h1 className="text-4xl font-black">All Available Workers</h1>

              <p className="mt-2 text-zinc-600">Browse all approved workers.</p>
            </div>

            <button
              onClick={loadWorkers}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-3 font-bold text-white"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        {loading && (
          <div className="rounded-lg border border-black/10 bg-white p-8">
            Loading workers...
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {!loading && workers.length === 0 && (
          <div className="rounded-lg border border-dashed border-black/20 bg-white p-8 text-center">
            <Search className="mx-auto text-zinc-400" />
            <h3 className="mt-4 font-black">No workers found</h3>
          </div>
        )}

        <div className="grid gap-4">
          {workers.map((item) => {
            const { user, workerProfile } = item;

            return (
              <article
                key={user._id}
                className="rounded-lg border border-black/10 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#141414] text-lg font-black text-white">
                      {user.name?.slice(0, 1)}
                    </div>

                    <div>
                      <h3 className="font-black">{user.name}</h3>

                      <p className="mt-1 text-sm text-zinc-600">
                        {(workerProfile.skills || []).join(", ")}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-sm font-bold text-amber-700">
                        <Star size={15} fill="currentColor" />
                        {workerProfile.ratingAverage || "0.0"}
                      </p>
                    </div>
                  </div>

                  <button className="inline-flex items-center gap-2 rounded-md bg-[#141414] px-4 py-3 text-sm font-bold text-white">
                    <CalendarCheck size={16} />
                    Book Worker
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
