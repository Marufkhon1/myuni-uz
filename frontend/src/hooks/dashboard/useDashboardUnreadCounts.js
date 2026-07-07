import { useMemo } from "react";
import { joinedUniversityIdsHas } from "@/utils/universityIds.js";

export function useDashboardUnreadCounts({ directThreads, universities, joinedUniversityIds }) {
  const totalPrivateUnread = useMemo(
    () => directThreads.reduce((sum, thread) => sum + (thread.unread_count ?? 0), 0),
    [directThreads]
  );

  const totalJoinedUnread = useMemo(
    () =>
      universities.reduce((sum, university) => {
        if (!joinedUniversityIdsHas(joinedUniversityIds, university.id)) {
          return sum;
        }
        return sum + (university.unread_count ?? 0);
      }, 0),
    [universities, joinedUniversityIds]
  );

  return {
    totalPrivateUnread,
    totalJoinedUnread,
  };
}
