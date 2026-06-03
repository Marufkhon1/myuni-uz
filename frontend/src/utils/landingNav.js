const DEFAULT_HASH = "#home";

/** Navbar balandligi + kichik zaxira (scroll-spy chizig'i). */
export const LANDING_NAV_SCROLL_OFFSET = 80;

export function normalizeNavHash(value) {
  if (!value) {
    return DEFAULT_HASH;
  }
  return value.startsWith("#") ? value : `#${value}`;
}

function getSectionDocumentTop(element) {
  return element.getBoundingClientRect().top + window.scrollY;
}

/**
 * Scroll anchor pozitsiyasiga qarab aktiv hash (DOMsiz — test uchun).
 */
export function pickActiveSectionByAnchor(sections, scrollY, scrollOffset = LANDING_NAV_SCROLL_OFFSET) {
  if (!sections.length) {
    return DEFAULT_HASH;
  }

  const sorted = [...sections].sort((a, b) => a.top - b.top);
  const anchor = scrollY + scrollOffset;
  let active = sorted[0].hash;

  for (const section of sorted) {
    if (anchor >= section.top - 2) {
      active = section.hash;
    }
  }

  return active;
}

/**
 * Scroll yo'nalishidan qat'i nazar aktiv bo'limni aniqlash (scroll-spy).
 * Oxirgi bo'limga yetganda pastki section ham to'g'ri belgilanadi.
 */
export function resolveActiveSectionFromScroll(sectionIds, scrollOffset = LANDING_NAV_SCROLL_OFFSET) {
  const sections = sectionIds
    .map((hash) => {
      const id = hash.replace(/^#/, "");
      const element = document.getElementById(id);
      if (!element) {
        return null;
      }
      return { hash: normalizeNavHash(hash), top: getSectionDocumentTop(element) };
    })
    .filter(Boolean)
    .sort((a, b) => a.top - b.top);

  if (sections.length === 0) {
    return DEFAULT_HASH;
  }

  const scrollY = window.scrollY;
  const viewportBottom = scrollY + window.innerHeight;
  const docBottom = document.documentElement.scrollHeight;

  if (viewportBottom >= docBottom - 48) {
    return sections[sections.length - 1].hash;
  }

  return pickActiveSectionByAnchor(sections, scrollY, scrollOffset);
}
