/** Mashhur sharhlar — Niche / Unigo uslubidagi statistika. */

export const SORT_LEADER_LABELS = {
  likes: "Eng foydali sharh",
  rating: "Eng yuqori baho",
  newest: "Eng yangi sharh",
};

export function buildRatingDistribution(reviews) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  for (const review of reviews) {
    const star = Number(review.rating);
    if (counts[star] != null) {
      counts[star] += 1;
    }
  }

  const total = reviews.length || 1;

  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: counts[stars],
    percent: Math.round((counts[stars] / total) * 100),
  }));
}

function pickTopUniversity(reviews) {
  const byId = new Map();

  for (const review of reviews) {
    const university = review.university;
    if (!university?.id) {
      continue;
    }

    const current = byId.get(university.id) ?? { university, reviews: 0, likes: 0 };
    current.reviews += 1;
    current.likes += review.like_count ?? 0;
    byId.set(university.id, current);
  }

  let leader = null;
  for (const entry of byId.values()) {
    if (
      !leader ||
      entry.likes > leader.likes ||
      (entry.likes === leader.likes && entry.reviews > leader.reviews)
    ) {
      leader = entry;
    }
  }

  return leader?.university ?? null;
}

export function buildPopularReviewStats(reviews) {
  const totalLikes = reviews.reduce((sum, item) => sum + (item.like_count ?? 0), 0);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, item) => sum + (item.rating ?? 0), 0) / reviews.length
      : null;

  const universityIds = new Set(reviews.map((review) => review.university?.id).filter(Boolean));
  const distribution = buildRatingDistribution(reviews);
  const fiveStarRow = distribution.find((row) => row.stars === 5);

  return {
    count: reviews.length,
    totalLikes,
    averageRating: averageRating != null ? Number(averageRating.toFixed(1)) : null,
    universityCount: universityIds.size,
    verifiedCount: reviews.filter((item) => item.is_verified_student).length,
    fiveStarPercent: reviews.length > 0 ? fiveStarRow?.percent ?? 0 : null,
    topUniversity: pickTopUniversity(reviews),
    distribution,
  };
}

/** Yetakchi sharh OTM'i — platforma o'rtachasi + mashhur lenta bo'yicha taqsimot. */
export function buildLeaderUniversityContext(allReviews, leaderReview, sortId = "likes") {
  if (!leaderReview?.university?.id) {
    return null;
  }

  const university = leaderReview.university;
  const feedReviews = allReviews.filter((item) => item.university?.id === university.id);
  const feedStats = buildPopularReviewStats(feedReviews);
  const platformAverage =
    university.average_rating != null && university.average_rating !== ""
      ? Number(university.average_rating)
      : null;
  const platformCount =
    university.review_count != null && university.review_count !== ""
      ? Number(university.review_count)
      : null;
  const leaderRating =
    leaderReview.rating != null && leaderReview.rating !== ""
      ? Number(leaderReview.rating)
      : null;

  const averageRating = platformAverage ?? feedStats.averageRating ?? leaderRating;
  const reviewCount = platformCount ?? feedStats.count ?? (averageRating != null ? 1 : 0);

  return {
    university,
    sortId,
    sortLabel: SORT_LEADER_LABELS[sortId] ?? SORT_LEADER_LABELS.likes,
    leaderReview,
    averageRating,
    reviewCount,
    fiveStarPercent: feedStats.fiveStarPercent,
    distribution: feedStats.distribution,
    feedReviewCount: feedStats.count,
    usesPlatformStats: platformAverage != null,
  };
}
