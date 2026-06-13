import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <p className="text-sm uppercase tracking-[0.22em] text-slate-500">404</p>
      <h2 className="mt-4 text-4xl font-semibold text-slate-900">Page not found</h2>
      <p className="mt-3 text-sm text-slate-600">The route you followed is not available in the admin panel.</p>
      <Link to="/" className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
        <ArrowLeft className="h-4 w-4" /> Return home
      </Link>
    </div>
  );
}
