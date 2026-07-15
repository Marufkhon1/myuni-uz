/** MyUni soft reyting — jonli Bayesian jadval (arxiv snapshot hali yo'q). */
export const CURRENT_RANKING_YEAR = 2026;

export const RANKINGS_PATH = "/reyting";

export function rankingsYearPath(year = CURRENT_RANKING_YEAR) {
  return `${RANKINGS_PATH}/${year}`;
}

export function isSupportedRankingYear(year) {
  const n = Number(year);
  return Number.isInteger(n) && n === CURRENT_RANKING_YEAR;
}

/** Soft reyting jadvali: kamida medium ishonch (≤2 sharh — low, jadvalga kiritilmaydi). */
export const RANKINGS_MIN_REVIEWS = 3;

export const CONFIDENCE_LABELS = {
  no_reviews: "Sharh yo'q",
  low: "Kam sharh",
  medium: "O'rtacha ishonch",
  high: "Yuqori ishonch",
};
