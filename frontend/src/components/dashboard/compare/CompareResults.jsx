import { useCallback, useMemo, useState } from "react";
import CompareVerdictBanner from "./CompareVerdictBanner.jsx";
import CompareHighlightsRow from "./CompareHighlightsRow.jsx";
import CompareHeroCards from "./CompareHeroCards.jsx";
import CompareMatrix from "./CompareMatrix.jsx";
import CompareUniversityDetail from "./CompareUniversityDetail.jsx";
import CompareResultsToolbar from "./CompareResultsToolbar.jsx";
import CompareWinsBreakdown from "./CompareWinsBreakdown.jsx";
import { getApiErrorMessage } from "@/utils/apiErrors.js";
import { copyTextToClipboard } from "@/utils/copyText.js";
import { useToast } from "@/hooks/useToast.js";
import {
  buildCompareSummary,
  hasAspectComparison,
  orderCompareUniversities,
  orderCompareUniversitiesWithLeaderCenter,
} from "@/utils/compareMath.js";

const DETAIL_TINTS = ["blue", "violet", "emerald"];

export default function CompareResults({
  data,
  selectedIds,
  content,
  onToggleFavorite,
  onViewReviews,
  favoriteBusyId,
  readOnly = false,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [copyState, setCopyState] = useState("idle");
  const [shareExpiry, setShareExpiry] = useState("");
  const toast = useToast();

  const handleShareLink = useCallback(async () => {
    if (readOnly || copyState === "creating") {
      return;
    }
    if (selectedIds.length !== 3) {
      toast.warning("Havola uchun 3 ta universitet tanlang.");
      return;
    }
    setCopyState("creating");
    try {
      const url = `${window.location.origin}/taqqoslash?ids=${selectedIds.join(",")}`;
      const copied = await copyTextToClipboard(url);
      setShareExpiry("");
      setCopyState("copied");
      if (!copied) {
        toast.info("Havola tayyor — brauzer nusxalashni blokladi.");
      }
    } catch (error) {
      setCopyState("error");
      toast.error(getApiErrorMessage(error, "Havola yaratib bo'lmadi."));
    }
    window.setTimeout(() => setCopyState("idle"), 4000);
  }, [readOnly, selectedIds, copyState, toast]);

  const universities = useMemo(
    () => orderCompareUniversities(data.universities ?? [], selectedIds),
    [data.universities, selectedIds]
  );

  const summary = useMemo(
    () => (universities.length >= 3 ? buildCompareSummary(universities) : null),
    [universities]
  );

  const leaderId = summary?.leader?.university?.id ?? null;

  const displayUniversities = useMemo(() => {
    if (universities.length < 3) {
      return [];
    }
    return orderCompareUniversitiesWithLeaderCenter(universities, leaderId, selectedIds);
  }, [universities, leaderId, selectedIds]);

  const showAspects = useMemo(
    () => (universities.length >= 3 ? hasAspectComparison(universities) : false),
    [universities]
  );

  const universitiesById = useMemo(
    () => new Map(universities.map((university) => [String(university.id), university])),
    [universities]
  );

  if (universities.length < 3 || !summary) {
    return null;
  }

  return (
    <div className="space-y-4 animate-[hero-fade-up_0.35s_ease-out_forwards] motion-reduce:animate-none" aria-live="polite">
      {!readOnly && (
        <CompareResultsToolbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onShareLink={handleShareLink}
          copyState={copyState}
          shareExpiry={shareExpiry}
        />
      )}

      {readOnly && (
        <div className="flex justify-center">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200/70 dark:bg-white/[0.06] dark:ring-white/10">
            {[
              { id: "overview", label: "Umumiy" },
              { id: "matrix", label: "Jadval" },
              { id: "details", label: "Batafsil" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-4 py-1.5 text-xs font-black transition ${
                  activeTab === tab.id
                    ? "bg-white text-primary shadow-sm dark:bg-slate-900 dark:text-blue-200"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <>
          <CompareVerdictBanner summary={{ ...summary, universities }} content={content} />
          <CompareWinsBreakdown universities={universities} winCounts={summary.winCounts} />
          <CompareHighlightsRow
            highlights={data.highlights}
            universities={universities}
            universitiesById={universitiesById}
          />
          <CompareHeroCards
            universities={displayUniversities}
            leaderId={leaderId}
            onViewReviews={readOnly ? null : onViewReviews}
          />
        </>
      )}

      {activeTab === "matrix" && (
        <CompareMatrix
          universities={displayUniversities}
          content={content}
          showAspects={showAspects}
          leaderId={leaderId}
        />
      )}

      {activeTab === "details" && (
        <div className="grid items-start gap-4 xl:grid-cols-3">
          {displayUniversities.map((university, index) => (
            <CompareUniversityDetail
              key={university.id}
              university={university}
              tint={DETAIL_TINTS[index % DETAIL_TINTS.length]}
              onToggleFavorite={readOnly ? null : onToggleFavorite}
              onViewReviews={readOnly ? null : onViewReviews}
              favoriteBusyId={readOnly ? null : favoriteBusyId}
              isRecommended={index === 1 && leaderId != null}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}
