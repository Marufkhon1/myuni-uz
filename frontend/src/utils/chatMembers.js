import { sameUniversityId } from "@/utils/universityIds.js";

const EMPTY_CHAT_MEMBERS = { universityId: null, members: [], member_count: 0 };

export function buildOptimisticChatMembers(universityId, universities, findUniversityById) {
  const university = findUniversityById(universities, universityId);
  return {
    universityId,
    members: [],
    member_count: university?.member_count ?? 0,
  };
}

export function resolveActiveChatMembers({
  selectedUniversityId,
  chatPanel,
  chatMembers = EMPTY_CHAT_MEMBERS,
  displayedGroupUniversity,
}) {
  if (!selectedUniversityId || chatPanel !== "group") {
    return { members: [], member_count: 0 };
  }

  const fallbackCount = displayedGroupUniversity?.member_count ?? 0;
  const membersBelongToSelection = sameUniversityId(chatMembers.universityId, selectedUniversityId);

  if (membersBelongToSelection) {
    return {
      members: chatMembers.members,
      member_count: chatMembers.member_count > 0 ? chatMembers.member_count : fallbackCount,
    };
  }

  return {
    members: [],
    member_count: fallbackCount,
  };
}
