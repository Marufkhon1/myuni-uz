const HASHTAG_SPLIT = /(#[\w\u0400-\u04FF-]{2,32})/gu;

export function parseHashtagParts(text) {
  if (!text) {
    return [];
  }
  return String(text).split(HASHTAG_SPLIT).filter(Boolean);
}

export function normalizeHashtag(tag) {
  return String(tag || "").replace(/^#/, "").toLowerCase();
}
