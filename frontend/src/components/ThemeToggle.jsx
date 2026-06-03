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

/** Navbar pill switch — gradient track, silliq thumb, aniq ikonlar. */
function NavbarThemeSwitch({ isDark, onToggle, className = "" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}
      title={isDark ? "Yorug' rejim" : "Qorong'u rejim"}
      onClick={onToggle}
      className={`group relative inline-flex h-10 w-[4.25rem] shrink-0 items-center rounded-full p-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.97] ${
        isDark
          ? "border border-indigo-400/20 bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_14px_-4px_rgba(0,0,0,0.45)] hover:border-indigo-300/30 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_18px_-4px_rgba(67,56,202,0.35)]"
          : "border border-amber-200/80 bg-gradient-to-br from-amber-50 via-sky-50 to-blue-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_14px_-6px_rgba(251,191,36,0.35)] hover:border-amber-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_6px_18px_-4px_rgba(251,191,36,0.4)]"
      } ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2.5">
        <SunIcon
          className={`h-[15px] w-[15px] transition-all duration-300 ${
            isDark
              ? "scale-90 text-amber-400/40"
              : "scale-100 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.55)]"
          }`}
        />
        <MoonIcon
          className={`h-[15px] w-[15px] transition-all duration-300 ${
            isDark
              ? "scale-100 text-indigo-200 drop-shadow-[0_0_8px_rgba(199,210,254,0.45)]"
              : "scale-90 text-slate-400/35"
          }`}
        />
      </span>

      <span
        className={`pointer-events-none relative z-10 grid h-8 w-8 place-items-center rounded-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] ${
          isDark
            ? "translate-x-7 bg-gradient-to-br from-white to-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.28),0_0_0_1px_rgba(255,255,255,0.5)]"
            : "translate-x-0 bg-gradient-to-br from-white to-amber-50 shadow-[0_2px_10px_rgba(251,191,36,0.25),0_0_0_1px_rgba(255,255,255,0.9)] ring-1 ring-amber-200/70"
        }`}
        aria-hidden="true"
      >
        {isDark ? (
          <MoonIcon className="h-4 w-4 text-indigo-700" />
        ) : (
          <SunIcon className="h-4 w-4 text-amber-500" />
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
    <MoonIcon className="h-5 w-5 text-indigo-200" />
  ) : (
    <SunIcon className="h-5 w-5 text-amber-500" />
  );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}
      title={isDark ? "Yorug' rejim" : "Qorong'u rejim"}
      onClick={onToggle}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border shadow-soft transition hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
        isDark
          ? "border-indigo-400/25 bg-gradient-to-br from-slate-800 to-indigo-950 hover:border-indigo-300/40 dark:focus-visible:ring-offset-slateNight"
          : "border-amber-200/80 bg-gradient-to-br from-white to-amber-50 hover:border-amber-300 focus-visible:ring-offset-white"
      } ${className}`}
    >
      {icon}
    </button>
  );
}
