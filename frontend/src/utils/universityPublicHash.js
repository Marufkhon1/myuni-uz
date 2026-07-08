import { UNIVERSITY_PUBLIC_SECTIONS } from "@/utils/universityPublicSections.js";

export const UNIVERSITY_PUBLIC_REVIEWS_HASH = "#reviews";
export const UNIVERSITY_PUBLIC_OVERVIEW_HASH = "#overview";

export function resolveUniversityPublicSectionFromHash(hash = "") {
  const normalized = String(hash || "").trim().toLowerCase();
  if (normalized === UNIVERSITY_PUBLIC_REVIEWS_HASH) {
    return UNIVERSITY_PUBLIC_SECTIONS.reviews;
  }
  return UNIVERSITY_PUBLIC_SECTIONS.overview;
}

export function buildUniversityPublicSectionUrl(pathname, search = "", section) {
  const base = `${pathname}${search || ""}`;
  if (section === UNIVERSITY_PUBLIC_SECTIONS.reviews) {
    return `${base}${UNIVERSITY_PUBLIC_REVIEWS_HASH}`;
  }
  return `${base}${UNIVERSITY_PUBLIC_OVERVIEW_HASH}`;
}

export function readUniversityPublicSectionFromWindow() {
  if (typeof window === "undefined") {
    return UNIVERSITY_PUBLIC_SECTIONS.overview;
  }
  return resolveUniversityPublicSectionFromHash(window.location.hash);
}

export function scrollUniversityPublicSectionIntoView(section, { behavior = "smooth" } = {}) {
  if (typeof document === "undefined") {
    return;
  }
  const targetId =
    section === UNIVERSITY_PUBLIC_SECTIONS.reviews ? "reviews" : "university-overview-panel";
  const node = document.getElementById(targetId);
  if (!node) {
    return;
  }
  node.scrollIntoView({ behavior, block: "start" });
}
