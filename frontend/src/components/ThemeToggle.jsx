const SUN_PATH =
  "M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1ZM12 19a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM4.22 4.22a1 1 0 0 1 1.42 0l.7.7a1 1 0 0 1-1.41 1.42l-.71-.7a1 1 0 0 1 0-1.42ZM17.66 17.66a1 1 0 0 1 1.41 0l.71.7a1 1 0 1 1-1.42 1.42l-.7-.71a1 1 0 0 1 0-1.41ZM2 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1ZM19 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1ZM4.93 17.66a1 1 0 0 1 1.41 1.41l-.7.71a1 1 0 0 1-1.42-1.42l.71-.7ZM18.36 4.22a1 1 0 0 1 1.42 1.42l-.71.7a1 1 0 0 1-1.41-1.41l.7-.71Z";

const MOON_PATH =
  "M21 14.6A8.9 8.9 0 0 1 9.4 3a.8.8 0 0 0-1-.98 10.5 10.5 0 1 0 13.58 13.58.8.8 0 0 0-.98-1Z";

function SunIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={SUN_PATH} fill="currentColor" />
    </svg>
  );
}

function MoonIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={MOON_PATH} fill="currentColor" />
    </svg>
  );
}

/** Qorong'u navbar uchun pill switch — Kirish tugmasidan vizual farq qiladi. */
function NavbarThemeSwitch({ isDark, onToggle, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}
      title={isDark ? "Yorug' rejim" : "Qorong'u rejim"}
      onClick={onToggle}
      className={`relative inline-flex h-9 w-[3.35rem] shrink-0 items-center rounded-full border p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
        isDark
          ? "border-white/35 bg-slate-900/70 hover:border-white/50 hover:bg-slate-900/90 focus-visible:ring-offset-[#0c1f4a]"
          : "border-slate-300/80 bg-slate-200/80 hover:border-slate-400 focus-visible:ring-offset-white"
      } ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
        <MoonIcon
          className={`h-3.5 w-3.5 transition-opacity duration-200 ${isDark ? "text-slate-500" : "text-white/85"}`}
        />
        <SunIcon
          className={`h-3.5 w-3.5 transition-opacity duration-200 ${isDark ? "text-amber-300" : "text-white/35"}`}
        />
      </span>
      <span
        className={`pointer-events-none relative z-[1] grid h-7 w-7 place-items-center rounded-full bg-white text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out ${
          isDark ? "translate-x-[1.35rem]" : "translate-x-0"
        }`}
        aria-hidden="true"
      >
        {isDark ? (
          <SunIcon className="h-4 w-4 text-amber-500" />
        ) : (
          <MoonIcon className="h-4 w-4 text-slate-600" />
        )}
      </span>
    </button>
  );
}

export default function ThemeToggle({ isDark, onToggle, className = "", variant = "default" }) {
  if (variant === "navbar") {
    return <NavbarThemeSwitch isDark={isDark} onToggle={onToggle} className={className} />;
  }

  const icon = isDark ? (
    <SunIcon className="h-5 w-5 text-amber-500" />
  ) : (
    <MoonIcon className="h-5 w-5 text-slate-600 dark:text-slate-200" />
  );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}
      title={isDark ? "Yorug' rejim" : "Qorong'u rejim"}
      onClick={onToggle}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border shadow-soft transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
        isDark
          ? "border-white/20 bg-slate-800 text-amber-400 hover:border-amber-400/50 hover:bg-slate-700 dark:focus-visible:ring-offset-slateNight"
          : "border-slate-200 bg-white text-slate-600 hover:border-primary focus-visible:ring-offset-white"
      } ${className}`}
    >
      {icon}
    </button>
  );
}
