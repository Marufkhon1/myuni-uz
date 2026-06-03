import { useEffect, useId, useRef, useState } from "react";

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
        open ? "rotate-180 text-primary dark:text-blue-300" : "text-slate-400 dark:text-slate-500"
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SortIcon({ id, active, compact = false }) {
  const sizeClass = compact ? "h-6 w-6 rounded-lg" : "h-8 w-8 rounded-xl";
  const className = `grid shrink-0 place-items-center ring-1 ring-inset transition-colors ${sizeClass} ${
    active
      ? "bg-gradient-to-br from-primary/15 to-violet-500/10 text-primary ring-primary/20 dark:from-primary/25 dark:to-violet-500/15 dark:text-blue-200 dark:ring-primary/30"
      : "bg-slate-100/80 text-slate-500 ring-slate-200/60 dark:bg-white/[0.06] dark:text-slate-400 dark:ring-white/10"
  }`;

  const svgClass = compact ? "h-3 w-3" : "h-3.5 w-3.5";

  if (id === "likes") {
    return (
      <span className={className} aria-hidden="true">
        <svg viewBox="0 0 24 24" className={svgClass} fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </span>
    );
  }

  if (id === "rating" || id === "rating_high") {
    return (
      <span className={className} aria-hidden="true">
        <svg viewBox="0 0 24 24" className={svgClass} fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </span>
    );
  }

  if (id === "newest") {
    return (
      <span className={className} aria-hidden="true">
        <svg viewBox="0 0 24 24" className={svgClass} fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  if (id === "oldest") {
    return (
      <span className={className} aria-hidden="true">
        <svg viewBox="0 0 24 24" className={svgClass} fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 24 24" className={svgClass} fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function ReviewSortSelect({ options, value, onChange, disabled = false, compact = false }) {
  const listId = useId();
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.id === value) ?? options[0];

  useEffect(() => {
    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function selectOption(optionId) {
    onChange(optionId);
    setIsOpen(false);
  }

  return (
    <div ref={rootRef} className="relative w-fit max-w-full">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((current) => !current)}
        className={`group inline-flex w-full min-w-[12.5rem] max-w-full items-center justify-between gap-2.5 rounded-xl border text-left outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
          compact ? "h-9 px-2.5" : "px-3 py-2.5"
        } ${
          isOpen
            ? "border-primary/40 bg-gradient-to-r from-blue-50/90 to-violet-50/50 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.35)] ring-2 ring-primary/15 dark:border-primary/35 dark:from-primary/10 dark:to-violet-500/10 dark:ring-primary/25"
            : "border-slate-200/80 bg-white/90 hover:border-primary/25 hover:shadow-sm focus:border-primary/40 focus:ring-2 focus:ring-primary/15 dark:border-white/12 dark:bg-slate-900/70 dark:hover:border-primary/30 dark:focus:ring-primary/20"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <SortIcon id={selectedOption?.id} active compact={compact} />
          <span className="truncate text-xs font-black text-slate-900 sm:text-sm dark:text-white">
            {selectedOption?.label}
          </span>
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen && !disabled && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Saralash"
          className="absolute left-0 z-30 mt-2 min-w-full w-max animate-[hero-fade-up_0.18s_ease-out_forwards] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-1 shadow-[0_24px_60px_-16px_rgba(15,23,42,0.35)] backdrop-blur-md motion-reduce:animate-none dark:border-white/10 dark:bg-slate-950/95 dark:shadow-[0_28px_70px_-16px_rgba(0,0,0,0.75)]"
        >
          {options.map((option) => {
            const isSelected = option.id === value;

            return (
              <li key={option.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option.id)}
                  className={`relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-gradient-to-r from-primary/[0.08] to-violet-500/[0.06] dark:from-primary/15 dark:to-violet-500/10"
                      : "hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  {isSelected && (
                    <span
                      className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-gradient-to-b from-primary to-violet-500"
                      aria-hidden="true"
                    />
                  )}
                  <SortIcon id={option.id} active={isSelected} compact />
                  <p
                    className={`min-w-0 flex-1 truncate text-sm font-bold ${
                      isSelected ? "text-primary dark:text-blue-200" : "text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {option.label}
                  </p>
                  {isSelected && (
                    <span className="shrink-0 text-primary dark:text-blue-300" aria-hidden="true">
                      <CheckIcon />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
