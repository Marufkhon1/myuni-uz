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
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-4 py-4 dark:border-white/10 dark:from-white/[0.03] dark:to-transparent sm:px-5">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">OTM qo&apos;shish</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{pickerHint}</p>
      </div>

      <div className="p-4 sm:p-5">
        {onUseMyUniversity && !isFull && (
          <button
            type="button"
            onClick={onUseMyUniversity}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary/10 to-violet-500/10 px-4 py-3 text-xs font-black text-primary ring-1 ring-primary/20 transition hover:from-primary/15 hover:to-violet-500/15 dark:from-primary/15 dark:to-violet-500/10"
          >
            <span aria-hidden="true">🎓</span>
            {myUniversityLabel}
          </button>
        )}

        {isFull ? (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50/80 to-orange-50/40 px-4 py-4 dark:border-amber-400/20 dark:from-amber-500/10 dark:to-orange-500/5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-lg ring-1 ring-amber-200/70 dark:ring-amber-400/25">
              ✓
            </span>
            <div>
              <p className="text-sm font-black text-amber-950 dark:text-amber-100">3 ta OTM tanlandi</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-800/80 dark:text-amber-200/80">
                Maksimal {MAX_COMPARE} ta OTM tanlandi. Boshqasini qo&apos;shish uchun yuqoridagi kartalardan birini
                olib tashlang.
              </p>
            </div>
          </div>
        ) : (
          <>
            <CompareSearchInput value={search} onChange={onSearchChange} />
            <div className="chat-messages-scroll mt-3 max-h-56 space-y-1 overflow-y-auto overscroll-contain rounded-xl border border-slate-200/60 bg-slate-50/40 p-1 dark:border-white/10 dark:bg-white/[0.02]">
              {list.length === 0 ? (
                <p className="py-8 text-center text-sm font-semibold text-slate-500">Topilmadi</p>
              ) : (
                list.slice(0, 40).map((university) => (
                  <button
                    key={university.id}
                    type="button"
                    onClick={() => onSelect(university.id)}
                    className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-white hover:shadow-sm dark:hover:bg-white/[0.05]"
                  >
                    <UniversityAvatar university={university} size="sm" />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black text-slate-900 dark:text-white">
                        {university.short_name || university.name}
                      </span>
                      {university.location && (
                        <span className="block truncate text-[11px] text-slate-500">{university.location}</span>
                      )}
                      {university.average_rating != null && (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                          <span className="text-amber-500" aria-hidden="true">
                            ★
                          </span>
                          {university.average_rating}/5 · {university.review_count ?? 0} sharh
                        </span>
                      )}
                    </div>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary text-sm font-black text-white opacity-0 shadow-sm transition group-hover:opacity-100">
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
