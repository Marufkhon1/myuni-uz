import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { trackHubCta } from "@/lib/analytics.js";

function SearchIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Navbar qidiruvi — /universitetlar?q= ga yo'naltiradi.
 */
export default function NavbarSearch({ isDark = true, className = "", onSubmitSuccess }) {
  const navigate = useNavigate();
  const inputId = useId();
  const [query, setQuery] = useState("");

  function submitSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set("q", trimmed);
    }
    const suffix = params.toString();
    const destination = suffix ? `/universitetlar?${suffix}` : "/universitetlar";
    trackHubCta(destination, "nav_search");
    navigate(destination);
    setQuery("");
    onSubmitSuccess?.();
  }

  return (
    <form
      onSubmit={submitSearch}
      role="search"
      aria-label="Universitet qidiruvi"
      className={"relative min-w-0 " + className}
    >
      <label htmlFor={inputId} className="sr-only">
        Universitet qidirish
      </label>
      <SearchIcon
        className={
          "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 " +
          (isDark ? "text-slate-400" : "text-slate-400")
        }
      />
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Qidirish…"
        autoComplete="off"
        className={
          "h-9 w-full rounded-full border py-0 pl-9 pr-3 text-sm font-semibold outline-none transition " +
          "placeholder:font-medium focus-visible:ring-2 focus-visible:ring-primary/40 " +
          (isDark
            ? "border-white/15 bg-white/5 text-white placeholder:text-slate-400 hover:bg-white/10"
            : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 hover:bg-white")
        }
      />
    </form>
  );
}
