import { useCallback, useEffect, useState } from "react";
import {
  getDirectThreads,
  getJoinedUniversityIds,
} from "@/services/chatService.js";
import { getPopularReviews, getUniversities } from "@/services/universityService.js";
import { matchUniversityByText } from "@/utils/universityMatch.js";

export function useDashboardData({
  profileUniversity,
  onLoadError,
  setSelectedUniversityId,
}) {
  const [universities, setUniversities] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [joinedUniversityIds, setJoinedUniversityIds] = useState(new Set());
  const [directThreads, setDirectThreads] = useState([]);
  const [popularReviews, setPopularReviews] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [universityList, joinedIds, threadList] = await Promise.all([
          getUniversities(),
          getJoinedUniversityIds(),
          getDirectThreads(),
        ]);

        let popularList = [];
        try {
          popularList = await getPopularReviews();
        } catch {
          // Mashhur sharhlar ixtiyoriy — asosiy kabinet yuklanishiga xalaqit bermasin
        }

        if (!isMounted) {
          return;
        }

        setUniversities(universityList);
        setJoinedUniversityIds(new Set(joinedIds));
        setDirectThreads(threadList);
        setPopularReviews(popularList);

        const defaultUniversity =
          matchUniversityByText(universityList, profileUniversity) ?? universityList[0];

        if (defaultUniversity) {
          setSelectedUniversityId?.((current) => current ?? defaultUniversity.id);
        }
      } catch {
        if (isMounted) {
          onLoadError?.();
        }
      } finally {
        if (isMounted) {
          setIsDataLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [profileUniversity, onLoadError, setSelectedUniversityId]);

  const refreshChatSummaries = useCallback(async () => {
    try {
      const [universityList, threadList] = await Promise.all([getUniversities(), getDirectThreads()]);
      setUniversities(universityList);
      setDirectThreads(threadList);
    } catch {
      // ignore polling errors
    }
  }, []);

  return {
    universities,
    setUniversities,
    isDataLoading,
    joinedUniversityIds,
    setJoinedUniversityIds,
    directThreads,
    setDirectThreads,
    popularReviews,
    setPopularReviews,
    refreshChatSummaries,
  };
}
