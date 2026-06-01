import ReviewInsightSummary from "../reviews/ReviewInsightSummary.jsx";

/** Faqat talabalar xulosasi — summary va mezonlar hero'da */
export default function ReviewUniversityProfile({ insightSummary, reviewCount }) {
  if (!insightSummary) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 dark:bg-white/[0.03] dark:ring-white/10">
      <div className="px-4 py-3.5 sm:px-5 sm:py-4">
        <ReviewInsightSummary summary={insightSummary} reviewCount={reviewCount} inline />
      </div>
    </section>
  );
}
