export function buildReviewFeedSummary({ filteredCount, totalCount, ratingFilter, sortLabel }) {
  const isRatingFiltered = ratingFilter !== "all";
  const countLabel = isRatingFiltered
    ? `${filteredCount} ta mos sharh · jami ${totalCount} ta sharhdan`
    : `${totalCount} ta sharh`;

  return `${countLabel} · ${sortLabel}`;
}
