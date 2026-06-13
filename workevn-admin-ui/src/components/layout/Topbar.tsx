import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Menu, Search, Settings, Sparkles, UserCircle2, LogOut } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../auth/AuthContext";

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const location = useLocation();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { user, logout } = useAuth();

  useEffect(() => {
    setLastUpdated(new Date());
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 transition hover:border-slate-300 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Operations dashboard
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Workevn Admin
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Control center for bookings, partners, verifications and city operations.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center md:gap-4">
          <div className="relative w-full md:w-[560px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search bookings, customers, partners..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 md:inline-flex">
              <Sparkles className="h-4 w-4 text-slate-500 dark:text-slate-300" />
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <ThemeToggle />
            <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
              <Settings className="h-4 w-4" /> Quick actions
            </button>
            <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <UserCircle2 className="h-6 w-6 text-slate-600 dark:text-slate-200" />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name ?? "Admin"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role === "admin" ? "Operations Admin" : "Admin"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
