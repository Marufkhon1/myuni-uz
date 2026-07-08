import { describe, expect, it } from "vitest";
import {
  buildLeaderUniversityContext,
  buildPopularReviewStats,
  buildRatingDistribution,
} from "./popularReviewStats.js";

describe("popularReviewStats", () => {
  it("builds star distribution percentages", () => {
    const distribution = buildRatingDistribution([
      { rating: 5 },
      { rating: 5 },
      { rating: 4 },
    ]);

    expect(distribution.find((row) => row.stars === 5)?.percent).toBe(67);
    expect(distribution.find((row) => row.stars === 4)?.percent).toBe(33);
  });

  it("aggregates popular review stats", () => {
    const stats = buildPopularReviewStats([
      { rating: 5, like_count: 3, university: { id: 1 } },
      { rating: 4, like_count: 2, university: { id: 2 } },
    ]);

    expect(stats.count).toBe(2);
    expect(stats.totalLikes).toBe(5);
    expect(stats.averageRating).toBe(4.5);
    expect(stats.universityCount).toBe(2);
    expect(stats.distribution).toHaveLength(5);
    expect(stats.campusAffiliatedCount).toBe(0);
    expect(stats.verifiedCount).toBe(0);
    expect(stats.fiveStarPercent).toBe(50);
    expect(stats.topUniversity?.id).toBe(1);
  });

  it("counts campus affiliated reviews from either API field", () => {
    const stats = buildPopularReviewStats([
      { rating: 5, like_count: 1, university: { id: 1 }, campus_affiliated: true },
      { rating: 4, like_count: 1, university: { id: 2 }, is_verified_student: true },
      { rating: 3, like_count: 0, university: { id: 3 } },
    ]);

    expect(stats.campusAffiliatedCount).toBe(2);
    expect(stats.verifiedCount).toBe(2);
  });

  it("picks top university by helpful likes", () => {
    const stats = buildPopularReviewStats([
      { rating: 5, like_count: 1, university: { id: 1, name: "A" } },
      { rating: 5, like_count: 5, university: { id: 2, name: "B" } },
      { rating: 4, like_count: 2, university: { id: 2, name: "B" } },
    ]);

    expect(stats.topUniversity?.id).toBe(2);
  });
});

describe("buildLeaderUniversityContext", () => {
  const wiut = { id: 2, name: "WIUT", short_name: "WIUT", average_rating: 3.5, review_count: 40 };
  const tdiu = { id: 1, name: "TDIU", short_name: "TDIU", average_rating: 5, review_count: 12 };

  it("uses platform average for leader university", () => {
    const leader = { id: 10, rating: 5, university: wiut, like_count: 2 };
    const ctx = buildLeaderUniversityContext(
      [leader, { id: 11, rating: 4, university: tdiu, like_count: 3 }],
      leader,
      "likes"
    );

    expect(ctx.averageRating).toBe(3.5);
    expect(ctx.reviewCount).toBe(40);
    expect(ctx.usesPlatformStats).toBe(true);
  });

  it("follows active sort leader university", () => {
    const leader = { id: 11, rating: 4, university: tdiu, like_count: 1 };
    const ctx = buildLeaderUniversityContext(
      [{ id: 10, rating: 5, university: wiut, like_count: 2 }],
      leader,
      "newest"
    );

    expect(ctx.university.id).toBe(1);
    expect(ctx.averageRating).toBe(5);
  });

  it("falls back to leader rating when platform stats are missing", () => {
    const leader = { id: 10, rating: 4, university: { id: 3, name: "Test" }, like_count: 1 };
    const ctx = buildLeaderUniversityContext([leader], leader, "likes");

    expect(ctx.averageRating).toBe(4);
    expect(ctx.reviewCount).toBe(1);
    expect(ctx.usesPlatformStats).toBe(false);
  });
});
