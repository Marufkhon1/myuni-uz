import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ICONS = {
  city: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  rating: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2Z"
      />
    </svg>
  ),
  direction: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  ),
  sort: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h13M3 12h9M3 17h5M16 6v12M16 18l3-3M16 6l3 3" />
    </svg>
  ),
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-primary" : "text-slate-400"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

function isNodeInside(node, target) {
  return Boolean(node && target && node.contains(target));
}

export default function FilterSelect({
  label,
  value,
  onChange,
  options = [],
  icon,
  className = "",
  disabled = false,
  defaultValue = "",
}) {
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const listboxId = useId();
  const labelId = useId();
  const iconNode = typeof icon === "string" ? ICONS[icon] : icon;

  const normalizedValue = value == null ? "" : String(value);

  const selectedOption = useMemo(
    () => options.find((option) => String(option.value) === normalizedValue) ?? options[0],
    [options, normalizedValue]
  );

  const isFiltered = normalizedValue !== String(defaultValue);

  const updateMenuPosition = () => {
    if (!rootRef.current) {
      return;
    }
    const rect = rootRef.current.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 8,
      left: rect.left,
      width: Math.max(rect.width, 220),
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    updateMenuPosition();

    function handleReposition() {
      updateMenuPosition();
    }

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (
        isNodeInside(rootRef.current, event.target) ||
        isNodeInside(listRef.current, event.target)
      ) {
        return;
      }
      setIsOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightIndex((current) => Math.min(current + 1, options.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightIndex((current) => Math.max(current - 1, 0));
      } else if (event.key === "Enter" && highlightIndex >= 0) {
        event.preventDefault();
        const option = options[highlightIndex];
        if (option) {
          onChange(String(option.value));
          setIsOpen(false);
        }
      }
    }

    const closeTimer = window.setTimeout(() => {
      document.addEventListener("mousedown", handlePointerDown);
    }, 0);

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(closeTimer);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [highlightIndex, isOpen, onChange, options]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const selectedIndex = options.findIndex((option) => String(option.value) === normalizedValue);
    setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [isOpen, normalizedValue, options]);

  useEffect(() => {
    if (!isOpen || highlightIndex < 0 || !listRef.current) {
      return;
    }
    const item = listRef.current.querySelector(`[data-index="${highlightIndex}"]`);
    if (item && typeof item.scrollIntoView === "function") {
      item.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex, isOpen]);

  function toggleOpen(event) {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) {
      return;
    }
    if (!isOpen) {
      updateMenuPosition();
    }
    setIsOpen((current) => !current);
  }

  function selectOption(optionValue, event) {
    event?.preventDefault();
    event?.stopPropagation();
    if (String(optionValue) === normalizedValue) {
      setIsOpen(false);
      return;
    }
    onChange(String(optionValue));
    setIsOpen(false);
  }

  const menu =
    isOpen && options.length > 0 ? (
      <ul
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-labelledby={labelId}
        style={{
          top: menuPosition.top,
          left: menuPosition.left,
          width: menuPosition.width,
        }}
        className="custom-select-menu fixed z-[200] max-h-60 overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {options.map((option, index) => {
          const optionValue = String(option.value);
          const isSelected = optionValue === normalizedValue;
          const isHighlighted = index === highlightIndex;

          return (
            <li key={`${optionValue}-${option.label}`} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                data-index={index}
                onMouseEnter={() => setHighlightIndex(index)}
                onMouseDown={(event) => selectOption(option.value, event)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  isSelected
                    ? "bg-primary/10 text-primary dark:bg-blue-400/15 dark:text-blue-200"
                    : isHighlighted
                      ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
                }`}
              >
                <span className={`w-4 shrink-0 ${isSelected ? "opacity-100" : "opacity-0"}`}>
                  <CheckIcon />
                </span>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    ) : null;

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <span id={labelId} className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
        {label}
      </span>

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={labelId}
        aria-controls={isOpen ? listboxId : undefined}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={toggleOpen}
        className={`group flex h-12 w-full items-center gap-3 rounded-2xl border bg-white px-3 text-left shadow-sm transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900/80 ${
          isOpen
            ? "border-primary/50 ring-4 ring-blue-100/80 dark:ring-blue-400/15"
            : isFiltered
              ? "border-primary/25 hover:border-primary/40 hover:shadow-md dark:border-primary/30"
              : "border-slate-200 hover:border-slate-300 hover:shadow-md dark:border-white/12 dark:hover:border-white/20"
        }`}
      >
        {iconNode ? (
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${
              isOpen || isFiltered
                ? "bg-primary/10 text-primary dark:bg-blue-400/15 dark:text-blue-300"
                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 dark:bg-white/10 dark:text-slate-400"
            }`}
          >
            {iconNode}
          </span>
        ) : null}

        <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900 dark:text-white">
          {selectedOption?.label ?? "Tanlang"}
        </span>

        {isFiltered ? (
          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
        ) : null}

        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-50 dark:bg-white/5">
          <ChevronIcon open={isOpen} />
        </span>
      </button>

      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
