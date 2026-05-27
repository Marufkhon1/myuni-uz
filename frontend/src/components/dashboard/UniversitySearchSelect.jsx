import { useEffect, useId, useMemo, useRef, useState } from "react";
import UniversityAvatar from "../UniversityAvatar.jsx";

export function matchUniversityByText(universities, text) {
  if (!text?.trim() || !universities?.length) {
    return null;
  }

  const query = text.trim().toLowerCase();

  const exact = universities.find(
    (university) =>
      university.name.toLowerCase() === query ||
      (university.short_name || "").toLowerCase() === query
  );
  if (exact) {
    return exact;
  }

  return (
    universities.find((university) => {
      const name = university.name.toLowerCase();
      const shortName = (university.short_name || "").toLowerCase();
      return name.includes(query) || shortName.includes(query) || query.includes(shortName);
    }) ?? null
  );
}

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
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-400/25";

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

  return (
    <div ref={rootRef} className="relative">
      <input
        type="text"
        value={isOpen ? query : closedLabel}
        onChange={handleInputChange}
        onFocus={handleFocus}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        aria-expanded={isOpen}
        aria-controls={listId}
        className={inputClassName || defaultInputClassName}
      />

      {isOpen && !disabled && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-soft dark:border-white/15 dark:bg-slate-900"
        >
          {filteredUniversities.length === 0 ? (
            <li className="px-4 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
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
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-400/10"
                        : "hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <UniversityAvatar university={university} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{university.short_name || university.name}</p>
                      {university.short_name && university.short_name !== university.name && (
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{university.name}</p>
                      )}
                      {university.location && (
                        <p className="truncate text-xs text-primary">{university.location}</p>
                      )}
                    </div>
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
