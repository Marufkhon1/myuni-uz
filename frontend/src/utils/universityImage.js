import campus01 from "../../public/images/campuses/campus-01.jpg";
import campus02 from "../../public/images/campuses/campus-02.jpg";
import campus03 from "../../public/images/campuses/campus-03.jpg";
import campus04 from "../../public/images/campuses/campus-04.jpg";
import campus05 from "../../public/images/campuses/campus-05.jpg";
import campus06 from "../../public/images/campuses/campus-06.jpg";
import campus07 from "../../public/images/campuses/campus-07.jpg";
import campus08 from "../../public/images/campuses/campus-08.jpg";
import { resolveMediaUrl } from "./media.js";

/** Kampus rasmlari — Vite build bilan birga chiqadi */
export const CAMPUS_IMAGE_PATHS = [
  campus01,
  campus02,
  campus03,
  campus04,
  campus05,
  campus06,
  campus07,
  campus08,
];

function isUnreliableImageUrl(url) {
  if (!url) {
    return true;
  }
  const lower = url.toLowerCase();
  return (
    lower.includes("picsum.photos") ||
    lower.includes("dicebear.com") ||
    lower.includes("unsplash.com") ||
    lower.includes("images.unsplash") ||
    lower.startsWith("/images/campuses/")
  );
}

export function campusIndex(university) {
  const key = university?.id ?? university?.short_name ?? university?.name ?? "uni";
  const numeric =
    typeof key === "number" ? key : [...String(key)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return Math.abs(numeric) % CAMPUS_IMAGE_PATHS.length;
}

export function getUniversityImageUrl(university) {
  if (!university) {
    return CAMPUS_IMAGE_PATHS[0];
  }

  const stored = resolveMediaUrl(university.image_url || "");
  if (stored && !isUnreliableImageUrl(stored)) {
    return stored;
  }

  return CAMPUS_IMAGE_PATHS[campusIndex(university)];
}

export function getUniversityBannerUrl(university) {
  return getUniversityImageUrl(university);
}

/** Faqat admin yuklagan haqiqiy rasm — stock kampus fallback emas */
export function hasCustomUniversityImage(university) {
  if (!university) {
    return false;
  }
  const stored = resolveMediaUrl(university.image_url || "");
  return Boolean(stored && !isUnreliableImageUrl(stored));
}

export function getUniversityLogoUrl(university) {
  if (!hasCustomUniversityImage(university)) {
    return null;
  }
  return resolveMediaUrl(university.image_url || "");
}

/** OG / ijtimoiy tarmoq preview — barqaror public URL (build hashsiz). */
export function getUniversityOgImagePath(university) {
  if (!university) {
    return "/images/campuses/campus-01.jpg";
  }

  const stored = resolveMediaUrl(university.image_url || "");
  if (stored && !isUnreliableImageUrl(stored)) {
    return stored;
  }

  const index = campusIndex(university) + 1;
  return `/images/campuses/campus-${String(index).padStart(2, "0")}.jpg`;
}
