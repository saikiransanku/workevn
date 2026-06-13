import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { forgotPassword as forgotPasswordApi } from "../api/authApi";

export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remember, setRemember] = useState(true);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      window.location.replace(from);
    } catch (authError) {
      setError((authError as Error).message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWithRemember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password, remember);
      window.location.replace(from);
    } catch (authError) {
      setError((authError as Error).message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Workevn Admin</p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Secure login for the operations control panel.
            </h1>
            <p className="max-w-xl text-slate-300 sm:text-lg">
              Sign in and manage bookings, partner approvals, verifications, disputes, reports, and live service operations from one polished admin workspace.
            </p>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/20">
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Admin access details</h2>
              <p className="mt-4 text-sm text-slate-300">Use the admin credentials seeded by your backend or configure an admin user via environment variables.</p>
              <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/80 p-4">Email: <span className="font-semibold text-white">admin@example.com</span></div>
                <div className="rounded-3xl bg-slate-950/80 p-4">Password: <span className="font-semibold text-white">Admin@123</span></div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950/95 p-10 shadow-2xl shadow-black/30 ring-1 ring-white/10 sm:p-12">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Sign in</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Welcome back, operations lead.</h2>
            <form className="mt-10 space-y-6" onSubmit={handleSubmitWithRemember}>
              <label className="block">
                <span className="text-sm font-medium text-slate-300">Email</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="username"
                  required
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-600"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-300">Password</span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-600"
                />
              </label>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4" />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!forgotEmail && !email) {
                      setResetNotice("Enter your email above and press Forgot password to request a reset.");
                      return;
                    }
                    const targetEmail = forgotEmail || email;
                    try {
                      setResetNotice(null);
                      const res = await forgotPasswordApi(targetEmail);
                      setResetNotice(res.success ? "Password reset requested. Check logs or your email." : "Unable to send reset link.");
                    } catch (e) {
                      setResetNotice("Error requesting password reset");
                    }
                  }}
                  className="text-sm text-sky-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {error ? <p className="text-sm text-rose-400">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {isSubmitting ? "Signing in…" : "Sign in to dashboard"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
