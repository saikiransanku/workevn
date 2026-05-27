export function AppShell({ eyebrow, title, subtitle, actions, children }) {
  return (
    <main className="min-h-screen bg-[#eef3f0] text-[#17201d]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-3 z-20 flex flex-col gap-4 rounded-lg border border-[#dfe6e2] bg-white/95 p-4 soft-shadow backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">{eyebrow}</p>
            <h1 className="font-display text-3xl font-extrabold tracking-normal text-[#17201d] sm:text-4xl">
              {title}
            </h1>
            {subtitle ? <p className="mt-1 max-w-3xl text-sm font-medium text-[#66736d]">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </header>
        {children}
      </div>
    </main>
  )
}
