/**
 * Screen reader uchun yulduz reyting matni (WCAG 4.1.2).
 * @see https://www.w3.org/WAI/WCAG22/Understanding/name-role-value
 */
export function formatStarRatingLabel(rating, { max = 5, emptyLabel = "Baho berilmagan" } = {}) {
  if (rating == null || Number.isNaN(Number(rating))) {
    return emptyLabel;
  }

  const numeric = Number(rating);
  const formatted = numeric % 1 === 0 ? String(numeric) : numeric.toFixed(1);
  return `${formatted} dan ${max} yulduz`;
}

export function formatStarFilterLabel(ratingValue) {
  if (ratingValue === "all") {
    return "Barcha baholar";
  }
  return `${ratingValue} yulduzli sharhlar`;
}
