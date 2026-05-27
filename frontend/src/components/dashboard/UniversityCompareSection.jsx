import { useEffect, useMemo, useState } from "react";
import UniversityAvatar from "../UniversityAvatar.jsx";
import UniversityCampusBanner from "../UniversityCampusBanner.jsx";
import { formatUniversityMetaHeader } from "../UniversityMetaLine.jsx";
import UniversityRatingStars from "./UniversityRatingStars.jsx";
import { matchUniversityByText } from "./UniversitySearchSelect.jsx";
import { addFavoriteUniversity, removeFavoriteUniversity } from "../../services/favoriteService.js";
import { getUniversityCompare } from "../../services/universityService.js";
import { getApiErrorMessage } from "../../utils/apiErrors.js";

const METRIC_ROWS = [
  { key: "average_rating", label: "O'rtacha reyting", format: (value) => (value != null ? `${value}/5` : "—") },
  { key: "review_count", label: "Sharhlar soni", format: (value) => `${value ?? 0} ta` },
  { key: "member_count", label: "Chat faolligi", format: (value) => `${value ?? 0} a'zo` },
  { key: "location", label: "Joylashuv", format: (value) => value || "—" },
  { key: "founded_year", label: "Tashkil topilgan", format: (value) => (value ? `${value}-yil` : "—") },
  { key: "institution_type", label: "Muassasa turi", format: (value) => value || "—" },
];

const HIGHLIGHT_LABELS = {
  rating: "Yuqori reyting",
  reviews: "Ko'proq sharh",
  chat_activity: "Faol chat",
};

const pickerInputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-400/25";

function RatingDistribution({ distribution, reviewCount }) {
  const total = reviewCount || 0;
  const stars = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-1.5">
      {stars.map((star) => {
        const count = distribution?.[String(star)] ?? 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-3 font-black text-amber-500">{star}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="w-8 text-right font-semibold text-slate-500">{count}</span>
          </div>
        );
      })}
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

function ComparePickerColumn({
  title,
  hint,
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
  suggestedUniversities = [],
  suggestedHint = "",
}) {
  const list = filterUniversities(
    universities.filter((university) => String(university.id) !== disabledId),
    search
  );

  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6 lg:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wide text-primary">{title}</p>
          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
        {selectedUniversity && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-black text-slate-600 transition hover:border-primary dark:border-white/15 dark:text-slate-300"
          >
            O&apos;chirish
          </button>
        )}
      </div>

      {selectedUniversity ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-primary/25 bg-white px-4 py-3.5 shadow-sm dark:bg-white/10">
          <UniversityAvatar university={selectedUniversity} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-950 dark:text-white">
              {selectedUniversity.short_name || selectedUniversity.name}
            </p>
            {selectedUniversity.location && (
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {selectedUniversity.location}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-center dark:border-white/15 dark:bg-white/[0.03]">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Hali tanlanmagan</p>
        </div>
      )}

      {!selectedUniversity && suggestedUniversities.length > 0 && (
        <div className="mt-5 rounded-xl border border-blue-200/80 bg-blue-50/80 p-4 dark:border-primary/30 dark:bg-blue-400/10">
          <p className="text-xs font-bold leading-6 text-primary dark:text-blue-200">{suggestedHint}</p>
          <ul className="mt-4 space-y-2.5">
            {suggestedUniversities.map((university) => (
              <li key={university.id}>
                <button
                  type="button"
                  onClick={() => onSelect(university.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 text-left transition hover:border-primary hover:bg-white dark:border-white/10 dark:bg-white/10"
                >
                  <UniversityAvatar university={university} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-800 dark:text-white">
                    {university.short_name || university.name}
                  </span>
                  <span className="shrink-0 text-[10px] font-black uppercase text-primary">Tanlash</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onUseMyUniversity && !selectedUniversity && suggestedUniversities.length === 0 && (
        <button
          type="button"
          onClick={onUseMyUniversity}
          className="mt-5 w-full rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-black text-violet-800 transition hover:border-violet-300 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-200"
        >
          {myUniversityLabel}
        </button>
      )}

      <input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Universitet qidiring..."
        className={`mt-5 ${pickerInputClass}`}
      />

      <div className="mt-5 max-h-52 space-y-2.5 overflow-y-auto overscroll-contain rounded-xl border border-slate-200/80 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03] sm:max-h-60">
        {list.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm font-semibold text-slate-500">Topilmadi</p>
        ) : (
          list.map((university) => {
            const isSelected = String(university.id) === isActiveId;
            return (
              <button
                key={university.id}
                type="button"
                onClick={() => onSelect(university.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3.5 text-left text-sm transition ${
                  isSelected
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                    : "hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
              >
                <UniversityAvatar university={university} size="sm" />
                <span className="min-w-0 flex-1 truncate font-bold">
                  {university.short_name || university.name}
                </span>
                <span className="shrink-0 text-[10px] font-black uppercase opacity-70">
                  {isSelected ? "✓" : "Tanlash"}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function UniversitySpotlightCard({ university, compareDetails }) {
  if (!university) {
    return null;
  }

  const meta = formatUniversityMetaHeader(university);
  const summary = university.summary?.trim();
  const shortLabel = university.short_name || university.name;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm dark:border-white/10 dark:bg-white/5">
      <UniversityCampusBanner university={university} className="h-28" />
      <div className="p-4 sm:p-5">
        <p className="text-[11px] font-black uppercase tracking-wide text-primary">Fokus</p>
        <h3 className="mt-2 text-lg font-black text-slate-950 dark:text-white">{shortLabel}</h3>
        {university.location && (
          <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {university.location}
          </p>
        )}
        {meta && (
          <p className="mt-2 text-xs font-semibold leading-5 text-primary/90 dark:text-blue-300">{meta}</p>
        )}

        {compareDetails ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-center dark:bg-white/5">
              <p className="text-[10px] font-black uppercase text-slate-400">Reyting</p>
              <p className="mt-0.5 text-sm font-black text-slate-800 dark:text-white">
                {compareDetails.average_rating != null ? `${compareDetails.average_rating}/5` : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-center dark:bg-white/5">
              <p className="text-[10px] font-black uppercase text-slate-400">Sharh</p>
              <p className="mt-0.5 text-sm font-black text-slate-800 dark:text-white">
                {compareDetails.review_count ?? 0}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-center dark:bg-white/5">
              <p className="text-[10px] font-black uppercase text-slate-400">Chat</p>
              <p className="mt-0.5 text-sm font-black text-slate-800 dark:text-white">
                {compareDetails.member_count ?? university.member_count ?? 0}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-white/5">
              <p className="text-[10px] font-black uppercase text-slate-400">Chat a&apos;zolari</p>
              <p className="mt-0.5 text-sm font-black text-slate-800 dark:text-white">
                {university.member_count ?? 0}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-white/5">
              <p className="text-[10px] font-black uppercase text-slate-400">Turi</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                {university.institution_type || "—"}
              </p>
            </div>
          </div>
        )}

        {summary && (
          <p className="mt-4 line-clamp-3 text-xs leading-6 text-slate-600 dark:text-slate-300">{summary}</p>
        )}
      </div>
    </div>
  );
}

function MiniWinnerRow({ label, highlight }) {
  if (!highlight) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-200 px-3.5 py-2.5 dark:border-white/10">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <span className="text-xs font-bold text-slate-400">—</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-2.5 dark:border-emerald-400/25 dark:bg-emerald-950/30">
      <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">{label}</span>
      <span className="text-xs font-black text-slate-900 dark:text-white">{highlight.short_name}</span>
    </div>
  );
}

function HighlightCard({ label, highlight }) {
  if (!highlight) {
    return null;
  }

  return (
    <div className="rounded-xl border border-emerald-200/80 bg-white px-4 py-3 dark:border-emerald-400/25 dark:bg-white/5">
      <p className="text-[11px] font-black uppercase text-emerald-700 dark:text-emerald-300">{label}</p>
      <p className="mt-1 font-black text-slate-950 dark:text-white">{highlight.short_name}</p>
    </div>
  );
}

export default function UniversityCompareSection({
  universities,
  userUniversity = "",
  isStudent = false,
  onViewReviews,
  onOpenSection,
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

  const compareChecks = [
    { label: "1-OTM", done: Boolean(firstId) },
    { label: "2-OTM", done: Boolean(secondId) },
    { label: "Natija", done: hasResults },
  ];
  const completedChecks = compareChecks.filter((item) => item.done).length;
  const compareProgress = Math.round((completedChecks / compareChecks.length) * 100);

  const guideSteps = [
    {
      title: "Birinchi universitet",
      hint: firstUniversity
        ? `${firstUniversity.short_name || firstUniversity.name} tanlandi.`
        : isStudent
          ? "Taqqoslashni boshlash uchun birinchi OTMni tanlang."
          : "Birinchi qiziqayotgan universitetingizni tanlang.",
      done: Boolean(firstId),
    },
    {
      title: "Ikkinchi universitet",
      hint: secondUniversity
        ? `${secondUniversity.short_name || secondUniversity.name} qo'shildi.`
        : isStudent
          ? "Turli ikkinchi universitetni tanlang — natija avtomatik chiqadi."
          : "Ikkinchi variantni tanlang — tanlov uchun solishtiramiz.",
      done: Boolean(secondId),
    },
    {
      title: "Natijani o'rganing",
      hint: hasResults
        ? "Reyting, sharhlar va chat faolligini yonma-yon ko'ring."
        : "Ikkala OTM tanlangandan keyin pastda batafsil jadval ochiladi.",
      done: hasResults,
      actionId: hasResults ? "reviews" : null,
      actionLabel: hasResults ? (isStudent ? "Sharh yozish" : "Sharhlarni ko'rish") : null,
    },
  ];

  const compareIntro = isStudent
    ? "O'qiyotgan yoki qiziqayotgan ikki OTMni tanlang — reyting, sharhlar va chat faolligini yonma-yon ko'ring."
    : "Tanlamoqchi bo'lgan ikki universitetni solishtiring — sharhlar va chat faolligi yordam beradi.";

  const leftHint = isStudent
    ? "O'qiyotgan universitetingizni bir tomonga qo'yib, boshqasini solishtirib ko'ring."
    : "Qiziqayotgan ikki OTMni tanlang — abituriyentlar uchun eng qulay tanlov vositasi.";

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
    if (slot === "first") {
      if (id !== secondId) {
        setFirstId(id);
      }
    } else if (id !== firstId) {
      setSecondId(id);
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
      setError(getApiErrorMessage(requestError, "Sevimlilar ro'yxati yangilanmadi."));
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

  const spotlightUniversity = firstUniversity || secondUniversity || myUniversity || null;

  const spotlightCompareDetails = useMemo(() => {
    if (!spotlightUniversity || !activeCompareData?.universities) {
      return null;
    }
    return (
      activeCompareData.universities.find((item) => item.id === spotlightUniversity.id) ?? null
    );
  }, [spotlightUniversity, activeCompareData]);

  const quickCompareSuggestions = useMemo(() => {
    if (universities.length < 2) {
      return [];
    }

    const sorted = [...universities].sort(
      (left, right) => (right.member_count ?? 0) - (left.member_count ?? 0)
    );
    const pairs = [];
    const usedKeys = new Set();
    const maxPairs = 3;

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

    const popular = sorted.slice(0, 8);

    if (myUniversity) {
      const profilePartner = popular.find((item) => item.id !== myUniversity.id);
      if (profilePartner) {
        addPair(myUniversity, profilePartner);
      }
    }

    for (let index = 0; index < popular.length && pairs.length < maxPairs; index += 1) {
      for (let otherIndex = index + 1; otherIndex < popular.length && pairs.length < maxPairs; otherIndex += 1) {
        const left = popular[index];
        const right = popular[otherIndex];
        if (myUniversity && (left.id === myUniversity.id || right.id === myUniversity.id)) {
          continue;
        }
        addPair(left, right);
      }
    }

    if (pairs.length < maxPairs) {
      for (const anchor of sorted) {
        if (pairs.length >= maxPairs) {
          break;
        }
        const other = sorted.find((item) => item.id !== anchor.id && !usedKeys.has(
          [anchor.id, item.id].sort((a, b) => a - b).join("-")
        ));
        if (other) {
          addPair(anchor, other);
        }
      }
    }

    return pairs.slice(0, maxPairs);
  }, [universities, myUniversity]);

  function applyQuickCompare(anchor, other) {
    setFirstId(String(anchor.id));
    setSecondId(String(other.id));
    setFirstSearch("");
    setSecondSearch("");
    setError("");
  }

  const profileUniversityId = myUniversity ? String(myUniversity.id) : "";
  const isProfileInSecond = Boolean(profileUniversityId && secondId === profileUniversityId);
  const isProfileInFirst = Boolean(profileUniversityId && firstId === profileUniversityId);

  const comparePartnerSuggestions = useMemo(() => {
    if (!myUniversity) {
      return [];
    }
    return [...universities]
      .filter((university) => university.id !== myUniversity.id)
      .sort((left, right) => (right.member_count ?? 0) - (left.member_count ?? 0))
      .slice(0, 5);
  }, [universities, myUniversity]);

  const profileShortName = myUniversity?.short_name || myUniversity?.name || "Profil OTM";

  return (
    <section className="space-y-10">
      <div className="grid gap-8 md:items-start xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] xl:gap-12">
        <div className="flex h-fit w-full max-w-sm flex-col justify-self-center rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-7 md:max-w-none md:justify-self-start xl:max-w-none dark:border-white/10 dark:bg-white/[0.06]">
          <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-primary">Taqqoslash</p>

          <div className="relative mx-auto mt-6 flex h-32 w-full max-w-[240px] shrink-0 items-center justify-center">
            <div className="absolute left-2 top-1/2 z-10 -translate-y-1/2">
              {firstUniversity ? (
                <UniversityAvatar university={firstUniversity} size="lg" />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-base font-black text-slate-400 dark:border-white/15 dark:bg-white/5">
                  1
                </div>
              )}
            </div>
            <span className="rounded-full bg-slate-950 px-3.5 py-1.5 text-xs font-black text-white shadow-md dark:bg-white dark:text-slate-950">
              VS
            </span>
            <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2">
              {secondUniversity ? (
                <UniversityAvatar university={secondUniversity} size="lg" />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-base font-black text-slate-400 dark:border-white/15 dark:bg-white/5">
                  2
                </div>
              )}
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3.5 text-center">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-3.5 dark:border-white/10 dark:bg-white/5">
              <p className="text-[10px] font-black uppercase text-slate-400">Jami OTM</p>
              <p className="mt-0.5 text-lg font-black text-primary">{universities.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-3.5 dark:border-white/10 dark:bg-white/5">
              <p className="text-[10px] font-black uppercase text-slate-400">Tanlangan</p>
              <p className="mt-0.5 text-lg font-black text-slate-800 dark:text-white">
                {(firstId ? 1 : 0) + (secondId ? 1 : 0)}
              </p>
            </div>
            <div className="rounded-xl border border-violet-200/80 bg-violet-50 px-3 py-3.5 dark:border-violet-400/20 dark:bg-violet-400/10">
              <p className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-300">Tayyor</p>
              <p className="mt-0.5 text-lg font-black text-violet-800 dark:text-violet-200">{compareProgress}%</p>
            </div>
          </div>

          <div className="mt-7 space-y-5 text-left">
            {spotlightUniversity && (
              <UniversitySpotlightCard
                university={spotlightUniversity}
                compareDetails={spotlightCompareDetails}
              />
            )}

            {hasResults && activeCompareData?.highlights && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-[11px] font-black uppercase tracking-wide text-primary">Tezkor natija</p>
                <div className="mt-3 space-y-2.5">
                  <MiniWinnerRow
                    label={HIGHLIGHT_LABELS.rating}
                    highlight={activeCompareData.highlights.rating}
                  />
                  <MiniWinnerRow
                    label={HIGHLIGHT_LABELS.reviews}
                    highlight={activeCompareData.highlights.reviews}
                  />
                  <MiniWinnerRow
                    label={HIGHLIGHT_LABELS.chat_activity}
                    highlight={activeCompareData.highlights.chat_activity}
                  />
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-[11px] font-black uppercase tracking-wide text-primary">Tanlov</p>
              <dl className="mt-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-[11px] font-black uppercase text-slate-400">1-universitet</dt>
                  <dd className="truncate text-sm font-black text-slate-800 dark:text-white">
                    {firstUniversity?.short_name || "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-[11px] font-black uppercase text-slate-400">2-universitet</dt>
                  <dd className="truncate text-sm font-black text-slate-800 dark:text-white">
                    {secondUniversity?.short_name || "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <ul className="space-y-2.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              <li className="flex gap-2.5 rounded-xl bg-white px-3.5 py-3 dark:bg-white/5">
                <span className="font-black text-primary">1.</span>
                <span>Ikkita turli universitetni tanlang.</span>
              </li>
              <li className="flex gap-2.5 rounded-xl bg-white px-3.5 py-3 dark:bg-white/5">
                <span className="font-black text-primary">2.</span>
                <span>Reyting, sharh va chat faolligini solishtiring.</span>
              </li>
              <li className="flex gap-2.5 rounded-xl bg-white px-3.5 py-3 dark:bg-white/5">
                <span className="font-black text-primary">3.</span>
                <span>Sevimliga qo&apos;shing yoki sharhlarni o&apos;qing.</span>
              </li>
            </ul>
          </div>

          <p className="mt-7 shrink-0 rounded-xl bg-slate-50 px-4 py-3.5 text-xs leading-6 text-slate-500 dark:bg-white/5 dark:text-slate-400">
            {leftHint}
          </p>
        </div>

        <div className="flex h-fit w-full min-w-0 flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8 lg:p-9 dark:border-white/10 dark:bg-white/[0.06]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Universitetlarni solishtirish</p>
          <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
            {isStudent ? "OTMlarni solishtiring" : "Qaysi OTM sizga mos?"}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">{compareIntro}</p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
            <ComparePickerColumn
              title="1-chi universitet"
              hint={
                isProfileInSecond
                  ? `${profileShortName} bilan solishtiring`
                  : "Birinchi OTM"
              }
              selectedUniversity={firstUniversity}
              universities={universities}
              disabledId={secondId}
              isActiveId={firstId}
              search={firstSearch}
              onSearchChange={setFirstSearch}
              onSelect={(id) => setFirstId(String(id))}
              onClear={() => setFirstId("")}
              onUseMyUniversity={
                myUniversity && !isProfileInSecond ? () => applyMyUniversity("first") : null
              }
              myUniversityLabel={
                isStudent ? "O'qiyotgan universitetimni qo'yish" : "Qiziqayotgan universitetimni qo'yish"
              }
              suggestedUniversities={isProfileInSecond && !firstId ? comparePartnerSuggestions : []}
              suggestedHint={`${profileShortName} o'ngda — chap tomonda boshqasini tanlang:`}
            />
            <ComparePickerColumn
              title="2-chi universitet"
              hint={
                isProfileInFirst
                  ? `${profileShortName} bilan solishtiring`
                  : "Ikkinchi OTM (boshqasi)"
              }
              selectedUniversity={secondUniversity}
              universities={universities}
              disabledId={firstId}
              isActiveId={secondId}
              search={secondSearch}
              onSearchChange={setSecondSearch}
              onSelect={(id) => setSecondId(String(id))}
              onClear={() => setSecondId("")}
              onUseMyUniversity={
                myUniversity && !isProfileInFirst ? () => applyMyUniversity("second") : null
              }
              myUniversityLabel={
                isStudent ? "Profil universitetini qo'yish" : "Qiziqayotgan universitetimni qo'yish"
              }
              suggestedUniversities={isProfileInFirst && !secondId ? comparePartnerSuggestions : []}
              suggestedHint={`${profileShortName} chapda — o'ng tomonda boshqasini tanlang:`}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            {!canCompare ? (
              <p className="text-sm font-semibold text-slate-500">
                Taqqoslash uchun 2 ta turli universitet tanlang.
              </p>
            ) : isLoading ? (
              <p className="text-sm font-semibold text-primary">Natija yuklanmoqda...</p>
            ) : (
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Tayyor — batafsil natija pastda.
              </p>
            )}
            {(firstId || secondId) && (
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition hover:border-primary dark:border-white/15 dark:text-slate-300"
              >
                Hammasini tozalash
              </button>
            )}
          </div>

          {error && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          )}

          <div className="mt-10 border-t border-slate-100 pt-8 dark:border-white/10">
            <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center">
              <p className="shrink-0 text-xs font-black uppercase tracking-[0.18em] text-primary">Holat</p>
              <div className="flex flex-wrap items-center gap-2.5">
                {compareChecks.map((item) => (
                  <span
                    key={item.label}
                    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold ${
                      item.done
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                    }`}
                  >
                    {item.done ? "✓" : "·"} {item.label}
                  </span>
                ))}
              </div>
              <div className="flex min-w-[12rem] flex-1 items-center gap-3 sm:min-w-[16rem]">
                <div
                  className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
                  role="progressbar"
                  aria-valuenow={compareProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Taqqoslash tayyorligi"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-400 to-primary transition-all duration-300"
                    style={{ width: `${compareProgress}%` }}
                  />
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs font-black tabular-nums text-slate-600 dark:text-slate-300">
                  {completedChecks}/{compareChecks.length}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
              <ul className="space-y-3">
                {guideSteps.map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 dark:border-white/10 dark:bg-white/5"
                  >
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black ${
                        item.done
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-400 dark:bg-white/10"
                      }`}
                    >
                      {item.done ? "✓" : "·"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-slate-800 dark:text-white">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.hint}</p>
                      {item.actionId && onOpenSection && item.actionLabel && (
                        <button
                          type="button"
                          onClick={() => onOpenSection(item.actionId)}
                          className="mt-1.5 text-xs font-black text-primary hover:underline"
                        >
                          {item.actionLabel} →
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {!hasResults && (
                <div className="mt-6 space-y-4 border-t border-slate-200/80 pt-6 dark:border-white/10">
                  <p className="text-[11px] font-black uppercase tracking-wide text-primary">
                    Nima solishtiriladi?
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {METRIC_ROWS.slice(0, 3).map((row) => (
                      <div
                        key={row.key}
                        className="rounded-xl border border-slate-200/80 bg-white px-2.5 py-2 text-center dark:border-white/10 dark:bg-white/5"
                      >
                        <p className="text-[10px] font-black uppercase text-slate-400">{row.label}</p>
                        <p className="mt-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          Jadvalda
                        </p>
                      </div>
                    ))}
                  </div>

                  {!canCompare && quickCompareSuggestions.length > 0 && (
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wide text-primary">Tez tanlash</p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                        3 ta mashhur juft — bir bosishda tanlanadi.
                      </p>
                      <ul className="mt-3 space-y-2">
                        {quickCompareSuggestions.map(({ anchor, other }) => (
                          <li key={`${anchor.id}-${other.id}`}>
                            <button
                              type="button"
                              title={`${anchor.short_name || anchor.name} vs ${other.short_name || other.name}`}
                              onClick={() => applyQuickCompare(anchor, other)}
                              className="flex w-full items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-left transition hover:border-primary hover:bg-blue-50/80 dark:border-white/10 dark:bg-white/5"
                            >
                              <div className="flex shrink-0 -space-x-1.5">
                                <UniversityAvatar university={anchor} size="sm" />
                                <UniversityAvatar university={other} size="sm" />
                              </div>
                              <span className="min-w-0 flex-1 text-[11px] font-bold leading-tight text-slate-800 dark:text-white">
                                <span className="block truncate">{anchor.short_name || anchor.name}</span>
                                <span className="block truncate text-slate-500 dark:text-slate-400">
                                  vs {other.short_name || other.name}
                                </span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {onOpenSection && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenSection("reviews")}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-black text-slate-700 transition hover:border-primary dark:border-white/15 dark:text-slate-200"
                      >
                        Sharhlarni ko&apos;rish
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenSection("popular")}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-black text-slate-700 transition hover:border-primary dark:border-white/15 dark:text-slate-200"
                      >
                        Mashhur sharhlar
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenSection("chats")}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-black text-slate-700 transition hover:border-primary dark:border-white/15 dark:text-slate-200"
                      >
                        Chatlar
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                    Natija tayyor bo&apos;lgach pastda jadval, sevimlilar va sharhlar ochiladi.
                  </p>
                </div>
              )}

              {hasResults && (
                <p className="mt-4 border-t border-slate-200/80 pt-3 text-[11px] leading-5 text-slate-500 dark:border-white/10 dark:text-slate-400">
                  Sevimliga qo&apos;shish va sharhlarni ko&apos;rish natija bo&apos;limida mavjud.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {isLoading && canCompare && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center font-black shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
          Taqqoslanmoqda...
        </div>
      )}

      {hasResults && (
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-6 dark:border-white/10 dark:bg-white/[0.06]">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Qisqa xulosa</p>
            <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Kim oldinda?</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <HighlightCard label={HIGHLIGHT_LABELS.rating} highlight={activeCompareData.highlights?.rating} />
              <HighlightCard
                label={HIGHLIGHT_LABELS.reviews}
                highlight={activeCompareData.highlights?.reviews}
              />
              <HighlightCard
                label={HIGHLIGHT_LABELS.chat_activity}
                highlight={activeCompareData.highlights?.chat_activity}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
            <div className="grid md:grid-cols-2">
              {activeCompareData.universities.map((university) => (
                <div
                  key={university.id}
                  className="border-b border-slate-200 p-5 md:border-b-0 md:border-r md:last:border-r-0 dark:border-white/10"
                >
                  <UniversityCampusBanner university={university} className="h-32 rounded-2xl sm:h-36" />
                  <h3 className="mt-4 text-xl font-black">{university.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{university.location}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <UniversityRatingStars rating={university.average_rating} />
                    {university.is_joined && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                        Chatga qo&apos;shilgansiz
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={favoriteBusyId === university.id}
                      onClick={() => toggleFavorite(university)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black transition hover:border-primary hover:bg-blue-50 disabled:opacity-50 dark:border-white/15 dark:hover:bg-blue-400/10"
                    >
                      {university.is_favorited ? "★ Sevimlida" : "☆ Sevimliga"}
                    </button>
                    {onViewReviews && (
                      <button
                        type="button"
                        onClick={() => onViewReviews(university.id)}
                        className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-primary dark:bg-white dark:text-slate-950"
                      >
                        Sharhlarni ko&apos;rish
                      </button>
                    )}
                  </div>
                  {university.summary && (
                    <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {university.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 p-5 dark:border-white/10">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Batafsil jadval</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="py-3 pr-4 font-black text-slate-500">Ko&apos;rsatkich</th>
                      {activeCompareData.universities.map((university) => (
                        <th key={university.id} className="py-3 px-3 font-black">
                          {university.short_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {METRIC_ROWS.map((row) => {
                      const winnerId = winnerForMetric(row.key);
                      return (
                        <tr
                          key={row.key}
                          className="border-b border-slate-100 last:border-0 dark:border-white/5"
                        >
                          <td className="py-3 pr-4 font-semibold text-slate-600 dark:text-slate-300">
                            {row.label}
                          </td>
                          {activeCompareData.universities.map((university) => {
                            const isWinner = winnerId === university.id;
                            return (
                              <td
                                key={university.id}
                                className={`py-3 px-3 font-black ${
                                  isWinner ? "text-primary" : "text-slate-800 dark:text-slate-200"
                                }`}
                              >
                                {row.format(university[row.key])}
                                {isWinner && (
                                  <span className="ml-2 text-[10px] uppercase text-emerald-600">yuqori</span>
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

            <div className="grid gap-4 border-t border-slate-200 p-5 md:grid-cols-2 dark:border-white/10">
              {activeCompareData.universities.map((university) => (
                <div key={university.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-black">{university.short_name} — yulduz taqsimoti</p>
                  <div className="mt-3">
                    <RatingDistribution
                      distribution={university.rating_distribution}
                      reviewCount={university.review_count}
                    />
                  </div>
                  {university.sample_review && (
                    <blockquote className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs font-black text-slate-500">
                        {university.sample_review.author} · {university.sample_review.rating}/5
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">
                        «{university.sample_review.text}»
                      </p>
                    </blockquote>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
