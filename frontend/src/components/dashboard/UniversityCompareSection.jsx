import { useEffect, useMemo, useState } from "react";
import UniversityAvatar from "../UniversityAvatar.jsx";
import UniversityRatingStars from "./UniversityRatingStars.jsx";
import { formatUniversityPreview } from "../UniversityMetaLine.jsx";
import { matchUniversityByText } from "./UniversitySearchSelect.jsx";
import { addFavoriteUniversity, removeFavoriteUniversity } from "../../services/favoriteService.js";
import { getUniversityCompare } from "../../services/universityService.js";
import { getApiErrorMessage } from "../../utils/apiErrors.js";

const METRIC_ROWS = [
  { key: "average_rating", label: "Reyting", format: (value) => (value != null ? `${value}/5` : "—") },
  { key: "review_count", label: "Sharhlar", format: (value) => `${value ?? 0}` },
  { key: "member_count", label: "Chat", format: (value) => `${value ?? 0}` },
  { key: "location", label: "Joy", format: (value) => value || "—" },
  { key: "founded_year", label: "Yil", format: (value) => (value ? `${value}` : "—") },
  { key: "institution_type", label: "Turi", format: (value) => value || "—" },
];

const HIGHLIGHT_LABELS = {
  rating: "Reyting",
  reviews: "Sharhlar",
  chat_activity: "Chat",
};

const SUMMARY_METRICS = {
  rating: { field: "average_rating", format: (value) => (value != null ? `${value}/5` : "—") },
  reviews: { field: "review_count", format: (value) => `${value ?? 0}` },
  chat_activity: { field: "member_count", format: (value) => `${value ?? 0}` },
};

const sectionLabelClass = "text-sm font-black uppercase tracking-[0.18em] text-primary";

const compareSearchInputClass =
  "mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-400/25";

function formatSummaryMetric(metricKey, universities, highlight) {
  const { field, format } = SUMMARY_METRICS[metricKey];
  const values = universities.map((university) => university?.[field]);

  if (values.every((value) => value == null)) {
    return { main: "—", sub: null };
  }

  if (highlight?.value != null) {
    return {
      main: format(highlight.value),
      sub: highlight.short_name,
    };
  }

  const formatted = values.map((value) => format(value));
  if (formatted[0] === formatted[1]) {
    return { main: formatted[0], sub: "Teng" };
  }

  return { main: formatted.join(" · "), sub: null };
}

function WinnerPill({ label, metricKey, highlight, universities }) {
  const { main, sub } = formatSummaryMetric(metricKey, universities, highlight);

  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-3 py-3 text-center dark:border-white/10 dark:bg-white/[0.04]">
      <p className={sectionLabelClass}>{label}</p>
      <p className="mt-1 truncate text-sm font-black text-slate-900 dark:text-white sm:text-base">{main}</p>
      {sub && (
        <p className="mt-0.5 truncate text-xs font-bold text-primary">{sub}</p>
      )}
    </div>
  );
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

function RatingDistribution({ distribution, reviewCount }) {
  const total = reviewCount || 0;
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution?.[String(star)] ?? 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-3 font-black text-amber-500">{star}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${percent}%` }} />
            </div>
            <span className="w-8 text-right font-semibold tabular-nums text-slate-500">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function CompareSlot({ university, placeholder }) {
  if (university) {
    return (
      <div className="flex min-w-0 flex-col items-center gap-1">
        <UniversityAvatar university={university} size="sm" />
        <p className="max-w-[5.5rem] truncate text-[10px] font-black text-slate-800 dark:text-white">
          {university.short_name || university.name}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-dashed border-slate-200 text-xs font-black text-slate-400 dark:border-white/15">
        {placeholder}
      </div>
      <p className="text-[10px] font-semibold text-slate-400">Tanlang</p>
    </div>
  );
}

function ComparePickerCompact({
  title,
  selectedUniversity,
  universities,
  disabledId,
  isActiveId,
  search,
  onSearchChange,
  onSelect,
  onClear,
  onUseMyUniversity,
  myUniversityLabel,
}) {
  const list = filterUniversities(
    universities.filter((university) => String(university.id) !== disabledId),
    search
  );

  return (
    <div className="flex min-w-0 flex-col rounded-[2rem] border border-slate-200 bg-white p-3.5 shadow-soft sm:p-4 dark:border-white/10 dark:bg-white/[0.06]">
      <div className="flex items-center justify-between gap-2">
        <p className={sectionLabelClass}>{title}</p>
        {selectedUniversity && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-black text-slate-500 hover:text-primary"
          >
            O&apos;chirish
          </button>
        )}
      </div>

      {selectedUniversity ? (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/20 bg-blue-50/50 px-3 py-3 dark:border-primary/30 dark:bg-blue-400/10">
          <UniversityAvatar university={selectedUniversity} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-slate-900 dark:text-white">
              {selectedUniversity.short_name || selectedUniversity.name}
            </p>
            {(formatUniversityPreview(selectedUniversity) || selectedUniversity.location) && (
              <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-slate-500 dark:text-slate-400">
                {formatUniversityPreview(selectedUniversity)?.slice(0, 120) ||
                  selectedUniversity.location}
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          {onUseMyUniversity && (
            <button
              type="button"
              onClick={onUseMyUniversity}
              className="mt-3 w-full rounded-2xl border border-violet-200/80 bg-violet-50/80 px-4 py-3 text-sm font-black text-violet-800 transition hover:border-violet-300 dark:border-violet-400/25 dark:bg-violet-400/10 dark:text-violet-200"
            >
              {myUniversityLabel}
            </button>
          )}
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Universitet qidiring..."
            className={compareSearchInputClass}
          />
          <div className="mt-3 min-h-0 max-h-[min(22rem,calc(100dvh-20rem))] space-y-1 overflow-y-auto overscroll-contain pr-1">
            {list.length === 0 ? (
              <p className="px-2 py-4 text-sm font-semibold text-slate-500">Universitet topilmadi.</p>
            ) : (
              list.map((university) => {
                const isSelected = String(university.id) === isActiveId;
                const preview =
                  formatUniversityPreview(university)?.slice(0, 120) || university.location || "";
                return (
                  <button
                    key={university.id}
                    type="button"
                    onClick={() => onSelect(university.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-3 text-left transition-colors ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-400/10"
                        : "hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <UniversityAvatar university={university} size="sm" />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-slate-900 dark:text-white">
                        {university.short_name || university.name}
                      </span>
                      {preview && (
                        <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-slate-500 dark:text-slate-400">
                          {preview}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CompareResultsPanel({
  data,
  winnerForMetric,
  favoriteBusyId,
  onToggleFavorite,
  onViewReviews,
}) {
  const universities = data.universities ?? [];

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10 sm:px-6">
        <p className={sectionLabelClass}>Natija</p>
        <h3 className="mt-0.5 text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
          Taqqoslash xulosasi
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
          <WinnerPill
            label={HIGHLIGHT_LABELS.rating}
            metricKey="rating"
            highlight={data.highlights?.rating}
            universities={universities}
          />
          <WinnerPill
            label={HIGHLIGHT_LABELS.reviews}
            metricKey="reviews"
            highlight={data.highlights?.reviews}
            universities={universities}
          />
          <WinnerPill
            label={HIGHLIGHT_LABELS.chat_activity}
            metricKey="chat_activity"
            highlight={data.highlights?.chat_activity}
            universities={universities}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        {universities.map((university) => (
          <div
            key={university.id}
            className="border-b border-slate-100 p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 dark:border-white/10 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <UniversityAvatar university={university} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black leading-snug text-slate-950 dark:text-white sm:text-lg">
                  {university.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {university.location}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <UniversityRatingStars rating={university.average_rating} />
                  {university.is_joined && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                      Chatga qo&apos;shilgansiz
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={favoriteBusyId === university.id}
                onClick={() => onToggleFavorite(university)}
                className="inline-flex items-center rounded-full border border-slate-200 px-3.5 py-2 text-sm font-black transition hover:border-primary disabled:opacity-50 dark:border-white/10"
              >
                {university.is_favorited ? "★ Sevimlida" : "☆ Sevimliga"}
              </button>
              {onViewReviews && (
                <button
                  type="button"
                  onClick={() => onViewReviews(university.id)}
                  className="inline-flex items-center rounded-full bg-slate-950 px-3.5 py-2 text-sm font-black text-white transition hover:bg-primary dark:bg-white dark:text-slate-950"
                >
                  Sharhlarni ko&apos;rish
                </button>
              )}
            </div>

            {university.summary && (
              <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-200">
                {university.summary}
              </p>
            )}

            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className={sectionLabelClass}>Yulduz taqsimoti</p>
              <div className="mt-3">
                <RatingDistribution
                  distribution={university.rating_distribution}
                  reviewCount={university.review_count}
                />
              </div>
            </div>

            {university.sample_review && (
              <blockquote className="mt-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06] sm:p-5">
                <p className="text-xs font-black text-slate-500 dark:text-slate-400">
                  {university.sample_review.author} · {university.sample_review.rating}/5
                  {university.sample_review.like_count > 0 && (
                    <span className="text-primary"> · {university.sample_review.like_count} like</span>
                  )}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
                  {university.sample_review.text}
                </p>
              </blockquote>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-5 dark:border-white/10 sm:p-6">
        <p className={sectionLabelClass}>Batafsil jadval</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="py-3 pr-4 font-black text-slate-500">Ko&apos;rsatkich</th>
                {universities.map((university) => (
                  <th key={university.id} className="px-3 py-3 font-black text-slate-900 dark:text-white">
                    {university.short_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRIC_ROWS.map((row) => {
                const winnerId = winnerForMetric(row.key);
                return (
                  <tr key={row.key} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                    <td className="py-3 pr-4 font-semibold text-slate-600 dark:text-slate-300">{row.label}</td>
                    {universities.map((university) => {
                      const isWinner = winnerId === university.id;
                      return (
                        <td
                          key={university.id}
                          className={`px-3 py-3 font-black ${
                            isWinner ? "text-primary" : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {row.format(university[row.key])}
                          {isWinner && (
                            <span className="ml-2 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                              yuqori
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
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
}) {
  const [firstId, setFirstId] = useState("");
  const [secondId, setSecondId] = useState("");
  const [firstSearch, setFirstSearch] = useState("");
  const [secondSearch, setSecondSearch] = useState("");
  const [compareData, setCompareData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [favoriteBusyId, setFavoriteBusyId] = useState(null);

  const myUniversity = useMemo(
    () => matchUniversityByText(universities, userUniversity),
    [universities, userUniversity]
  );

  const canCompare = firstId && secondId && firstId !== secondId;

  useEffect(() => {
    if (!canCompare) {
      return undefined;
    }

    let isMounted = true;

    async function loadCompare() {
      setIsLoading(true);
      setError("");
      try {
        const data = await getUniversityCompare(firstId, secondId);
        if (isMounted) {
          setCompareData(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setCompareData(null);
          setError(getApiErrorMessage(requestError, "Taqqoslash ma'lumotini yuklab bo'lmadi."));
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
  }, [firstId, secondId, canCompare]);

  const activeCompareData = canCompare ? compareData : null;
  const hasResults = !isLoading && canCompare && activeCompareData?.universities?.length === 2;

  const firstUniversity = universities.find((item) => String(item.id) === firstId);
  const secondUniversity = universities.find((item) => String(item.id) === secondId);

  const quickCompareSuggestions = useMemo(() => {
    if (universities.length < 2) {
      return [];
    }
    const sorted = [...universities].sort(
      (left, right) => (right.member_count ?? 0) - (left.member_count ?? 0)
    );
    const pairs = [];
    const usedKeys = new Set();

    function addPair(anchor, other) {
      if (!anchor || !other || anchor.id === other.id) {
        return;
      }
      const key = [anchor.id, other.id].sort((a, b) => a - b).join("-");
      if (usedKeys.has(key)) {
        return;
      }
      usedKeys.add(key);
      pairs.push({ anchor, other });
    }

    if (myUniversity) {
      const partner = sorted.find((item) => item.id !== myUniversity.id);
      if (partner) {
        addPair(myUniversity, partner);
      }
    }

    for (let index = 0; index < sorted.length && pairs.length < 4; index += 1) {
      for (let otherIndex = index + 1; otherIndex < sorted.length && pairs.length < 4; otherIndex += 1) {
        addPair(sorted[index], sorted[otherIndex]);
      }
    }

    return pairs.slice(0, 4);
  }, [universities, myUniversity]);

  function clearSelection() {
    setFirstId("");
    setSecondId("");
    setFirstSearch("");
    setSecondSearch("");
    setCompareData(null);
    setError("");
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

  function applyQuickCompare(anchor, other) {
    setFirstId(String(anchor.id));
    setSecondId(String(other.id));
    setFirstSearch("");
    setSecondSearch("");
    setError("");
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
      setError(getApiErrorMessage(requestError, "Sevimlilar yangilanmadi."));
    } finally {
      setFavoriteBusyId(null);
    }
  }

  function winnerForMetric(key) {
    const items = activeCompareData?.universities ?? [];
    if (items.length !== 2) {
      return null;
    }
    const [left, right] = items;
    const leftValue = left[key];
    const rightValue = right[key];
    if (leftValue == null && rightValue == null) {
      return null;
    }
    if (typeof leftValue === "number" && typeof rightValue === "number") {
      if (leftValue === rightValue) {
        return null;
      }
      return leftValue > rightValue ? left.id : right.id;
    }
    return null;
  }

  const profileUniversityId = myUniversity ? String(myUniversity.id) : "";
  const isProfileInSecond = Boolean(profileUniversityId && secondId === profileUniversityId);
  const isProfileInFirst = Boolean(profileUniversityId && firstId === profileUniversityId);

  return (
    <section className="mx-auto w-full min-w-0 max-w-4xl space-y-4 sm:space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-3.5 shadow-soft sm:p-4 dark:border-white/10 dark:bg-white/[0.06]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className={sectionLabelClass}>Taqqoslash</p>
            <h2 className="mt-1.5 text-xl font-black leading-snug text-slate-950 dark:text-white">
              {isStudent ? "OTMlarni solishtiring" : "Qaysi OTM sizga mos?"}
            </h2>
          </div>
          {(firstId || secondId) && (
            <button
              type="button"
              onClick={clearSelection}
              className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-black text-slate-600 dark:border-white/15 dark:text-slate-300"
            >
              Tozalash
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-center gap-4 sm:gap-6">
          <CompareSlot university={firstUniversity} placeholder="1" />
          <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-black text-white dark:bg-white dark:text-slate-950">
            VS
          </span>
          <CompareSlot university={secondUniversity} placeholder="2" />
        </div>

        {!canCompare && quickCompareSuggestions.length > 0 && (
          <div className="mt-3 border-t border-slate-100 pt-3 dark:border-white/10">
            <p className={sectionLabelClass}>Tez tanlash</p>
            <div className="mt-1.5 -mx-1 flex gap-1.5 overflow-x-auto overscroll-x-contain px-1 pb-0.5">
              {quickCompareSuggestions.map(({ anchor, other }) => (
                <button
                  key={`${anchor.id}-${other.id}`}
                  type="button"
                  onClick={() => applyQuickCompare(anchor, other)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-700 transition hover:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                >
                  <span className="truncate max-w-[4.5rem]">{anchor.short_name || anchor.name}</span>
                  <span className="text-slate-400">vs</span>
                  <span className="truncate max-w-[4.5rem]">{other.short_name || other.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-2">
        <ComparePickerCompact
          title="1-chi universitet"
          selectedUniversity={firstUniversity}
          universities={universities}
          disabledId={secondId}
          isActiveId={firstId}
          search={firstSearch}
          onSearchChange={setFirstSearch}
          onSelect={(id) => setFirstId(String(id))}
          onClear={() => setFirstId("")}
          onUseMyUniversity={myUniversity && !isProfileInSecond ? () => applyMyUniversity("first") : null}
          myUniversityLabel={isStudent ? "Mening universitetim" : "Qiziqishim"}
        />
        <ComparePickerCompact
          title="2-chi universitet"
          selectedUniversity={secondUniversity}
          universities={universities}
          disabledId={firstId}
          isActiveId={secondId}
          search={secondSearch}
          onSearchChange={setSecondSearch}
          onSelect={(id) => setSecondId(String(id))}
          onClear={() => setSecondId("")}
          onUseMyUniversity={myUniversity && !isProfileInFirst ? () => applyMyUniversity("second") : null}
          myUniversityLabel={isStudent ? "Mening universitetim" : "Qiziqishim"}
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      {isLoading && canCompare && (
        <div className="rounded-[2rem] border border-slate-200 bg-white px-5 py-8 text-center text-base font-black text-primary dark:border-white/10 dark:bg-white/[0.06]">
          Taqqoslanmoqda...
        </div>
      )}

      {!canCompare && !isLoading && (
        <p className="text-center text-xs font-semibold text-slate-400">
          Ikkita turli universitet tanlang — natija avtomatik chiqadi.
        </p>
      )}

      {hasResults && (
        <CompareResultsPanel
          data={activeCompareData}
          winnerForMetric={winnerForMetric}
          favoriteBusyId={favoriteBusyId}
          onToggleFavorite={toggleFavorite}
          onViewReviews={onViewReviews}
        />
      )}
    </section>
  );
}
