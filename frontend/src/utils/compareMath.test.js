import { describe, expect, it } from "vitest";
import {
  buildCompareSummary,
  compareSlotGridClass,
  computeWinCounts,
  getCompareLeader,
  isValidCompareCount,
  MAX_COMPARE,
  MIN_COMPARE,
  numericWinner,
  orderCompareUniversities,
  orderCompareUniversitiesWithLeaderCenter,
  resolveCompareHighlight,
  rowHasDifference,
  relativeBarPercents,
  winSharePercent,
} from "./compareMath.js";

describe("compareMath", () => {
  const universities = [
    {
      id: 1,
      short_name: "WIUT",
      average_rating: 5,
      review_count: 10,
      member_count: 100,
      aspect_averages: { teachers: 4.5, dormitory: 4, infrastructure: 4 },
    },
    {
      id: 2,
      short_name: "INHA",
      average_rating: 4,
      review_count: 20,
      member_count: 50,
      aspect_averages: { teachers: 3, dormitory: 3.5, infrastructure: 3 },
    },
    {
      id: 3,
      short_name: "TDIU",
      average_rating: 4,
      review_count: 5,
      member_count: 80,
      aspect_averages: { teachers: 3, dormitory: 3, infrastructure: 3.5 },
    },
  ];

  it("allows 2–4 universities only", () => {
    expect(MIN_COMPARE).toBe(2);
    expect(MAX_COMPARE).toBe(4);
    expect(isValidCompareCount(1)).toBe(false);
    expect(isValidCompareCount(2)).toBe(true);
    expect(isValidCompareCount(3)).toBe(true);
    expect(isValidCompareCount(4)).toBe(true);
    expect(isValidCompareCount(5)).toBe(false);
  });

  it("builds responsive slot grids for 2–4 columns", () => {
    expect(compareSlotGridClass(2)).toContain("sm:grid-cols-2");
    expect(compareSlotGridClass(3)).toContain("sm:grid-cols-3");
    expect(compareSlotGridClass(4)).toContain("lg:grid-cols-4");
  });

  it("orders universities by selected ids", () => {
    const ordered = orderCompareUniversities(universities, ["3", "1", "2"]);
    expect(ordered.map((item) => item.id)).toEqual([3, 1, 2]);
  });

  it("places leader in center column only for three universities", () => {
    const ordered = orderCompareUniversitiesWithLeaderCenter(universities, 1, ["3", "1", "2"]);
    expect(ordered.map((item) => item.id)).toEqual([3, 1, 2]);
    const fromEnd = orderCompareUniversitiesWithLeaderCenter(universities, 2, ["1", "3", "2"]);
    expect(fromEnd.map((item) => item.id)).toEqual([1, 2, 3]);

    const pair = universities.slice(0, 2);
    const pairOrdered = orderCompareUniversitiesWithLeaderCenter(pair, 2, ["1", "2"]);
    expect(pairOrdered.map((item) => item.id)).toEqual([1, 2]);
  });

  it("resolves highlight fallback for all three metrics", () => {
    expect(resolveCompareHighlight(universities, {}, "rating").state).toBe("winner");
    expect(resolveCompareHighlight(universities, {}, "reviews").university_id).toBe(2);
    expect(resolveCompareHighlight(universities, { reviews: null }, "chat_activity").university_id).toBe(1);
  });

  it("picks numeric winner index", () => {
    expect(numericWinner([4, 2, 3])).toBe(0);
    expect(numericWinner([4, 4, 3])).toBeNull();
  });

  it("distributes wins across multiple metrics", () => {
    const counts = computeWinCounts(universities);
    expect(counts[1]).toBeGreaterThan(0);
    expect(counts[2]).toBeGreaterThan(0);
    expect(Object.values(counts).reduce((sum, value) => sum + value, 0)).toBeGreaterThan(1);
  });

  it("builds summary with decided rows and fair win share", () => {
    const summary = buildCompareSummary(universities);
    expect(summary.decidedRows).toBeGreaterThan(0);
    expect(summary.leader?.university).toBeTruthy();
    const wiutWins = summary.winCounts[1];
    expect(winSharePercent(wiutWins, summary.decidedRows)).toBeLessThanOrEqual(100);
    if (wiutWins < summary.decidedRows) {
      expect(winSharePercent(wiutWins, summary.decidedRows)).toBeLessThan(100);
    }
  });

  it("builds summary for two universities", () => {
    const summary = buildCompareSummary(universities.slice(0, 2));
    expect(summary.leader?.university).toBeTruthy();
    expect(Object.keys(summary.winCounts)).toHaveLength(2);
  });

  it("uses composite score when all row wins tie", () => {
    const tied = universities.map((university) => ({
      ...university,
      average_rating: 4,
      review_count: 10,
      member_count: 50,
      aspect_averages: { teachers: 4, dormitory: 4, infrastructure: 4 },
    }));
    const summary = buildCompareSummary(tied);
    expect(summary.decidedRows).toBe(0);
    expect(summary.leader?.compositeScore).toBeDefined();
    expect(summary.leaderSource).toMatch(/composite/);
  });

  it("returns leader from university metrics", () => {
    const leader = getCompareLeader(universities);
    expect(leader?.university.id).toBeTruthy();
  });

  it("detects row differences", () => {
    expect(rowHasDifference([4, 4, 3])).toBe(true);
    expect(rowHasDifference([4, 4, 4])).toBe(false);
  });

  it("computes relative bar percents", () => {
    expect(relativeBarPercents([10, 5, 20])).toEqual([50, 25, 100]);
  });
});
