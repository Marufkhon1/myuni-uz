import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d="M5 12h14" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeroSearchBar({ className = "", isDark = false }) {
  const navigate = useNavigate();
  const inputId = useId();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const hasQuery = Boolean(query.trim());

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
      className={"relative w-full " + className}
      role="search"
      aria-label="Universitet qidiruvi"
    >
      <label htmlFor={inputId} className="sr-only">
        Universitet, shahar yoki yo&apos;nalish qidirish
      </label>

      <div
        className={
          "group relative flex flex-col overflow-hidden rounded-[1.35rem] p-1.5 shadow-soft transition duration-300 sm:flex-row sm:items-center " +
          (isDark
            ? "bg-white/[0.07] ring-1 ring-inset ring-white/15 " +
              (isFocused
                ? "bg-white/[0.1] shadow-[0_0_0_1px_rgba(96,165,250,0.35),0_20px_50px_-18px_rgba(37,99,235,0.55)] ring-blue-400/40"
                : "hover:bg-white/[0.09] hover:ring-white/25")
            : "bg-white ring-1 ring-inset ring-slate-200/90 " +
              (isFocused
                ? "shadow-[0_0_0_1px_rgba(37,99,235,0.28),0_18px_40px_-16px_rgba(37,99,235,0.35)] ring-primary/35"
                : "hover:ring-slate-300/90"))
        }
      >
        <div className="relative min-w-0 flex-1">
          <span
            className={
              "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition " +
              (isFocused || hasQuery
                ? isDark
                  ? "text-blue-300"
                  : "text-primary"
                : isDark
                  ? "text-slate-400"
                  : "text-slate-400")
            }
          >
            <SearchIcon className="h-[1.15rem] w-[1.15rem]" />
          </span>

          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Universitet, shahar yoki yo'nalish..."
            className={
              "h-12 w-full border-0 bg-transparent py-3 pl-11 pr-[4.25rem] text-[0.95rem] font-semibold outline-none placeholder:font-medium sm:h-[3.25rem] sm:pl-12 sm:pr-20 sm:text-base " +
              (isDark
                ? "text-white placeholder:text-slate-400"
                : "text-slate-900 placeholder:text-slate-400")
            }
            autoComplete="off"
          />

          <kbd
            className={
              "pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded-lg px-2 py-1 font-mono text-[10px] font-bold tracking-wide sm:inline-flex " +
              (isDark
                ? "bg-white/10 text-slate-300 ring-1 ring-inset ring-white/15"
                : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200/80")
            }
          >
            <span className="opacity-70">Ctrl</span>
            <span>K</span>
          </kbd>
        </div>

        <button
          type="submit"
          className={
            "landing-btn-gradient relative inline-flex h-12 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[1.05rem] px-5 text-sm font-black tracking-tight sm:h-[3.25rem] sm:min-w-[11.5rem] sm:px-6 sm:text-[0.95rem] " +
            "shadow-[0_12px_28px_-10px_rgba(37,99,235,0.65)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-transparent before:to-transparent before:opacity-0 before:transition hover:before:opacity-100"
          }
        >
          <span className="relative z-[1]">{hasQuery ? "Qidirish" : "Universitetlarni ko'rish"}</span>
          <ArrowIcon className="relative z-[1] h-4 w-4 opacity-90 transition group-hover:translate-x-0.5" />
        </button>
      </div>
    </form>
  );
}
