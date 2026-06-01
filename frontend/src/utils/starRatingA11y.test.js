import { describe, expect, it } from "vitest";
import { formatStarFilterLabel, formatStarRatingLabel } from "./starRatingA11y.js";

describe("formatStarRatingLabel", () => {
  it("formats whole and decimal ratings", () => {
    expect(formatStarRatingLabel(4)).toBe("4 dan 5 yulduz");
    expect(formatStarRatingLabel(4.5)).toBe("4.5 dan 5 yulduz");
  });

  it("returns empty label when rating is missing", () => {
    expect(formatStarRatingLabel(null)).toBe("Baho berilmagan");
    expect(formatStarRatingLabel(undefined, { emptyLabel: "Bahosiz" })).toBe("Bahosiz");
  });
});

describe("formatStarFilterLabel", () => {
  it("describes rating filters for screen readers", () => {
    expect(formatStarFilterLabel("all")).toBe("Barcha baholar");
    expect(formatStarFilterLabel("5")).toBe("5 yulduzli sharhlar");
  });
});
