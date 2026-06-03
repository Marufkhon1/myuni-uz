import { useEffect, useId, useRef, useState } from "react";

const SORT_ICONS = {
  likes: "тЩе",
  rating: "тШЕ",
  rating_high: "тШЕ",
  newest: "тЖУ",
  oldest: "тЖС",
};

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 text-slate-400 transition-transform duration-200 dark:text-slate-500 ${
        open ? "rotate-180 text-primary dark:text-blue-300" : ""
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

function SortOptionIcon({ icon, active, compact = false }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl font-black ${
        compact ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm"
      } ${
        active
          ? "bg-primary/15 text-primary dark:bg-primary/25 dark:text-blue-200"
          : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
      }`}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}

export default function ReviewSortSelect({ options, value, onChange, disabled = false, compact = false }) {
  const listId = useId();
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.id === value) ?? options[0];
  const selectedIcon = SORT_ICONS[selectedOption?.id] ?? "тАв";

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
        className={`inline-flex w-full min-w-[12.5rem] max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-white text-left outline-none transition hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-slate-900/80 dark:hover:border-primary/40 dark:focus:border-primary/60 dark:focus:ring-blue-400/20 ${
          compact ? "h-9 py-0 pl-2 pr-8" : "py-2.5 pl-3 pr-11"
        }`}
      >
        <SortOptionIcon icon={selectedIcon} active compact={compact} />
        <span className="max-w-[9rem] truncate text-xs font-black text-slate-900 sm:max-w-[11rem] sm:text-sm dark:text-white">
          {selectedOption?.label}
        </span>
      </button>

      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <ChevronIcon open={isOpen} />
      </span>

      {isOpen && !disabled && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Saralash"
          className="absolute left-0 z-30 mt-1.5 min-w-full w-max space-y-0.5 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/95 dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)]"
        >
          {options.map((option) => {
            const isSelected = option.id === value;
            const icon = SORT_ICONS[option.id] ?? "тАв";

            return (
              <li key={option.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                    isSelected
                      ? "border border-primary/30 bg-blue-50 shadow-sm dark:border-primary/40 dark:bg-primary/15"
                      : "border border-transparent hover:border-slate-200/80 hover:bg-slate-50 dark:hover:border-white/10 dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <SortOptionIcon icon={icon} active={isSelected} />
                  <p className="min-w-0 flex-1 truncate text-sm font-black text-slate-900 dark:text-white">
                    {option.label}
                  </p>
                  {isSelected && (
                    <span className="shrink-0 text-primary" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
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
