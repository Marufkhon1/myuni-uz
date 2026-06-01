import { describe, expect, it } from "vitest";
import { getPopularRankStyles } from "./popularReviewRank.js";

describe("getPopularRankStyles", () => {
  it("returns gold card for rank 1", () => {
    const styles = getPopularRankStyles(1);
    expect(styles.label).toBe("#1 mashhur");
    expect(styles.badge).toContain("amber");
    expect(styles.card).toContain("amber");
    expect(styles.ratingTray).toBeUndefined();
  });

  it("returns silver card for rank 2", () => {
    const styles = getPopularRankStyles(2);
    expect(styles.label).toBe("#2 mashhur");
    expect(styles.card).toContain("slate");
  });

  it("returns bronze card for rank 3", () => {
    const styles = getPopularRankStyles(3);
    expect(styles.label).toBe("#3 mashhur");
    expect(styles.card).toContain("orange");
  });

  it("returns standard card from rank 4", () => {
    const styles = getPopularRankStyles(4);
    expect(styles.label).toBe("#4 mashhur");
    expect(styles.card).toContain("bg-white");
  });
});
