export default function SettingsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Settings</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Workspace preferences</h2>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Customize the admin experience with theme settings, notifications, and workspace defaults.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Theme</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Toggle dark and light mode to match your workflow.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Enable alerts for bookings, verifications, and cancellations.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">User access</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage admin users, roles, and team access in one place.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
