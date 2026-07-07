import { useMemo } from "react";
import { findUniversityById, joinedUniversityIdsHas } from "@/utils/universityIds.js";

export function useDashboardChatLists({
  universities,
  joinedUniversityIds,
  selectedUniversityId,
  directThreads,
  selectedThreadId,
  draftThread,
  chatListTab,
  universitySearch,
}) {
  const selectedUniversity = useMemo(
    () =>
      selectedUniversityId != null
        ? findUniversityById(universities, selectedUniversityId)
        : universities[0] ?? null,
    [universities, selectedUniversityId]
  );

  const hasJoinedSelectedChat = useMemo(
    () =>
      selectedUniversityId
        ? joinedUniversityIdsHas(joinedUniversityIds, selectedUniversityId)
        : false,
    [selectedUniversityId, joinedUniversityIds]
  );

  const selectedThread = useMemo(
    () =>
      directThreads.find((thread) => thread.id === selectedThreadId) ??
      (draftThread?.id === selectedThreadId ? draftThread : null),
    [directThreads, selectedThreadId, draftThread]
  );

  const privateThreadList = useMemo(() => {
    const items = [...directThreads];
    if (draftThread && !items.some((thread) => thread.id === draftThread.id)) {
      items.unshift({ ...draftThread, is_draft: true });
    }
    return items;
  }, [directThreads, draftThread]);

  const filteredUniversities = useMemo(() => {
    const query = universitySearch.trim().toLowerCase();
    let list = universities;

    if (chatListTab === "joined") {
      list = list.filter((university) => joinedUniversityIdsHas(joinedUniversityIds, university.id));
    }

    if (query) {
      list = list.filter(
        (university) =>
          university.name.toLowerCase().includes(query) ||
          university.short_name?.toLowerCase().includes(query) ||
          university.location?.toLowerCase().includes(query)
      );
    }

    return list;
  }, [universities, chatListTab, joinedUniversityIds, universitySearch]);

  return {
    selectedUniversity,
    hasJoinedSelectedChat,
    selectedThread,
    privateThreadList,
    filteredUniversities,
  };
}
