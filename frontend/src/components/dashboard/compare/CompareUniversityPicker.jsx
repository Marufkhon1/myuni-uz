import UniversityAvatar from "../../UniversityAvatar.jsx";
import CompareSearchInput from "./CompareSearchInput.jsx";
import { MAX_COMPARE } from "../../../utils/compareMath.js";

function filterUniversities(universities, query, disabledIds) {
  const disabled = new Set(disabledIds.map(String));
  const available = universities.filter((university) => !disabled.has(String(university.id)));
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return available;
  }
  return available.filter(
    (university) =>
      university.name.toLowerCase().includes(normalized) ||
      university.short_name?.toLowerCase().includes(normalized) ||
      university.location?.toLowerCase().includes(normalized)
  );
}

export default function CompareUniversityPicker({
  universities,
  selectedIds,
  search,
  onSearchChange,
  onSelect,
  onUseMyUniversity,
  myUniversityLabel,
  pickerHint,
  isFull,
}) {
  const list = filterUniversities(universities, search, selectedIds);

  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 dark:bg-white/[0.03] dark:ring-white/10">
      <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">OTM qo&apos;shish</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{pickerHint}</p>
      </div>

      <div className="p-4">
        {onUseMyUniversity && !isFull && (
          <button
            type="button"
            onClick={onUseMyUniversity}
            className="mb-3 w-full rounded-xl bg-primary/10 px-3 py-2.5 text-xs font-black text-primary ring-1 ring-primary/20 transition hover:bg-primary/15 dark:bg-primary/15"
          >
            {myUniversityLabel}
          </button>
        )}

        {isFull ? (
          <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-sm font-semibold text-slate-500 dark:bg-white/[0.04]">
            Maksimal {MAX_COMPARE} ta OTM tanlandi. Boshqasini qo&apos;shish uchun birini olib tashlang.
          </p>
        ) : (
          <>
            <CompareSearchInput value={search} onChange={onSearchChange} />
            <div className="chat-messages-scroll mt-3 max-h-56 space-y-0.5 overflow-y-auto overscroll-contain">
              {list.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">Topilmadi</p>
              ) : (
                list.slice(0, 40).map((university) => (
                  <button
                    key={university.id}
                    type="button"
                    onClick={() => onSelect(university.id)}
                    className="group flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-primary/5 hover:ring-1 hover:ring-primary/20 dark:hover:bg-primary/10"
                  >
                    <UniversityAvatar university={university} size="sm" />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">
                        {university.short_name || university.name}
                      </span>
                      {university.location && (
                        <span className="block truncate text-[11px] text-slate-500">{university.location}</span>
                      )}
                      {university.average_rating != null && (
                        <span className="text-[11px] font-semibold text-primary">
                          {university.average_rating}/5 · {university.review_count ?? 0} sharh
                        </span>
                      )}
                    </div>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-black text-primary opacity-0 transition group-hover:opacity-100">
                      +
                    </span>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
