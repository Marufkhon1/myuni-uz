import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSearchBar({ className = "", isDark = false }) {
  const navigate = useNavigate();
  const inputId = useId();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set("q", trimmed);
    }
    const suffix = params.toString();
    navigate(suffix ? `/universitetlar?${suffix}` : "/universitetlar");
  }

  return (
    <form
      onSubmit={submitSearch}
      className={
        "relative flex w-full flex-col gap-3 sm:flex-row sm:items-stretch " + className
      }
      role="search"
      aria-label="Universitet qidiruvi"
    >
      <label htmlFor={inputId} className="sr-only">
        Universitet yoki shahar qidirish
      </label>
      <div className="relative min-w-0 flex-1">
        <span
          className={
            "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 " +
            (isDark ? "text-slate-400" : "text-slate-400")
          }
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Universitet, shahar yoki yo'nalish..."
          className={
            "h-14 w-full rounded-2xl border py-3 pl-12 pr-4 text-base font-semibold shadow-sm outline-none transition focus:ring-4 " +
            (isDark
              ? "border-white/15 bg-white/10 text-white placeholder:text-slate-400 focus:border-blue-400/50 focus:ring-blue-400/15"
              : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary/40 focus:ring-blue-100")
          }
          autoComplete="off"
        />
        <kbd
          className={
            "pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-lg border px-2 py-0.5 text-[10px] font-bold sm:inline " +
            (isDark ? "border-white/15 text-slate-400" : "border-slate-200 text-slate-400")
          }
        >
          Ctrl K
        </kbd>
      </div>
      <button
        type="submit"
        className="landing-btn-gradient h-14 shrink-0 rounded-2xl px-8 text-base font-black shadow-glow"
      >
        Qidirish
      </button>
    </form>
  );
}
