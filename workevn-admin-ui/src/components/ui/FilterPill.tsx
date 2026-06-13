interface FilterPillProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

export default function FilterPill({ active, label, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
      }`}
    >
      {label}
    </button>
  );
}
