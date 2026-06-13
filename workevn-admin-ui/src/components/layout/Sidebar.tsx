import { Link, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Users2,
  X
} from "lucide-react";

const links = [
  { label: "Dashboard", to: "/", icon: Sparkles },
  { label: "Bookings", to: "/bookings", icon: ClipboardList },
  { label: "Requests", to: "/requests", icon: Bell },
  { label: "Users", to: "/users", icon: Users2 },
  { label: "Partners", to: "/partners", icon: Users },
  { label: "Earnings", to: "/earnings", icon: CreditCard },
  { label: "Cancellations", to: "/cancellations", icon: Building2 },
  { label: "Verification", to: "/verification", icon: ShieldCheck },
  { label: "Disputes", to: "/disputes", icon: AlertTriangle },
  { label: "Reports", to: "/reports", icon: FileText },
  { label: "Settings", to: "/settings", icon: Settings }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform overflow-y-auto border-r border-slate-200 bg-white shadow-xl transition duration-300 dark:border-slate-800 dark:bg-slate-950 md:static md:translate-x-0 md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full min-h-screen flex-col px-4 py-5 md:px-5">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 md:gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Workevn Ops
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Admin panel
              </h1>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-7 flex-1 space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition-colors duration-150 ${
                    active
                      ? "bg-slate-900 text-white shadow-lg dark:bg-slate-700"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto hidden rounded-[2rem] border border-slate-200 bg-slate-900 p-5 text-slate-50 shadow-lg dark:border-slate-700 dark:bg-slate-900 md:block">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
              Operations pulse
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Monitor bookings, requests, and verifications across cities in one unified workspace.
            </p>
            <div className="mt-5 rounded-3xl bg-slate-800 p-4 text-sm text-slate-300">
              <span className="block font-semibold text-slate-100">City coverage</span>
              Mumbai, Bengaluru, Pune, Hyderabad
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
