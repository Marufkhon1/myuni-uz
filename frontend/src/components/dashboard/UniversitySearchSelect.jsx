import { useEffect, useId, useMemo, useRef, useState } from "react";
import UniversityAvatar from "../UniversityAvatar.jsx";
import { matchUniversityByText } from "../../utils/universityMatch.js";

function formatUniversityLabel(university) {
  if (!university) {
    return "";
  }
  if (university.short_name && university.short_name !== university.name) {
    return `${university.short_name} — ${university.name}`;
  }
  return university.name;
}

const defaultInputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-11 font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-slate-900/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-primary/60 dark:focus:ring-blue-400/20";

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 text-slate-400 transition-transform duration-200 dark:text-slate-500 ${open ? "rotate-180 text-primary dark:text-blue-300" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function UniversitySearchSelect({
  universities = [],
  value,
  onChange,
  disabled = false,
  placeholder = "Universitet qidiring...",
  inputClassName = "",
  reserveHintSpace = false,
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedUniversity = useMemo(
    () => matchUniversityByText(universities, value),
    [universities, value]
  );

  const closedLabel = useMemo(
    () => (selectedUniversity ? formatUniversityLabel(selectedUniversity) : value || ""),
    [selectedUniversity, value]
  );

  const filteredUniversities = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return universities;
    }
    return universities.filter((university) => {
      const name = university.name.toLowerCase();
      const shortName = (university.short_name || "").toLowerCase();
      const location = (university.location || "").toLowerCase();
      return name.includes(search) || shortName.includes(search) || location.includes(search);
    });
  }, [universities, query]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function selectUniversity(university) {
    onChange(university.name);
    setQuery(formatUniversityLabel(university));
    setIsOpen(false);
  }

  function handleInputChange(event) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setIsOpen(true);
    onChange(nextQuery);
  }

  function handleFocus() {
    setQuery(closedLabel);
    setIsOpen(true);
  }

  const resolvedInputClassName = inputClassName || defaultInputClassName;

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={isOpen ? query : closedLabel}
          onChange={handleInputChange}
          onFocus={handleFocus}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          className={resolvedInputClassName}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <ChevronIcon open={isOpen} />
        </span>
      </div>

      {isOpen && !disabled && (
        <ul
          id={listId}
          role="listbox"
          className="university-select-dropdown absolute z-30 mt-2 max-h-72 w-full space-y-1 overflow-y-auto rounded-3xl border border-slate-200/90 bg-white p-2 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/95 dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)]"
        >
          {filteredUniversities.length === 0 ? (
            <li className="rounded-2xl px-4 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Universitet topilmadi. Boshqa nom bilan qidiring.
            </li>
          ) : (
            filteredUniversities.map((university) => {
              const isSelected = selectedUniversity?.id === university.id;
              return (
                <li key={university.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectUniversity(university)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      isSelected
                        ? "border border-primary/30 bg-blue-50 shadow-sm dark:border-primary/40 dark:bg-primary/15"
                        : "border border-transparent hover:border-slate-200/80 hover:bg-slate-50 dark:hover:border-white/10 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <UniversityAvatar university={university} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                        {university.short_name || university.name}
                      </p>
                      {university.short_name && university.short_name !== university.name && (
                        <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                          {university.name}
                        </p>
                      )}
                      {university.location && (
                        <p className="mt-0.5 truncate text-xs font-semibold text-primary">{university.location}</p>
                      )}
                    </div>
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
            })
          )}
        </ul>
      )}

      {(reserveHintSpace || (value && !selectedUniversity)) && (
        <p
          className={`mt-1 h-4 truncate text-[10px] font-semibold leading-4 ${
            value && !selectedUniversity
              ? "text-amber-600 dark:text-amber-400"
              : reserveHintSpace
                ? "invisible"
                : "hidden"
          }`}
        >
          {value && !selectedUniversity
            ? "Ro'yxatdan tanlang"
            : "\u00a0"}
        </p>
      )}
    </div>
  );
}
