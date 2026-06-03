import { useCallback, useState } from "react";
import CompareVerdictBanner from "./CompareVerdictBanner.jsx";
import CompareHighlightsRow from "./CompareHighlightsRow.jsx";
import CompareHeroCards from "./CompareHeroCards.jsx";
import CompareMatrix from "./CompareMatrix.jsx";
import CompareUniversityDetail from "./CompareUniversityDetail.jsx";
import CompareResultsToolbar from "./CompareResultsToolbar.jsx";
import CompareWinsBreakdown from "./CompareWinsBreakdown.jsx";
import {
  buildCompareSummary,
  hasAspectComparison,
  orderCompareUniversities,
  orderCompareUniversitiesWithLeaderCenter,
} from "../../../utils/compareMath.js";

const DETAIL_TINTS = ["blue", "violet", "emerald"];

export default function CompareResults({
  data,
  selectedIds,
  content,
  onToggleFavorite,
  onViewReviews,
  favoriteBusyId,
  onBuildShareUrl,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [copyState, setCopyState] = useState("idle");

  const universities = orderCompareUniversities(data.universities ?? [], selectedIds);

  if (universities.length < 3) {
    return null;
  }

  const summary = buildCompareSummary(universities);
  const leaderId = summary.leader?.university?.id ?? null;
  const displayUniversities = orderCompareUniversitiesWithLeaderCenter(
    universities,
    leaderId,
    selectedIds
  );
  const showAspects = hasAspectComparison(universities);
  const universitiesById = new Map(universities.map((university) => [String(university.id), university]));

  const handleCopyLink = useCallback(async () => {
    const url = onBuildShareUrl?.();
    if (!url) {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    window.setTimeout(() => setCopyState("idle"), 2500);
  }, [onBuildShareUrl]);

  return (
    <div className="space-y-4 animate-[hero-fade-up_0.35s_ease-out_forwards] motion-reduce:animate-none" aria-live="polite">
      <CompareResultsToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        differencesOnly={differencesOnly}
        onDifferencesOnlyChange={setDifferencesOnly}
        onCopyLink={handleCopyLink}
        copyState={copyState}
        showDifferencesToggle={activeTab === "matrix"}
      />

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
            onViewReviews={onViewReviews}
          />
        </>
      )}

      {activeTab === "matrix" && (
        <CompareMatrix
          universities={displayUniversities}
          content={content}
          showAspects={showAspects}
          differencesOnly={differencesOnly}
          leaderId={leaderId}
        />
      )}

      {activeTab === "details" && (
        <div
          className={`grid gap-4 ${
            universities.length === 3 ? "xl:grid-cols-3" : "lg:grid-cols-2"
          }`}
        >
          {displayUniversities.map((university, index) => (
            <CompareUniversityDetail
              key={university.id}
              university={university}
              tint={DETAIL_TINTS[index % DETAIL_TINTS.length]}
              onToggleFavorite={onToggleFavorite}
              onViewReviews={onViewReviews}
              favoriteBusyId={favoriteBusyId}
              isRecommended={index === 1 && leaderId != null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
