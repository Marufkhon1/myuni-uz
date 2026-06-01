import { describe, expect, it } from "vitest";
import { buildAboutStats, buildSocialProofHighlights, excerptReviewText, formatLandingStat, formatLandingRating } from "./landingStats.js";

describe("landingStats", () => {
  it("formats numbers for uz locale", () => {
    expect(formatLandingStat(1280)).toBe("1 280");
  });

  it("formats rating when available", () => {
    expect(formatLandingRating(4.567)).toBe("4.6");
    expect(formatLandingRating(null)).toBeNull();
  });

  it("builds about stats from live counters", () => {
    const facts = buildAboutStats({
      university_count: 3,
      review_count: 10,
      member_count: 20,
      chat_member_count: 5,
    });
    expect(facts).toHaveLength(4);
  });

  it("builds social proof highlights from stats", () => {
    const highlights = buildSocialProofHighlights({
      reviews_last_7_days: 12,
      new_members_last_7_days: 5,
      chat_member_count: 40,
    });
    expect(highlights).toHaveLength(3);
    expect(highlights[0].label).toContain("7 kunda");
  });

  it("excerpts long review text", () => {
    const longText = "a".repeat(200);
    expect(excerptReviewText(longText, 160)).toHaveLength(160);
    expect(excerptReviewText(longText, 160).endsWith("…")).toBe(true);
  });
});
