import React from "react";
import { createRoot } from "react-dom/client";
import { BriefcaseBusiness, UserRoundCheck, UsersRound } from "lucide-react";
import "./index.css";

function App() {
  return (
    <main className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <h1 className="text-xl font-semibold">Workevn Admin</h1>
          <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Refresh
          </button>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border bg-white p-5">
            <UsersRound className="mb-4 text-blue-600" />
            <h2 className="font-semibold">Users</h2>
            <p className="mt-2 text-sm text-slate-600">View customers and worker accounts.</p>
          </article>
          <article className="rounded-lg border bg-white p-5">
            <UserRoundCheck className="mb-4 text-emerald-600" />
            <h2 className="font-semibold">Worker approvals</h2>
            <p className="mt-2 text-sm text-slate-600">Approve or reject worker applications.</p>
          </article>
          <article className="rounded-lg border bg-white p-5">
            <BriefcaseBusiness className="mb-4 text-amber-600" />
            <h2 className="font-semibold">Bookings</h2>
            <p className="mt-2 text-sm text-slate-600">Monitor requested and completed work.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
