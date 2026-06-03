import UniversityIdentity from "../../UniversityIdentity.jsx";
import { formatUniversityMetaHeader } from "../../../utils/universityMetaFormat.js";
import { formatOwnershipLabel } from "../../../utils/universityCatalog.js";
import CompareStarBadge from "./CompareStarBadge.jsx";
import CompareRecommendBadge from "./CompareRecommendBadge.jsx";

function RatingDistribution({ distribution, reviewCount }) {
  const total = reviewCount || 0;
  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution?.[String(star)] ?? 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-[11px]">
            <span className="w-3 shrink-0 font-bold text-amber-500">{star}</span>
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${percent}%` }} />
            </div>
            <span className="w-5 shrink-0 text-right tabular-nums text-slate-400">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function CompareReviewBlock({ sampleReview, reviewCount = 0, compact = false }) {
  const hasReview = Boolean(sampleReview?.text);
  return (
    <div className={`flex flex-col ${compact ? "p-3" : "p-4"}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Eng ko&apos;p yoqtirilgan sharh</p>
      <div className={compact ? "mt-2" : "mt-2 min-h-[6.75rem]"}>
        {hasReview ? (
          <blockquote className="rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white p-3 dark:border-amber-400/15 dark:from-amber-400/5 dark:to-transparent">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{sampleReview.author}</p>
              <div className="flex items-center gap-2">
                <CompareStarBadge rating={sampleReview.rating} size="sm" />
                {(sampleReview.like_count ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-rose-600 ring-1 ring-rose-200/80 dark:bg-white/10 dark:text-rose-300">
                    ❤ {sampleReview.like_count}
                  </span>
                )}
              </div>
            </div>
            <p className={`mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200 ${compact ? "line-clamp-3" : "line-clamp-4"}`}>
              &ldquo;{sampleReview.text}&rdquo;
            </p>
          </blockquote>
        ) : (
          <p className={`flex items-center justify-center text-sm font-semibold text-slate-400 ${compact ? "py-6" : "min-h-[6.75rem]"}`}>
            {reviewCount > 0 ? "Sharh mavjud" : "Sharh yo'q"}
          </p>
        )}
      </div>
    </div>
  );
}

const TINT_STYLES = {
  blue: "border-blue-200/80 dark:border-blue-400/20",
  violet: "border-violet-200/80 dark:border-violet-400/20",
  emerald: "border-emerald-200/80 dark:border-emerald-400/20",
};

export default function CompareUniversityDetail({
  university,
  tint = "blue",
  onToggleFavorite,
  onViewReviews,
  favoriteBusyId,
  isRecommended = false,
  readOnly = false,
}) {
  const description = university.summary || university.description;
  const metaHeader = formatUniversityMetaHeader(university);
  const ownershipLabel = formatOwnershipLabel(university);
  const institutionLabel = university.institution_label || university.institution_type;
  const displayTitle = university.short_name || university.name;
  const fullName =
    university.short_name && university.name && university.short_name !== university.name
      ? university.name
      : null;

  const infoRows = (
    readOnly
      ? [
          { label: "Turi", value: institutionLabel },
          { label: "Mulkchilik", value: ownershipLabel },
          {
            label: "Asos solingan",
            value: university.founded_year ? `${university.founded_year}-yil` : null,
          },
          { label: "Sharhlar", value: university.review_count != null ? `${university.review_count} ta` : null },
        ]
      : [
          { label: "Turi", value: institutionLabel },
          { label: "Mulkchilik", value: ownershipLabel },
          {
            label: "Asos solingan",
            value: university.founded_year ? `${university.founded_year}-yil` : null,
          },
          { label: "Sharhlar", value: university.review_count != null ? `${university.review_count} ta` : null },
          { label: "Chat a'zolari", value: university.member_count != null ? `${university.member_count} ta` : null },
          {
            label: "Shahar",
            value: university.city && university.city !== university.location ? university.city : null,
          },
        ]
  ).filter((item) => item.value);

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-white dark:bg-white/[0.03] ${TINT_STYLES[tint]} ${
        isRecommended ? "shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/35" : ""
      }`}
    >
      {!readOnly && onToggleFavorite && (
        <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
          <button
            type="button"
            disabled={String(favoriteBusyId) === String(university.id)}
            onClick={() => onToggleFavorite(university)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-800 ring-1 ring-slate-200/80 transition hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50 dark:bg-white/[0.04] dark:text-white dark:ring-white/10"
          >
            <span
              className={`grid h-6 w-6 place-items-center rounded-lg text-sm ${
                university.is_favorited
                  ? "bg-amber-400 text-white"
                  : "bg-amber-100 text-amber-500 dark:bg-amber-400/20"
              }`}
              aria-hidden="true"
            >
              {university.is_favorited ? "★" : "☆"}
            </span>
            {university.is_favorited ? "Sevimlida" : "Sevimliga"}
          </button>
          {onViewReviews && (
            <button
              type="button"
              onClick={() => onViewReviews(university.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white transition hover:bg-primary dark:bg-white dark:text-slate-900 dark:hover:bg-primary dark:hover:text-white"
            >
              Sharhlarni ko&apos;rish
            </button>
          )}
        </div>
      )}

      <div className="border-b border-slate-100 p-4 dark:border-white/10">
        <div className="flex items-start gap-3">
          <UniversityIdentity university={university} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex min-h-[1.5rem] flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-base font-black leading-snug text-slate-950 dark:text-white">{displayTitle}</h3>
              {isRecommended && <CompareRecommendBadge variant="pill" className="shrink-0 px-2 py-0.5 text-[9px]" />}
            </div>
            {fullName ? (
              <p className="mt-0.5 line-clamp-2 min-h-[2rem] text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {fullName}
              </p>
            ) : (
              <p className="mt-0.5 min-h-[2rem] text-xs leading-relaxed text-slate-500 dark:text-slate-400" aria-hidden="true">
                {"\u00A0"}
              </p>
            )}
            {university.location && <p className="mt-1 text-xs text-slate-500">{university.location}</p>}
            <div className="mt-2 flex min-h-[2.5rem] flex-wrap items-center gap-2">
              <CompareStarBadge rating={university.average_rating} />
              {!readOnly && university.is_joined && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                  Chatda
                </span>
              )}
            </div>
          </div>
        </div>
        {metaHeader && !readOnly && (
          <p className="mt-3 text-[11px] font-semibold text-slate-500">{metaHeader}</p>
        )}
        {description && (
          <p className={`mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 ${readOnly ? "line-clamp-3" : "line-clamp-4"}`}>
            {description}
          </p>
        )}
      </div>

      {infoRows.length > 0 && (
        <dl className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-b border-slate-100 dark:divide-white/10 dark:border-white/10">
          {infoRows.map((item) => (
            <div key={item.label} className="px-3 py-2.5">
              <dt className="text-[10px] font-bold uppercase text-slate-400">{item.label}</dt>
              <dd className="mt-0.5 text-sm font-bold leading-snug text-slate-800 dark:text-white">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div
        className={`mt-auto grid divide-slate-100 dark:divide-white/10 ${
          readOnly ? "grid-cols-1 divide-y" : "max-sm:divide-y sm:grid-cols-2 sm:divide-x"
        }`}
      >
        <CompareReviewBlock
          sampleReview={university.sample_review}
          reviewCount={university.review_count}
          compact={readOnly}
        />
        <div className={`flex flex-col ${readOnly ? "p-3" : "p-4"}`}>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Baholar taqsimoti</p>
          <div className="mt-2">
            <RatingDistribution
              distribution={university.rating_distribution}
              reviewCount={university.review_count}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
