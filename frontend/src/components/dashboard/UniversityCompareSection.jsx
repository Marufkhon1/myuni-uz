import { useEffect, useMemo, useState } from "react";
import UniversityAvatar from "../UniversityAvatar.jsx";
import UniversityIdentity from "../UniversityIdentity.jsx";
import StarRatingDisplay, { FractionalStars } from "../ui/StarRatingDisplay.jsx";
import { CompareResultsSkeleton } from "../skeletons/DashboardSkeletons.jsx";
import { useToast } from "../../hooks/useToast.js";
import { addFavoriteUniversity, removeFavoriteUniversity } from "../../services/favoriteService.js";
import { getUniversityCompare } from "../../services/universityService.js";
import { formatStarRatingLabel } from "../../utils/starRatingA11y.js";
import { formatUniversityMetaHeader } from "../../utils/universityMetaFormat.js";
import { matchUniversityByText } from "../../utils/universityMatch.js";
import { getUniversityImageUrl } from "../../utils/universityImage.js";
import {
  COMPARE_ASPECTS,
  COMPARE_METRICS,
  getCompareContent,
} from "../../utils/compareRoleContent.js";
import { getApiErrorMessage } from "../../utils/apiErrors.js";

function mergeCompareUniversity(catalogUniversity, compareUniversities) {
  if (!catalogUniversity) {
    return null;
  }
  const enriched = compareUniversities?.find((item) => String(item.id) === String(catalogUniversity.id));
  return enriched ? { ...catalogUniversity, ...enriched } : catalogUniversity;
}

function filterUniversities(universities, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return universities;
  }
  return universities.filter(
    (university) =>
      university.name.toLowerCase().includes(normalized) ||
      university.short_name?.toLowerCase().includes(normalized) ||
      university.location?.toLowerCase().includes(normalized)
  );
}

function numericWinner(left, right) {
  const leftNum = left == null || left === "" ? Number.NaN : Number(left);
  const rightNum = right == null || right === "" ? Number.NaN : Number(right);
  if (Number.isNaN(leftNum) || Number.isNaN(rightNum) || leftNum === rightNum) {
    return null;
  }
  return leftNum > rightNum ? "left" : "right";
}

function orderCompareUniversities(universities, firstId, secondId) {
  if (!Array.isArray(universities) || universities.length !== 2) {
    return universities ?? [];
  }
  const first = universities.find((item) => String(item.id) === String(firstId));
  const second = universities.find((item) => String(item.id) === String(secondId));
  if (first && second) {
    return [first, second];
  }
  return universities;
}

function hasAspectComparison(left, right) {
  if (left.aspect_averages?.review_count > 0 || right.aspect_averages?.review_count > 0) {
    return true;
  }
  return COMPARE_ASPECTS.some(
    (aspect) =>
      left.aspect_averages?.[aspect.key] != null || right.aspect_averages?.[aspect.key] != null
  );
}

function computeWinCounts(left, right) {
  const counts = { left: 0, right: 0 };
  const bump = (winner) => {
    if (winner === "left") counts.left += 1;
    if (winner === "right") counts.right += 1;
  };

  COMPARE_METRICS.forEach((metric) => bump(numericWinner(left[metric.key], right[metric.key])));
  COMPARE_ASPECTS.forEach((aspect) => {
    bump(numericWinner(left.aspect_averages?.[aspect.key], right.aspect_averages?.[aspect.key]));
  });

  return counts;
}

function CompareSearchInput({ value, onChange, placeholder = "Universitet qidiring..." }) {
  return (
    <label className="flex h-10 items-center gap-2.5 rounded-xl bg-slate-100/80 px-3.5 ring-1 ring-slate-200/60 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/30 dark:bg-white/[0.06] dark:ring-white/10">
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3-3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
      />
    </label>
  );
}

function StarRatingSticker({ rating, size = "md" }) {
  if (rating == null || Number.isNaN(Number(rating))) {
    return <span className="text-base font-black text-slate-300 dark:text-slate-600">—</span>;
  }

  const pillClass = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const starClass = size === "sm" ? "text-xs" : "text-sm";
  const numericClass =
    "text-[11px] font-black tabular-nums text-amber-700 dark:text-amber-300";

  return (
    <StarRatingDisplay
      rating={rating}
      variant="pill"
      className={pillClass}
      starClassName={starClass}
      numericClassName={numericClass}
    />
  );
}

function CompareMetricValue({ value, metricKey, format }) {
  if (metricKey === "average_rating") {
    return <StarRatingSticker rating={value} size="sm" />;
  }
  return <span className="text-base font-black sm:text-lg">{format(value)}</span>;
}

function CompareAspectValue({ value }) {
  if (value == null) {
    return <span className="text-base font-black text-slate-300 dark:text-slate-600">—</span>;
  }
  return <StarRatingSticker rating={value} size="sm" />;
}

function WinnerMark({ show }) {
  if (!show) {
    return null;
  }
  return (
    <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white" aria-hidden="true">
      ✓
    </span>
  );
}

/** Niche / Versus — split VS stage */
function CompareVsStage({ left, right, onSwap, canSwap }) {
  return (
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-slate-200/70 dark:ring-white/10">
      <div className="grid min-h-[9.5rem] sm:grid-cols-2">
        <CompareVsSide university={left} placeholder="A" tint="blue" align="left" />
        <CompareVsSide university={right} placeholder="B" tint="violet" align="right" />
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-white/20 sm:block" />

      <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-xs font-black text-slate-900 shadow-lg ring-4 ring-slate-100 dark:bg-slate-900 dark:text-white dark:ring-[#0b1220]">
          VS
        </span>
        {canSwap && onSwap && (
          <button
            type="button"
            onClick={onSwap}
            className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/95 text-sm shadow-md ring-1 ring-slate-200/80 transition hover:bg-primary hover:text-white dark:bg-slate-800 dark:ring-white/10"
            title="Almashtirish"
            aria-label="Universitetlarni almashtirish"
          >
            ⇄
          </button>
        )}
      </div>
    </div>
  );
}

function CompareVsSide({ university, placeholder, tint, align }) {
  const imageUrl = university ? getUniversityImageUrl(university) : null;
  const gradient =
    tint === "violet"
      ? "from-violet-950/95 via-violet-900/80 to-violet-800/70"
      : "from-slate-950/95 via-[#0f2744]/90 to-primary/80";

  if (!university) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100/80 px-4 py-8 dark:bg-white/[0.04] ${align === "right" ? "sm:border-l sm:border-white/10" : ""}`}>
        <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-dashed border-slate-300 text-xl font-black text-slate-300 dark:border-white/15 dark:text-slate-600">
          {placeholder}
        </span>
        <p className="mt-2 text-xs font-semibold text-slate-400">Tanlang</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${align === "right" ? "sm:border-l sm:border-white/10" : ""}`}>
      {imageUrl && (
        <img src={imageUrl} alt="" role="presentation" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      )}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className={`relative flex h-full flex-col px-4 py-4 sm:px-5 sm:py-5 ${align === "right" ? "items-end text-right" : "items-start text-left"}`}>
        <UniversityIdentity university={university} size="md" />
        <p className="mt-3 max-w-[12rem] truncate text-sm font-black text-white sm:max-w-none sm:text-base">
          {university.short_name || university.name}
        </p>
        {university.location && (
          <p className="mt-0.5 text-xs text-slate-300">{university.location}</p>
        )}
        <div className={`mt-auto flex w-full items-end gap-3 pt-4 ${align === "right" ? "flex-row-reverse" : ""}`}>
          {university.average_rating != null ? (
            <>
              <div>
                <p className="text-3xl font-black tabular-nums leading-none text-white">
                  {Number(university.average_rating).toFixed(1).replace(/\.0$/, "")}
                </p>
                <p className="text-[10px] font-medium text-blue-200/80">/ 5</p>
              </div>
              <div className={align === "right" ? "text-left" : "text-right"}>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 shadow-sm ring-1 ring-white/20"
                  role="img"
                  aria-label={formatStarRatingLabel(university.average_rating)}
                >
                  <FractionalStars
                    rating={university.average_rating}
                    starClassName="text-sm"
                    emptyStarClassName="text-amber-200"
                  />
                  <span className="text-[11px] font-black tabular-nums text-slate-700">
                    {university.average_rating}/5
                  </span>
                </span>
                <p className="mt-1 text-[11px] font-bold text-slate-300">{university.review_count ?? 0} sharh</p>
              </div>
            </>
          ) : (
            <p className="text-sm font-semibold text-slate-300">Hali sharh yo&apos;q</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ComparePickerPanel({
  title,
  accent,
  selectedUniversity,
  universities,
  disabledIds = [],
  search,
  onSearchChange,
  onSelect,
  onClear,
  onUseMyUniversity,
  myUniversityLabel,
}) {
  const disabledSet = new Set(disabledIds.map(String));
  const list = filterUniversities(
    universities.filter((university) => !disabledSet.has(String(university.id))),
    search
  );

  const accentBar = accent === "violet" ? "bg-violet-500" : "bg-primary";

  return (
    <div className="flex min-h-[13rem] flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 dark:bg-white/[0.03] dark:ring-white/10">
      <div className={`h-1 ${accentBar}`} />
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-white/10">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{title}</p>
        {selectedUniversity && (
          <button
            type="button"
            onClick={onClear}
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 ring-1 ring-slate-200/80 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-200 dark:ring-white/10 dark:hover:bg-red-500/10"
            aria-label="Tanlovni bekor qilish"
            title="Bekor qilish"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        {selectedUniversity ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex items-start gap-3">
              <UniversityIdentity university={selectedUniversity} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-black text-slate-900 dark:text-white">
                  {selectedUniversity.name}
                </p>
                {selectedUniversity.short_name && selectedUniversity.short_name !== selectedUniversity.name && (
                  <p className="mt-0.5 text-xs font-bold text-primary">{selectedUniversity.short_name}</p>
                )}
                {selectedUniversity.location && (
                  <p className="mt-1 text-xs text-slate-500">{selectedUniversity.location}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StarRatingSticker rating={selectedUniversity.average_rating} size="sm" />
                  {selectedUniversity.review_count != null && (
                    <span className="text-[11px] font-semibold text-slate-500">
                      {selectedUniversity.review_count} sharh
                    </span>
                  )}
                </div>
              </div>
            </div>
            {formatUniversityMetaHeader(selectedUniversity) && (
              <p className="text-[11px] font-semibold text-slate-500">
                {formatUniversityMetaHeader(selectedUniversity)}
              </p>
            )}
            {(selectedUniversity.summary || selectedUniversity.description) && (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {selectedUniversity.summary || selectedUniversity.description}
              </p>
            )}
          </div>
        ) : (
          <>
            {onUseMyUniversity && (
              <button
                type="button"
                onClick={onUseMyUniversity}
                className="mb-3 w-full rounded-xl bg-primary/10 px-3 py-2.5 text-xs font-black text-primary ring-1 ring-primary/20 transition hover:bg-primary/15 dark:bg-primary/15"
              >
                {myUniversityLabel}
              </button>
            )}
            <CompareSearchInput value={search} onChange={onSearchChange} />
            <div className="chat-messages-scroll mt-3 min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain">
              {list.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">Topilmadi</p>
              ) : (
                list.map((university) => (
                  <button
                    key={university.id}
                    type="button"
                    onClick={() => onSelect(university.id)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                  >
                    <UniversityAvatar university={university} size="sm" />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">
                        {university.short_name || university.name}
                      </span>
                      {university.average_rating != null && (
                        <span className="text-[11px] font-semibold text-primary">
                          {university.average_rating}/5 · {university.review_count ?? 0} sharh
                        </span>
                      )}
                    </div>
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

/** US News / Niche — markaziy metrika, yonma-yon qiymatlar */
function HeadToHeadRow({ label, leftValue, rightValue, format = (v) => v, icon = null, metricKey = null, isAspect = false }) {
  const winner = numericWinner(leftValue, rightValue);

  return (
    <div className="grid grid-cols-[1fr_minmax(0,7.5rem)_1fr] items-center gap-2 border-b border-slate-100 py-3.5 last:border-0 dark:border-white/10 sm:gap-4">
      <div className={`flex items-center justify-end gap-1 ${winner === "left" ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
        {isAspect ? (
          <CompareAspectValue value={leftValue} />
        ) : (
          <CompareMetricValue value={leftValue} metricKey={metricKey} format={format} />
        )}
        <WinnerMark show={winner === "left"} />
      </div>

      <div className="text-center">
        {icon && <span className="mr-0.5 text-sm" aria-hidden="true">{icon}</span>}
        <p className="text-[10px] font-bold uppercase leading-tight tracking-wide text-slate-400">{label}</p>
      </div>

      <div className={`flex items-center gap-1 ${winner === "right" ? "justify-end text-emerald-600 dark:text-emerald-400" : "justify-end"}`}>
        <WinnerMark show={winner === "right"} />
        {isAspect ? (
          <CompareAspectValue value={rightValue} />
        ) : (
          <CompareMetricValue value={rightValue} metricKey={metricKey} format={format} />
        )}
      </div>
    </div>
  );
}

function CompareVerdictBanner({ left, right, winCounts, content }) {
  const leader =
    winCounts.left > winCounts.right ? left : winCounts.right > winCounts.left ? right : null;
  const leaderWins = Math.max(winCounts.left, winCounts.right);
  const leftPct =
    winCounts.left + winCounts.right > 0
      ? Math.round((winCounts.left / (winCounts.left + winCounts.right)) * 100)
      : 50;

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0f2744] to-primary/90 text-white ring-1 ring-white/10">
      <div className="px-5 py-4 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300/90">{content.verdictTitle}</p>
        <p className="mt-1 text-lg font-black sm:text-xl">
          {leader ? (
            <>
              {leader.short_name || leader.name}
              <span className="ml-2 font-semibold text-blue-200">— {leaderWins} ustunlik</span>
            </>
          ) : (
            "Natijalar teng"
          )}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <span className="w-16 truncate text-xs font-bold text-blue-100">{left.short_name}</span>
          <div className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-400 to-primary transition-all duration-700"
              style={{ width: `${leftPct}%` }}
            />
          </div>
          <span className="w-16 truncate text-right text-xs font-bold text-violet-200">{right.short_name}</span>
        </div>

        <div className="mt-2 flex justify-between text-[11px] font-bold tabular-nums text-slate-300">
          <span>{winCounts.left} g'alaba</span>
          <span>{winCounts.right} g'alaba</span>
        </div>
      </div>
    </div>
  );
}

function RatingDistribution({ distribution, reviewCount }) {
  const total = reviewCount || 0;
  return (
    <div className="space-y-1">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution?.[String(star)] ?? 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-[11px]">
            <span className="w-3 font-bold text-amber-500">{star}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${percent}%` }} />
            </div>
            <span className="w-6 text-right tabular-nums text-slate-400">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function CompareReviewBlock({ sampleReview, reviewCount = 0 }) {
  const hasReview = Boolean(sampleReview?.text);
  return (
    <div className="flex flex-col p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Eng ko&apos;p yoqtirilgan sharh</p>
      <div className="mt-2 min-h-[6.75rem]">
        {hasReview ? (
          <blockquote className="rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white p-3.5 dark:border-amber-400/15 dark:from-amber-400/5 dark:to-transparent">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{sampleReview.author}</p>
              <div className="flex items-center gap-2">
                <StarRatingSticker rating={sampleReview.rating} size="sm" />
                {(sampleReview.like_count ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-rose-600 ring-1 ring-rose-200/80 dark:bg-white/10 dark:text-rose-300">
                    ❤ {sampleReview.like_count}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              &ldquo;{sampleReview.text}&rdquo;
            </p>
          </blockquote>
        ) : (
          <div className="relative min-h-[6.75rem]">
            <div className="space-y-1 opacity-0 pointer-events-none" aria-hidden="true">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-[11px]">
                  <span className="w-3 font-bold">{star}</span>
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100" />
                  <span className="w-6 text-right">0</span>
                </div>
              ))}
            </div>
            <p className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-400 dark:text-slate-500">
              {reviewCount > 0 ? "Sharh mavjud" : "Sharh yo&apos;q"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CompareRatingBlock({ distribution, reviewCount }) {
  return (
    <div className="flex flex-col p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Baholar taqsimoti</p>
      <div className="mt-2 min-h-[6.75rem]">
        <RatingDistribution distribution={distribution} reviewCount={reviewCount} />
      </div>
    </div>
  );
}

function CompareActionButtons({ university, onToggleFavorite, onViewReviews, favoriteBusyId, tint = "blue" }) {
  const accentRing = tint === "violet" ? "hover:ring-violet-300" : "hover:ring-primary/40";

  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
      <button
        type="button"
        disabled={String(favoriteBusyId) === String(university.id)}
        onClick={() => onToggleFavorite(university)}
        className={`inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-800 ring-1 ring-slate-200/80 transition hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50 dark:bg-white/[0.04] dark:text-white dark:ring-white/10 ${accentRing}`}
      >
        <span
          className={`grid h-6 w-6 place-items-center rounded-lg text-sm shadow-sm ${
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
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-white/15 text-[11px]" aria-hidden="true">
            💬
          </span>
          Sharhlarni ko&apos;rish
        </button>
      )}
    </div>
  );
}

function CompareUniversityDetail({ university, tint, onToggleFavorite, onViewReviews, favoriteBusyId }) {
  const borderAccent = tint === "violet" ? "border-violet-200/80 dark:border-violet-400/20" : "border-blue-200/80 dark:border-blue-400/20";
  const description = university.summary || university.description;
  const metaHeader = formatUniversityMetaHeader(university);

  const infoRows = [
    { label: "Turi", value: university.institution_type },
    { label: "Mulkchilik", value: university.ownership_type },
    { label: "Asos solingan", value: university.founded_year },
    { label: "Sharhlar", value: university.review_count != null ? `${university.review_count} ta` : null },
    { label: "Chat a'zolari", value: university.member_count != null ? `${university.member_count} ta` : null },
    { label: "Shahar", value: university.city && university.city !== university.location ? university.city : null },
  ].filter((item) => item.value);

  return (
    <article className={`flex flex-col overflow-hidden rounded-2xl border-2 bg-white dark:bg-white/[0.03] ${borderAccent}`}>
      <CompareActionButtons
        university={university}
        tint={tint}
        onToggleFavorite={onToggleFavorite}
        onViewReviews={onViewReviews}
        favoriteBusyId={favoriteBusyId}
      />

      <div className="border-b border-slate-100 p-4 dark:border-white/10">
        <div className="flex items-start gap-3">
          <UniversityIdentity university={university} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-slate-950 dark:text-white">{university.name}</h3>
            {university.short_name && university.short_name !== university.name && (
              <p className="mt-0.5 text-xs font-bold text-primary">{university.short_name}</p>
            )}
            {university.location && (
              <p className="mt-1 text-xs text-slate-500">{university.location}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StarRatingSticker rating={university.average_rating} />
              {university.is_joined && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                  Chatda
                </span>
              )}
            </div>
          </div>
        </div>
        {metaHeader && (
          <p className="mt-3 text-[11px] font-semibold text-slate-500">{metaHeader}</p>
        )}
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
        )}
      </div>

      {infoRows.length > 0 && (
        <dl className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-b border-slate-100 dark:divide-white/10 dark:border-white/10">
          {infoRows.map((item) => (
            <div key={item.label} className="px-3 py-2.5">
              <dt className="text-[10px] font-bold uppercase text-slate-400">{item.label}</dt>
              <dd className="mt-0.5 text-sm font-bold text-slate-800 dark:text-white">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="grid border-t border-slate-100 dark:border-white/10 max-sm:divide-y max-sm:divide-slate-100 dark:max-sm:divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-slate-100 dark:sm:divide-white/10">
        <CompareReviewBlock sampleReview={university.sample_review} reviewCount={university.review_count} />
        <CompareRatingBlock
          distribution={university.rating_distribution}
          reviewCount={university.review_count}
        />
      </div>
    </article>
  );
}

function CompareLoadError({ onRetry }) {
  return (
    <div
      className="rounded-2xl border border-red-200/80 bg-red-50/60 px-5 py-4 text-center dark:border-red-400/20 dark:bg-red-500/10"
      role="alert"
    >
      <p className="text-sm font-semibold text-red-800 dark:text-red-200">
        Taqqoslash ma&apos;lumotini yuklab bo&apos;lmadi.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-xl bg-white px-4 py-2 text-xs font-black text-red-700 ring-1 ring-red-200/80 transition hover:bg-red-100 dark:bg-white/10 dark:text-red-200"
      >
        Qayta urinish
      </button>
    </div>
  );
}

function CompareResultsPanel({ data, content, firstId, secondId, onToggleFavorite, onViewReviews, favoriteBusyId }) {
  const ordered = orderCompareUniversities(data.universities ?? [], firstId, secondId);
  if (ordered.length !== 2) {
    return null;
  }

  const [left, right] = ordered;
  const winCounts = computeWinCounts(left, right);
  const showAspects = hasAspectComparison(left, right);

  return (
    <div className="space-y-4 animate-[hero-fade-up_0.3s_ease-out_forwards] motion-reduce:animate-none" aria-live="polite">
      <CompareVerdictBanner left={left} right={right} winCounts={winCounts} content={content} />

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 dark:bg-white/[0.03] dark:ring-white/10">
        <div className="grid grid-cols-[1fr_minmax(0,7.5rem)_1fr] gap-2 border-b border-slate-100 px-4 py-3 dark:border-white/10 sm:gap-4 sm:px-5">
          <p className="truncate text-right text-xs font-black text-primary">{left.short_name}</p>
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">{content.metricsTitle}</p>
          <p className="truncate text-xs font-black text-violet-600 dark:text-violet-300">{right.short_name}</p>
        </div>
        <div className="px-4 sm:px-5">
          {COMPARE_METRICS.map((metric) => (
            <HeadToHeadRow
              key={metric.key}
              label={metric.label}
              leftValue={left[metric.key]}
              rightValue={right[metric.key]}
              format={metric.format}
              metricKey={metric.key}
            />
          ))}
        </div>
      </div>

      {showAspects && (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 dark:bg-white/[0.03] dark:ring-white/10">
          <div className="border-b border-slate-100 px-5 py-3 dark:border-white/10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{content.aspectsTitle}</p>
          </div>
          <div className="px-4 sm:px-5">
            {COMPARE_ASPECTS.map((aspect) => (
              <HeadToHeadRow
                key={aspect.key}
                label={aspect.label}
                icon={aspect.icon}
                leftValue={left.aspect_averages?.[aspect.key]}
                rightValue={right.aspect_averages?.[aspect.key]}
                isAspect
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{content.detailsTitle}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <CompareUniversityDetail
            university={left}
            tint="blue"
            onToggleFavorite={onToggleFavorite}
            onViewReviews={onViewReviews}
            favoriteBusyId={favoriteBusyId}
          />
          <CompareUniversityDetail
            university={right}
            tint="violet"
            onToggleFavorite={onToggleFavorite}
            onViewReviews={onViewReviews}
            favoriteBusyId={favoriteBusyId}
          />
        </div>
      </div>
    </div>
  );
}

export default function UniversityCompareSection({
  universities,
  userUniversity = "",
  isStudent = false,
  onViewReviews,
  prefillPair = null,
  onPrefillConsumed,
}) {
  const content = getCompareContent(isStudent);
  const toast = useToast();
  const [firstId, setFirstId] = useState("");
  const [secondId, setSecondId] = useState("");
  const [firstSearch, setFirstSearch] = useState("");
  const [secondSearch, setSecondSearch] = useState("");
  const [compareData, setCompareData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [compareError, setCompareError] = useState(false);
  const [resolvedKey, setResolvedKey] = useState("");
  const [favoriteBusyId, setFavoriteBusyId] = useState(null);

  useEffect(() => {
    if (!prefillPair?.anchorId || !prefillPair?.otherId) {
      return;
    }
    setFirstId(String(prefillPair.anchorId));
    setSecondId(String(prefillPair.otherId));
    setFirstSearch("");
    setSecondSearch("");
    onPrefillConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillPair?.anchorId, prefillPair?.otherId]);

  const myUniversity = useMemo(
    () => matchUniversityByText(universities, userUniversity),
    [universities, userUniversity]
  );

  const canCompare = Boolean(firstId && secondId && firstId !== secondId);
  const selectionKey = canCompare ? `${firstId}|${secondId}` : "";
  const firstUniversity = mergeCompareUniversity(
    universities.find((item) => String(item.id) === firstId),
    compareData?.universities
  );
  const secondUniversity = mergeCompareUniversity(
    universities.find((item) => String(item.id) === secondId),
    compareData?.universities
  );

  useEffect(() => {
    if (!canCompare) {
      setCompareData(null);
      setResolvedKey("");
      setCompareError(false);
      return undefined;
    }

    let isMounted = true;
    const requestKey = `${firstId}|${secondId}`;

    async function loadCompare() {
      setIsLoading(true);
      setCompareError(false);
      try {
        const data = await getUniversityCompare([firstId, secondId]);
        if (isMounted) {
          setCompareData(data);
          setResolvedKey(requestKey);
        }
      } catch (requestError) {
        if (isMounted) {
          setCompareData(null);
          setResolvedKey("");
          setCompareError(true);
          toast.error(getApiErrorMessage(requestError, "Taqqoslash ma'lumotini yuklab bo'lmadi."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCompare();
    return () => {
      isMounted = false;
    };
  }, [firstId, secondId, canCompare, toast]);

  const quickCompareSuggestions = useMemo(() => {
    if (universities.length < 2) {
      return [];
    }

    const sorted = [...universities].sort((a, b) => (b.member_count ?? 0) - (a.member_count ?? 0));
    const top = sorted.slice(0, Math.min(10, sorted.length));
    const pairs = [];
    const usedKeys = new Set();
    const anchorUseCount = new Map();

    function pairKey(left, right) {
      return [String(left.id), String(right.id)].sort().join("-");
    }

    function addPair(anchor, other) {
      if (!anchor || !other || anchor.id === other.id) {
        return false;
      }
      const key = pairKey(anchor, other);
      if (usedKeys.has(key)) {
        return false;
      }
      usedKeys.add(key);
      pairs.push({ anchor, other });
      anchorUseCount.set(anchor.id, (anchorUseCount.get(anchor.id) ?? 0) + 1);
      return true;
    }

    if (myUniversity) {
      const partner = sorted.find((item) => item.id !== myUniversity.id);
      if (partner) {
        addPair(myUniversity, partner);
      }
    }

    const candidates = [];
    for (let i = 0; i < top.length; i += 1) {
      for (let j = i + 1; j < top.length; j += 1) {
        candidates.push({
          anchor: top[i],
          other: top[j],
          weight: (top[i].member_count ?? 0) + (top[j].member_count ?? 0),
        });
      }
    }
    candidates.sort((left, right) => right.weight - left.weight);

    for (const candidate of candidates) {
      if (pairs.length >= 5) {
        break;
      }
      if ((anchorUseCount.get(candidate.anchor.id) ?? 0) >= 1) {
        continue;
      }
      addPair(candidate.anchor, candidate.other);
    }

    for (const candidate of candidates) {
      if (pairs.length >= 5) {
        break;
      }
      addPair(candidate.anchor, candidate.other);
    }

    return pairs.slice(0, 5);
  }, [universities, myUniversity]);

  function clearSelection() {
    setFirstId("");
    setSecondId("");
    setFirstSearch("");
    setSecondSearch("");
    setCompareData(null);
    setResolvedKey("");
    setCompareError(false);
  }

  function swapUniversities() {
    setFirstId(secondId);
    setSecondId(firstId);
  }

  function applyMyUniversity(slot) {
    if (!myUniversity) {
      return;
    }
    const id = String(myUniversity.id);
    if (slot === "first" && id !== secondId) {
      setFirstId(id);
    } else if (slot === "second" && id !== firstId) {
      setSecondId(id);
    }
  }

  const profileUniversityId = myUniversity ? String(myUniversity.id) : "";
  const resultsReady = resolvedKey === selectionKey && compareData?.universities?.length === 2;
  const showSkeleton = isLoading && !resultsReady;
  const showResults = resultsReady;
  const showLoadError = canCompare && !isLoading && compareError;

  async function reloadCompare() {
    if (!canCompare) {
      return;
    }
    setIsLoading(true);
    setCompareError(false);
    try {
      const data = await getUniversityCompare([firstId, secondId]);
      setCompareData(data);
      setResolvedKey(`${firstId}|${secondId}`);
    } catch (requestError) {
      setCompareData(null);
      setResolvedKey("");
      setCompareError(true);
      toast.error(getApiErrorMessage(requestError, "Taqqoslash ma'lumotini yuklab bo'lmadi."));
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleFavorite(university) {
    setFavoriteBusyId(university.id);
    try {
      if (university.is_favorited) {
        await removeFavoriteUniversity(university.id);
      } else {
        await addFavoriteUniversity(university.id);
      }
      setCompareData((current) => {
        if (!current?.universities) {
          return current;
        }
        return {
          ...current,
          universities: current.universities.map((item) =>
            item.id === university.id ? { ...item, is_favorited: !item.is_favorited } : item
          ),
        };
      });
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Sevimlilar yangilanmadi."));
    } finally {
      setFavoriteBusyId(null);
    }
  }

  return (
    <section className="w-full min-w-0 space-y-5">
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 dark:bg-[#0b1220]/80 dark:ring-white/10">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-5 py-4 dark:border-white/10 dark:from-white/[0.03] dark:to-transparent sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{content.eyebrow}</p>
              <h2 className="mt-0.5 text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{content.title}</h2>
              <p className="mt-1 max-w-lg text-sm text-slate-500 dark:text-slate-400">{content.subtitle}</p>
            </div>
            {(firstId || secondId) && (
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-xl px-3 py-2 text-xs font-bold text-slate-500 ring-1 ring-slate-200/80 transition hover:text-red-600 hover:ring-red-200 dark:ring-white/10"
              >
                Barchasini tozalash
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <CompareVsStage
            left={firstUniversity}
            right={secondUniversity}
            onSwap={swapUniversities}
            canSwap={canCompare}
          />

          {!canCompare && quickCompareSuggestions.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{content.quickPickLabel}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {quickCompareSuggestions.map(({ anchor, other }) => {
                  const isActive =
                    (firstId === String(anchor.id) && secondId === String(other.id)) ||
                    (firstId === String(other.id) && secondId === String(anchor.id));

                  return (
                    <button
                      key={`${anchor.id}-${other.id}`}
                      type="button"
                      onClick={() => {
                        setFirstId(String(anchor.id));
                        setSecondId(String(other.id));
                      }}
                      className={`inline-flex max-w-full items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition ${
                        isActive
                          ? "bg-primary/5 text-primary ring-2 ring-primary/35 dark:bg-primary/10"
                          : "bg-slate-50 text-slate-700 ring-1 ring-slate-200/70 hover:ring-primary/25 dark:bg-white/[0.04] dark:text-slate-200 dark:ring-white/10"
                      }`}
                    >
                      <UniversityAvatar university={anchor} size="2xs" />
                      <span className="max-w-[5.5rem] truncate">{anchor.short_name}</span>
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-wide text-slate-300">
                        vs
                      </span>
                      <UniversityAvatar university={other} size="2xs" />
                      <span className="max-w-[5.5rem] truncate">{other.short_name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!canCompare && (
            <p className="text-center text-xs text-slate-500">{content.emptyHint}</p>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <ComparePickerPanel
              title={content.slotA}
              accent="blue"
              selectedUniversity={firstUniversity}
              universities={universities}
              disabledIds={secondId ? [secondId] : []}
              search={firstSearch}
              onSearchChange={setFirstSearch}
              onSelect={(id) => setFirstId(String(id))}
              onClear={() => setFirstId("")}
              onUseMyUniversity={
                myUniversity && secondId !== profileUniversityId ? () => applyMyUniversity("first") : null
              }
              myUniversityLabel={content.myUniversityLabel}
            />
            <ComparePickerPanel
              title={content.slotB}
              accent="violet"
              selectedUniversity={secondUniversity}
              universities={universities}
              disabledIds={firstId ? [firstId] : []}
              search={secondSearch}
              onSearchChange={setSecondSearch}
              onSelect={(id) => setSecondId(String(id))}
              onClear={() => setSecondId("")}
              onUseMyUniversity={
                myUniversity && firstId !== profileUniversityId ? () => applyMyUniversity("second") : null
              }
              myUniversityLabel={content.myUniversityLabel}
            />
          </div>
        </div>
      </div>

      {showSkeleton && <CompareResultsSkeleton />}

      {showLoadError && <CompareLoadError onRetry={reloadCompare} />}

      {showResults && (
        <CompareResultsPanel
          data={compareData}
          content={content}
          firstId={firstId}
          secondId={secondId}
          onToggleFavorite={toggleFavorite}
          onViewReviews={onViewReviews}
          favoriteBusyId={favoriteBusyId}
        />
      )}
    </section>
  );
}
