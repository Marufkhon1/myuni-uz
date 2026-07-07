export default function CompareSearchInput({ value, onChange, placeholder = "Universitet qidiring..." }) {
  return (
    <label className="flex h-11 items-center gap-2.5 rounded-xl bg-slate-100/80 px-3.5 ring-1 ring-slate-200/60 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/30 dark:bg-white/[0.06] dark:ring-white/10">
      <span className="sr-only">Universitet qidirish</span>
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3-3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
      />
    </label>
  );
}
