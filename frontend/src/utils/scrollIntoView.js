import { prefersReducedMotion } from "./prefersReducedMotion.js";

export function scrollElementIntoView(element, options = {}) {
  if (!element?.scrollIntoView) {
    return;
  }

  const { behavior = "smooth", block = "start", inline = "nearest" } = options;

  element.scrollIntoView({
    block,
    inline,
    behavior: prefersReducedMotion() ? "auto" : behavior,
  });
}
