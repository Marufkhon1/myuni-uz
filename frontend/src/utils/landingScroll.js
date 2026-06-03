import { LANDING_NAV_SCROLL_OFFSET } from "./landingNav.js";
import { prefersReducedMotion } from "./prefersReducedMotion.js";

/** Bosh sahifa bo'limlariga scroll (#universities va hokazo). */
export function scrollToLandingSection(hashOrId) {
  const id = String(hashOrId || "").replace(/^#/, "");
  if (!id) {
    return false;
  }
  const element = document.getElementById(id);
  if (!element) {
    return false;
  }
  const headerOffset = LANDING_NAV_SCROLL_OFFSET;
  const top = element.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
  return true;
}
