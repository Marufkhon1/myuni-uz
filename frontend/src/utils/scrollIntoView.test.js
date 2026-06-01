import { describe, expect, it, vi } from "vitest";
import { scrollElementIntoView } from "./scrollIntoView.js";

describe("scrollElementIntoView", () => {
  it("uses auto scroll when reduced motion is preferred", () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const element = {
      scrollIntoView: vi.fn(),
    };

    scrollElementIntoView(element, { block: "center" });

    expect(element.scrollIntoView).toHaveBeenCalledWith({
      block: "center",
      inline: "nearest",
      behavior: "auto",
    });
  });
});
