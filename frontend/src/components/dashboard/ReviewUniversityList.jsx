import UniversityAvatar from "../UniversityAvatar.jsx";
import { formatUniversityPreview } from "../UniversityMetaLine.jsx";
import { getReviewListContent } from "../../utils/reviewRoleContent.js";

const searchInputClass =
  "mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-400/25";

function ReviewUniversityRow({ university, isSelected, onSelect }) {
  const preview =
    formatUniversityPreview(university)?.slice(0, 80) || university.location || "";

  return (
    <button
      type="button"
      onClick={() => onSelect(university.id)}
      className={`flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-3 text-left transition-colors ${
        isSelected ? "bg-blue-50 dark:bg-blue-400/10" : "hover:bg-slate-100 dark:hover:bg-white/5"
      }`}
    >
      <UniversityAvatar university={university} size="sm" />
      <div className="min-w-0 flex-1">
        <span className="block truncate font-bold text-slate-900 dark:text-white">
          {university.short_name || university.name}
        </span>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
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
}) {
  const content = getReviewListContent(isStudent);
  const selectedUniversity = universities.find(
    (university) => String(university.id) === String(selectedId)
  );

  return (
    <div
      className={`flex h-fit w-full flex-col self-start rounded-[2rem] border border-slate-200 bg-white p-3.5 shadow-soft sm:p-4 dark:border-white/10 dark:bg-white/[0.06] lg:max-h-[calc(100dvh-11rem)] ${className}`}
    >
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">{content.title}</p>
        <h2 className="mt-1.5 text-xl font-black leading-snug text-slate-950 dark:text-white">
          {content.subtitle}
        </h2>
      </div>

      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={content.searchPlaceholder}
        className={searchInputClass}
      />

      <div className="mt-4 min-h-0 max-h-[min(28rem,calc(100dvh-17rem))] flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1">
        {universities.length === 0 ? (
          <p className="px-2 py-4 text-sm font-semibold text-slate-500">Universitet topilmadi.</p>
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

      <p className="mt-3 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-400 dark:border-white/10">
        {selectedUniversity ? (
          <>
            <span className="text-slate-400">Tanlangan:</span>{" "}
            <span className="font-black text-slate-700 dark:text-slate-200">
              {selectedUniversity.short_name || selectedUniversity.name}
            </span>
          </>
        ) : (
          "Ro'yxatdan OTM tanlang — ma'lumot o'ngda ochiladi."
        )}
      </p>
    </div>
  );
}
