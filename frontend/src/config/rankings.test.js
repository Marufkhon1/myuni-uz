import { describe, expect, it } from "vitest";
import {
  CURRENT_RANKING_YEAR,
  isSupportedRankingYear,
  rankingsYearPath,
  RANKINGS_MIN_REVIEWS,
  RANKINGS_PATH,
} from "./rankings.js";

describe("rankings config", () => {
  it("exposes current live year path", () => {
    expect(RANKINGS_PATH).toBe("/reyting");
    expect(rankingsYearPath()).toBe(`/reyting/${CURRENT_RANKING_YEAR}`);
    expect(isSupportedRankingYear(CURRENT_RANKING_YEAR)).toBe(true);
    expect(isSupportedRankingYear(1999)).toBe(false);
  });

  it("requires medium+ confidence floor for table inclusion", () => {
    expect(RANKINGS_MIN_REVIEWS).toBe(3);
  });
});
