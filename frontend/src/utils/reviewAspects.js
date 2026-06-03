export const REVIEW_ASPECTS = [
  { id: "rating_teachers", key: "teachers", label: "O'qituvchilar", icon: "👨‍🏫" },
  { id: "rating_dormitory", key: "dormitory", label: "Yotoqxona", icon: "🏠" },
  {
    id: "rating_infrastructure",
    key: "infrastructure",
    label: "Infratuzilma",
    icon: "🏛️",
  },
];

export function buildDefaultAspectRatings() {
  return {
    rating_teachers: 0,
    rating_dormitory: 0,
    rating_infrastructure: 0,
  };
}

export function getFilledReviewAspects(source) {
  if (!source) {
    return [];
  }
  return REVIEW_ASPECTS.filter((aspect) => (source[aspect.id] ?? source[aspect.key]) != null);
}

export function hasReviewAspectRatings(source) {
  return getFilledReviewAspects(source).length > 0;
}

export function aspectRatingsComplete(ratings) {
  return REVIEW_ASPECTS.every((aspect) => ratings[aspect.id] >= 1 && ratings[aspect.id] <= 5);
}

export function flattenReviewPayload({
  universityId,
  rating,
  aspectRatings,
  reviewText,
  studyDirectionId,
}) {
  const payload = {
    university_id: universityId,
    rating,
    text: reviewText.trim(),
    rating_teachers: aspectRatings.rating_teachers,
    rating_dormitory: aspectRatings.rating_dormitory,
    rating_infrastructure: aspectRatings.rating_infrastructure,
  };
  if (studyDirectionId) {
    payload.study_direction_id = studyDirectionId;
  }
  return payload;
}
