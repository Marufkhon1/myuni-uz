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
  const headerOffset = 88;
  const top = element.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
  return true;
}
