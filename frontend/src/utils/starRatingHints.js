export const RATING_HINTS = {
  1: "Juda yomon",
  2: "Yomon",
  3: "O'rtacha",
  4: "Yaxshi",
  5: "A'lo!",
};

export function getRatingHint(value) {
  return RATING_HINTS[value] ?? null;
}
