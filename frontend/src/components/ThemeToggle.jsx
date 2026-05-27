export default function ThemeToggle({ isDark, onToggle, className = "" }) {
  const icon = isDark ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-amber-400" aria-hidden="true">
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1ZM12 19a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM4.22 4.22a1 1 0 0 1 1.42 0l.7.7a1 1 0 0 1-1.41 1.42l-.71-.7a1 1 0 0 1 0-1.42ZM17.66 17.66a1 1 0 0 1 1.41 0l.71.7a1 1 0 1 1-1.42 1.42l-.7-.71a1 1 0 0 1 0-1.41ZM2 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1ZM19 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1ZM4.93 17.66a1 1 0 0 1 1.41 1.41l-.7.71a1 1 0 0 1-1.42-1.42l.71-.7ZM18.36 4.22a1 1 0 0 1 1.42 1.42l-.71.7a1 1 0 0 1-1.41-1.41l.7-.71Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-slate-700" aria-hidden="true">
      <path d="M21 14.6A8.9 8.9 0 0 1 9.4 3a.8.8 0 0 0-1-.98 10.5 10.5 0 1 0 13.58 13.58.8.8 0 0 0-.98-1Z" />
    </svg>
  );

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-primary dark:border-white/10 dark:bg-white/10 ${className}`}
      aria-label="Rang rejimini almashtirish"
    >
      {icon}
    </button>
  );
}
