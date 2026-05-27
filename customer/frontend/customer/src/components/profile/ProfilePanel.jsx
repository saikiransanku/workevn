import { useState } from 'react'

export function ProfilePanel({ profile, onSave }) {
  const [name, setName] = useState(profile?.name || '')
  const [language, setLanguage] = useState(profile?.preferences?.language || 'English')

  return (
    <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Profile</p>
      <h2 className="font-display text-xl font-extrabold">Edit allowed fields</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[#44524c]">
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} className="min-h-11 rounded-lg border border-[#cbd7d1] px-3" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#44524c]">
          Language preference
          <input value={language} onChange={(event) => setLanguage(event.target.value)} className="min-h-11 rounded-lg border border-[#cbd7d1] px-3" />
        </label>
        <div className="rounded-lg bg-[#f3f6f4] p-3 text-sm text-[#66736d]">
          <strong className="block text-[#17201d]">Phone number</strong>
          {profile?.phone} cannot be edited here.
        </div>
        <div className="rounded-lg bg-[#f3f6f4] p-3 text-sm text-[#66736d]">
          <strong className="block text-[#17201d]">Email</strong>
          {profile?.email} cannot be edited here.
        </div>
      </div>
      <button
        type="button"
        onClick={() => onSave({ name, preferences: { ...profile.preferences, language } })}
        className="mt-4 rounded-lg bg-[#17201d] px-4 py-2 text-sm font-extrabold text-white"
      >
        Save profile
      </button>
    </section>
  )
}
