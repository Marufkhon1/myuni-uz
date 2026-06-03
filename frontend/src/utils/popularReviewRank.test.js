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

  it("returns accent metadata for top 3 only", () => {
    expect(getPopularRankStyles(2)?.accentBar).toContain("slate");
    expect(getPopularRankStyles(3)?.accentBar).toContain("amber");
    expect(getPopularRankStyles(1)?.accentBar).toContain("amber");
  });

  it("returns null from rank 4", () => {
    expect(getPopularRankStyles(4)).toBeNull();
    expect(getPopularRankStyles(10)).toBeNull();
  });
});
