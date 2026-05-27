import { useState } from 'react'

export function CommissionSettings({ settings, onSave }) {
  const [commissionPercent, setCommissionPercent] = useState(settings.commissionPercent)
  const [emergencyFee, setEmergencyFee] = useState(settings.emergencyFee)

  return (
    <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Settings</p>
      <h2 className="font-display text-xl font-extrabold">Commission settings</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[#44524c]">
          Commission percent
          <input type="number" value={commissionPercent} onChange={(event) => setCommissionPercent(Number(event.target.value))} className="min-h-11 rounded-lg border border-[#cbd7d1] px-3" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#44524c]">
          Emergency fee
          <input type="number" value={emergencyFee} onChange={(event) => setEmergencyFee(Number(event.target.value))} className="min-h-11 rounded-lg border border-[#cbd7d1] px-3" />
        </label>
      </div>
      <button type="button" className="mt-4 rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-extrabold text-white" onClick={() => onSave({ commissionPercent, emergencyFee })}>Save settings</button>
    </section>
  )
}
