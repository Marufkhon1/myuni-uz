import UniversityAvatar from "../UniversityAvatar.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import { formatUniversityPreview } from "../../utils/universityMetaFormat.js";
import { getReviewListContent } from "../../utils/reviewRoleContent.js";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

function ReviewUniversityRow({ university, isSelected, onSelect }) {
  const preview =
    formatUniversityPreview(university)?.slice(0, 100) || university.location || "";

  return (
    <button
      type="button"
      onClick={() => onSelect(university.id)}
      className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
        isSelected
          ? "bg-primary/8 ring-1 ring-primary/25 dark:bg-primary/15 dark:ring-primary/35"
          : "hover:bg-slate-50 dark:hover:bg-white/[0.04]"
      }`}
    >
      {isSelected && (
        <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-primary" aria-hidden="true" />
      )}
      <UniversityAvatar university={university} size="sm" />
      <div className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm font-bold ${
            isSelected ? "text-primary dark:text-blue-200" : "text-slate-900 dark:text-white"
          }`}
        >
          {university.short_name || university.name}
        </span>
        <p className="mt-0.5 line-clamp-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {preview}
        </p>
      </div>
    </button>
  );
}

export default function ReviewUniversityList({
  isStudent = false,
  search,
  onSearchChange,
  universities,
  selectedId,
  onSelect,
  className = "",
  isWideLayout = false,
}) {
  const content = getReviewListContent(isStudent);
  const selectedUniversity = universities.find(
    (university) => String(university.id) === String(selectedId)
  );

  return (
    <div
      className={`flex w-full min-w-0 flex-col self-start overflow-hidden rounded-[1.25rem] bg-white shadow-[0_8px_30px_-10px_rgba(15,23,42,0.1)] ring-1 ring-slate-200/70 dark:bg-[#0b1220]/80 dark:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.45)] dark:ring-white/10 ${
        isWideLayout
          ? "lg:sticky lg:top-4 lg:h-[calc(100dvh-11rem)] lg:max-h-[calc(100dvh-11rem)] lg:w-[300px] lg:max-w-[300px] lg:shrink-0"
          : "h-fit xl:max-h-[calc(100dvh-11rem)]"
      } ${className}`}
    >
      <div className="shrink-0 border-b border-slate-100 px-4 py-4 dark:border-white/10 sm:px-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{content.title}</p>
        <h2 className="mt-1 text-lg font-black leading-snug text-slate-950 dark:text-white">
          {content.subtitle}
        </h2>
        <label className="mt-3 flex h-10 items-center gap-2.5 rounded-xl bg-slate-100 px-3.5 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/30 dark:bg-white/[0.06] dark:focus-within:ring-primary/40">
          <span className="shrink-0 text-slate-400" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={content.searchPlaceholder}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          />
        </label>
        <p className="mt-2 text-[11px] font-medium text-slate-400">{universities.length} ta universitet</p>
      </div>

      <div
        className={`min-h-0 flex-1 space-y-0.5 px-2 py-2 ${
          isWideLayout
            ? "chat-messages-scroll overflow-y-auto overscroll-contain"
            : "chat-messages-scroll max-h-[min(28rem,calc(100dvh-17rem))] overflow-y-auto overscroll-contain"
        }`}
      >
        {universities.length === 0 ? (
          <EmptyState
            compact
            variant="search"
            title="Universitet topilmadi"
            description="Nom yoki qisqa nom bo'yicha qidirib ko'ring."
            className="mx-1 mt-2 border-none bg-transparent dark:bg-transparent"
          />
        ) : (
          universities.map((university) => (
            <ReviewUniversityRow
              key={university.id}
              university={university}
              isSelected={String(selectedId) === String(university.id)}
              onSelect={onSelect}
            />
          ))
        )}
      </div>

      <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
        {selectedUniversity ? (
          <div className="flex items-center gap-2.5">
            <UniversityAvatar university={selectedUniversity} size="xs" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Tanlangan</p>
              <p className="truncate text-xs font-black text-slate-800 dark:text-white">
                {selectedUniversity.short_name || selectedUniversity.name}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">OTM tanlang — profil o&apos;ngda ochiladi</p>
        )}
      </div>
    </div>
  );
}
