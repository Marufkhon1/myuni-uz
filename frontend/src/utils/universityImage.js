import { resolveMediaUrl } from "./media.js";

/** @deprecated Faqat eski fallback — boshqa universitet brendini ko'rsatmasligi kerak */
export const DEFAULT_UNIVERSITY_IMAGE = null;

const LEGACY_CAMPUS_PREFIX = "/images/campuses/";
const SITE_OG_IMAGE = "/og-image.png";

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
    lower.startsWith(LEGACY_CAMPUS_PREFIX) ||
    lower.includes("/_default.jpg")
  );
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getUniversityBrandHue(university) {
  const key = university?.slug || university?.short_name || university?.name || "uni";
  return hashString(String(key)) % 360;
}

export function getUniversityBrandGradient(university) {
  const hue = getUniversityBrandHue(university);
  return `linear-gradient(135deg, hsl(${hue} 58% 46%) 0%, hsl(${(hue + 36) % 360} 52% 32%) 52%, hsl(${(hue + 72) % 360} 48% 20%) 100%)`;
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

  return universityImagePath(university.slug) || "";
}

export function getUniversityBannerUrl(university) {
  const primary = getUniversityImageUrl(university);
  return primary || null;
}

export function hasCustomUniversityImage(university) {
  return Boolean(getUniversityImageUrl(university));
}

export function getUniversityLogoUrl(university) {
  return getUniversityImageUrl(university) || null;
}

export function getUniversityOgImagePath(university) {
  const url = getUniversityImageUrl(university);
  return url || SITE_OG_IMAGE;
}

/** @deprecated Eski campus fallback — faqat eski importlar uchun */
export const CAMPUS_IMAGE_PATHS = [];
export function campusIndex() {
  return 0;
}
