import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createReview,
  deleteReview,
  getUniversityDetail,
  getReviews,
  toggleReviewLike,
} from "@/services/universityService.js";
import {
  aspectRatingsComplete,
  buildDefaultAspectRatings,
  flattenReviewPayload,
} from "@/utils/reviewAspects.js";
import { getApiErrorMessage } from "@/utils/apiErrors.js";

export function useReviews({
  isStudent,
  activeSection,
  universities,
  onReviewLikeUpdate,
  onReviewSubmitted,
}) {
  const [reviewUniversity, setReviewUniversity] = useState("");
  const [reviewUniversityDetail, setReviewUniversityDetail] = useState(null);
  const [reviewUniversitySearch, setReviewUniversitySearch] = useState("");
  const [isReviewDetailLoading, setIsReviewDetailLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [aspectRatings, setAspectRatings] = useState(buildDefaultAspectRatings);
  const [studyDirectionId, setStudyDirectionId] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState("");
  const [mobileReviewScreen, setMobileReviewScreen] = useState("list");

  const filteredReviewUniversities = useMemo(() => {
    const query = reviewUniversitySearch.trim().toLowerCase();
    if (!query) {
      return universities;
    }
    return universities.filter((item) => {
      const name = `${item.name || ""} ${item.short_name || ""} ${item.location || ""}`.toLowerCase();
      return name.includes(query);
    });
  }, [universities, reviewUniversitySearch]);

  useEffect(() => {
    if (!reviewUniversity || activeSection !== "reviews") {
      return undefined;
    }

    let cancelled = false;

    async function loadReviewUniversityData() {
      try {
        setIsReviewDetailLoading(true);
        const [detail, universityReviews] = await Promise.all([
          getUniversityDetail(reviewUniversity),
          getReviews(reviewUniversity),
        ]);
        if (!cancelled) {
          setReviewUniversityDetail(detail);
          setReviews(universityReviews);
        }
      } catch {
        if (!cancelled) {
          setReviewUniversityDetail(null);
          setReviews([]);
        }
      } finally {
        if (!cancelled) {
          setIsReviewDetailLoading(false);
        }
      }
    }

    loadReviewUniversityData();
    return () => {
      cancelled = true;
    };
  }, [reviewUniversity, activeSection]);

  const resetReviewComposeForm = useCallback(() => {
    setRating(0);
    setAspectRatings(buildDefaultAspectRatings());
    setStudyDirectionId("");
    setReviewText("");
    setReviewUniversityDetail(null);
    setReviews([]);
  }, []);

  const selectReviewUniversity = useCallback(
    (universityId) => {
      const nextId = String(universityId);
      if (reviewUniversity === nextId) {
        setMobileReviewScreen("detail");
        setReviewSubmitError("");
        return;
      }
      resetReviewComposeForm();
      setReviewUniversity(nextId);
      setMobileReviewScreen("detail");
      setReviewSubmitError("");
    },
    [reviewUniversity, resetReviewComposeForm]
  );

  const backToReviewList = useCallback(() => {
    setMobileReviewScreen("list");
  }, []);

  const handleAspectChange = useCallback((field, value) => {
    setAspectRatings((current) => ({ ...current, [field]: value }));
  }, []);

  const handleReviewLike = useCallback(async (reviewId) => {
    const result = await toggleReviewLike(reviewId);
    const updateItem = (item) =>
      item.id === reviewId
        ? {
            ...item,
            liked_by_me: result.liked,
            like_count: result.like_count,
            helpful_count: result.like_count,
          }
        : item;
    setReviews((current) => current.map(updateItem));
    onReviewLikeUpdate?.(updateItem);
    return updateItem;
  }, [onReviewLikeUpdate]);

  const handleDeleteReview = useCallback(
    async (reviewId) => {
      try {
        await deleteReview(reviewId);
        setReviews((current) => current.filter((item) => item.id !== reviewId));
        if (reviewUniversity) {
          const detail = await getUniversityDetail(reviewUniversity);
          setReviewUniversityDetail(detail);
        }
      } catch (requestError) {
        const message = getApiErrorMessage(
          requestError,
          "Sharhni o'chirib bo'lmadi. Qayta urinib ko'ring."
        );
        setReviewSubmitError(message);
        throw requestError;
      }
    },
    [reviewUniversity]
  );

  const submitReview = useCallback(
    async (event) => {
      event.preventDefault();
      if (
        !isStudent ||
        !reviewUniversity ||
        rating === 0 ||
        !reviewText.trim() ||
        !aspectRatingsComplete(aspectRatings)
      ) {
        return;
      }
      setIsReviewSubmitting(true);
      setReviewSubmitError("");
      try {
        const payload = flattenReviewPayload({
          universityId: Number(reviewUniversity),
          rating,
          aspectRatings,
          reviewText,
          studyDirectionId: studyDirectionId ? Number(studyDirectionId) : null,
        });
        const nextReview = await createReview(payload);
        setReviews((current) => [
          { ...nextReview, like_count: 0, helpful_count: 0, liked_by_me: false },
          ...current,
        ]);
        setRating(0);
        setAspectRatings(buildDefaultAspectRatings());
        setStudyDirectionId("");
        setReviewText("");
        const detail = await getUniversityDetail(reviewUniversity);
        setReviewUniversityDetail(detail);
        onReviewSubmitted?.(nextReview);
        return nextReview;
      } catch (requestError) {
        setReviewSubmitError(
          getApiErrorMessage(requestError, "Sharh yuborilmadi. Qayta urinib ko'ring.")
        );
      } finally {
        setIsReviewSubmitting(false);
      }
    },
    [
      isStudent,
      reviewUniversity,
      rating,
      aspectRatings,
      reviewText,
      studyDirectionId,
      onReviewSubmitted,
    ]
  );

  return {
    reviewUniversity,
    setReviewUniversity,
    reviewUniversityDetail,
    reviewUniversitySearch,
    setReviewUniversitySearch,
    isReviewDetailLoading,
    rating,
    setRating,
    aspectRatings,
    handleAspectChange,
    studyDirectionId,
    setStudyDirectionId,
    reviewText,
    setReviewText,
    reviews,
    setReviews,
    isReviewSubmitting,
    reviewSubmitError,
    mobileReviewScreen,
    setMobileReviewScreen,
    filteredReviewUniversities,
    selectReviewUniversity,
    backToReviewList,
    handleReviewLike,
    handleDeleteReview,
    submitReview,
  };
}
