import { resolveMediaUrl } from "./media.js";

export const DEFAULT_UNIVERSITY_IMAGE = "/images/universities/_default.jpg";

const LEGACY_CAMPUS_PREFIX = "/images/campuses/";

function isLegacyPlaceholderUrl(url) {
  if (!url) {
    return true;
  }
  const lower = url.toLowerCase();
  return (
    lower.includes("picsum.photos") ||
    lower.includes("dicebear.com") ||
    lower.includes("unsplash.com") ||
    lower.includes("images.unsplash") ||
    lower.startsWith(LEGACY_CAMPUS_PREFIX)
  );
}

export function universityImagePath(slug) {
  if (!slug) {
    return "";
  }
  return `/images/universities/${slug}.jpg`;
}

export function getUniversityImageUrl(university) {
  if (!university) {
    return "";
  }

  const stored = resolveMediaUrl(university.image_url || "");
  if (stored && !isLegacyPlaceholderUrl(stored)) {
    return stored;
  }

  const slugPath = universityImagePath(university.slug);
  return slugPath || "";
}

export function getUniversityBannerUrl(university) {
  const primary = getUniversityImageUrl(university);
  return primary || DEFAULT_UNIVERSITY_IMAGE;
}

export function hasCustomUniversityImage(university) {
  return Boolean(getUniversityImageUrl(university));
}

export function getUniversityLogoUrl(university) {
  return getUniversityImageUrl(university) || null;
}

export function getUniversityOgImagePath(university) {
  const url = getUniversityImageUrl(university);
  return url || DEFAULT_UNIVERSITY_IMAGE;
}

/** @deprecated Eski campus fallback — faqat eski importlar uchun */
export const CAMPUS_IMAGE_PATHS = [];
export function campusIndex() {
  return 0;
}
