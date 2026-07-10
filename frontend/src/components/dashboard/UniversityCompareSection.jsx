import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CompareResultsSkeleton } from "../skeletons/DashboardSkeletons.jsx";
import { useToast } from "@/hooks/useToast.js";
import { addFavoriteUniversity, removeFavoriteUniversity } from "@/services/favoriteService.js";
import { getUniversityCompare } from "@/services/universityService.js";
import { matchUniversityByText } from "@/utils/universityMatch.js";
import { getCompareContent } from "@/utils/compareRoleContent.js";
import { getApiErrorMessage } from "@/utils/apiErrors.js";
import { isValidCompareCount, MAX_COMPARE, MIN_COMPARE } from "@/utils/compareMath.js";
import CompareSelectionTray from "./compare/CompareSelectionTray.jsx";
import CompareUniversityPicker from "./compare/CompareUniversityPicker.jsx";
import CompareQuickPicks from "./compare/CompareQuickPicks.jsx";
import CompareResults from "./compare/CompareResults.jsx";
import CompareStepProgress from "./compare/CompareStepProgress.jsx";

function mergeCompareUniversity(catalogUniversity, compareUniversities) {
  if (!catalogUniversity) {
    return null;
  }
  const enriched = compareUniversities?.find((item) => String(item.id) === String(catalogUniversity.id));
  return enriched ? { ...catalogUniversity, ...enriched } : catalogUniversity;
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

function parseCompareIdsParam(raw) {
  if (!raw?.trim()) {
    return [];
  }
  const ids = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const unique = [...new Set(ids)];
  return unique.slice(0, MAX_COMPARE);
}

function buildQuickPicks(universities, myUniversity, limit = 4) {
  if (universities.length < MIN_COMPARE) {
    return [];
  }

  const sorted = [...universities].sort((a, b) => (b.member_count ?? 0) - (a.member_count ?? 0));
  const picks = [];
  const used = new Set();

  function addPick(ids) {
    const unique = [...new Set(ids.map(String))];
    if (!isValidCompareCount(unique.length)) {
      return;
    }
    const key = unique.slice().sort().join("-");
    if (used.has(key)) {
      return;
    }
    used.add(key);
    const rowUniversities = unique
      .map((id) => universities.find((item) => String(item.id) === id))
      .filter(Boolean);
    if (rowUniversities.length === unique.length) {
      picks.push({ ids: unique, universities: rowUniversities });
    }
  }

  // Prefer clean 2-way matchups first (fills a 4-card row nicely).
  if (myUniversity) {
    const partners = sorted.filter((item) => item.id !== myUniversity.id);
    for (let i = 0; i < partners.length && picks.length < limit; i += 1) {
      addPick([myUniversity.id, partners[i].id]);
    }
    if (partners.length >= 2 && picks.length < limit) {
      addPick([myUniversity.id, partners[0].id, partners[1].id]);
    }
  }

  for (let i = 0; i < sorted.length && picks.length < limit; i += 1) {
    for (let j = i + 1; j < sorted.length && picks.length < limit; j += 1) {
      addPick([sorted[i].id, sorted[j].id]);
    }
  }

  for (let i = 0; i < sorted.length && picks.length < limit; i += 1) {
    for (let j = i + 1; j < sorted.length && picks.length < limit; j += 1) {
      for (let k = j + 1; k < sorted.length && picks.length < limit; k += 1) {
        addPick([sorted[i].id, sorted[j].id, sorted[k].id]);
      }
    }
  }

  return picks.slice(0, limit);
}

export default function UniversityCompareSection({
  universities,
  userUniversity = "",
  isStudent = false,
  onViewReviews,
  prefillIds = null,
  onPrefillConsumed,
}) {
  const content = getCompareContent(isStudent);
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const hydratedFromUrl = useRef(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [compareData, setCompareData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [compareError, setCompareError] = useState(false);
  const [resolvedKey, setResolvedKey] = useState("");
  const [favoriteBusyId, setFavoriteBusyId] = useState(null);

  useEffect(() => {
    if (!prefillIds?.length) {
      return;
    }
    const ids = prefillIds.map(String).filter(Boolean).slice(0, MAX_COMPARE);
    if (ids.length >= 1) {
      setSelectedIds(ids);
      setSearch("");
      onPrefillConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillIds]);

  useEffect(() => {
    if (hydratedFromUrl.current || prefillIds?.length) {
      return;
    }
    const fromUrl = parseCompareIdsParam(searchParams.get("compare_ids"));
    if (fromUrl.length >= 1) {
      setSelectedIds(fromUrl);
      hydratedFromUrl.current = true;
    }
  }, [searchParams, prefillIds]);

  useEffect(() => {
    if (!isValidCompareCount(selectedIds.length)) {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.delete("compare_ids");
          return next;
        },
        { replace: true }
      );
      return;
    }
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("section", "compare");
        next.set("compare_ids", selectedIds.join(","));
        return next;
      },
      { replace: true }
    );
  }, [selectedIds, setSearchParams]);

  const myUniversity = useMemo(
    () => matchUniversityByText(universities, userUniversity),
    [universities, userUniversity]
  );

  const canCompare =
    isValidCompareCount(selectedIds.length) && new Set(selectedIds).size === selectedIds.length;
  const selectionKey = canCompare ? selectedIds.join("|") : "";
  const isFull = selectedIds.length >= MAX_COMPARE;

  const universitiesById = useMemo(() => {
    const map = new Map();
    universities.forEach((university) => {
      map.set(String(university.id), mergeCompareUniversity(university, compareData?.universities));
    });
    compareData?.universities?.forEach((university) => {
      map.set(String(university.id), university);
    });
    return map;
  }, [universities, compareData]);

  const traySlots = useMemo(
    () => Array.from({ length: MAX_COMPARE }, (_, index) => selectedIds[index] ?? null),
    [selectedIds]
  );

  const quickPicks = useMemo(() => buildQuickPicks(universities, myUniversity), [universities, myUniversity]);

  useEffect(() => {
    if (!canCompare) {
      setCompareData(null);
      setResolvedKey("");
      setCompareError(false);
      return undefined;
    }

    let isMounted = true;
    const requestKey = selectedIds.join("|");

    async function loadCompare() {
      setIsLoading(true);
      setCompareError(false);
      try {
        const data = await getUniversityCompare(selectedIds);
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
  }, [selectedIds, canCompare, toast]);

  function clearSelection() {
    setSelectedIds([]);
    setSearch("");
    setCompareData(null);
    setResolvedKey("");
    setCompareError(false);
  }

  function removeUniversity(id) {
    setSelectedIds((current) => current.filter((item) => item !== String(id)));
  }

  function addUniversity(id) {
    const sid = String(id);
    if (selectedIds.includes(sid) || selectedIds.length >= MAX_COMPARE) {
      return;
    }
    setSelectedIds((current) => [...current, sid]);
    setSearch("");
  }

  function swapFirstTwo() {
    setSelectedIds((current) => {
      if (current.length < 2) {
        return current;
      }
      const next = [...current];
      [next[0], next[1]] = [next[1], next[0]];
      return next;
    });
  }

  function applyMyUniversity() {
    if (!myUniversity) {
      return;
    }
    addUniversity(myUniversity.id);
  }

  const resultsReady =
    resolvedKey === selectionKey &&
    isValidCompareCount(compareData?.universities?.length ?? 0) &&
    (compareData?.universities?.length ?? 0) === selectedIds.length;
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
      const data = await getUniversityCompare(selectedIds);
      setCompareData(data);
      setResolvedKey(selectedIds.join("|"));
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
        <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50/90 via-white to-primary/[0.04] px-5 py-4 dark:border-white/10 dark:from-white/[0.03] dark:via-[#0b1220] dark:to-primary/10 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{content.eyebrow}</p>
              <h2 className="mt-0.5 text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{content.title}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {content.subtitle}
              </p>
            </div>
            <CompareStepProgress
              selectedCount={selectedIds.length}
              hasResults={showResults}
            />
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <CompareSelectionTray
            slots={traySlots}
            universitiesById={universitiesById}
            onRemove={removeUniversity}
            onClearAll={clearSelection}
            onSwap={swapFirstTwo}
            maxLabel={content.maxLabel}
          />

          {!canCompare && quickPicks.length > 0 && (
            <CompareQuickPicks
              label={content.quickPickLabel}
              pairs={quickPicks}
              onApply={(ids) => {
                setSelectedIds(ids.map(String));
                setSearch("");
              }}
            />
          )}

          {!canCompare && selectedIds.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-5 text-center dark:border-white/10 dark:bg-white/[0.02]">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{content.emptyHint}</p>
              <p className="mt-1 text-xs text-slate-400">Yoki pastdagi qidiruvdan OTM qo&apos;shing</p>
            </div>
          )}

          <CompareUniversityPicker
            universities={universities}
            selectedIds={selectedIds}
            search={search}
            onSearchChange={setSearch}
            onSelect={addUniversity}
            onUseMyUniversity={myUniversity && !isFull ? applyMyUniversity : null}
            myUniversityLabel={content.myUniversityLabel}
            pickerHint={content.pickerHint}
            isFull={isFull}
          />
        </div>
      </div>

      {showSkeleton && <CompareResultsSkeleton columns={selectedIds.length || 2} />}

      {showLoadError && <CompareLoadError onRetry={reloadCompare} />}

      {showResults && (
        <CompareResults
          data={compareData}
          selectedIds={selectedIds}
          content={content}
          onToggleFavorite={toggleFavorite}
          onViewReviews={onViewReviews}
          favoriteBusyId={favoriteBusyId}
        />
      )}
    </section>
  );
}
