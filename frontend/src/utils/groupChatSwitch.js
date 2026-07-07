import { joinedUniversityIdsHas } from "@/utils/universityIds.js";
import { maxMessageId } from "@/hooks/useMessageStream.js";

export function groupChatCacheKey(universityId, tag = "") {
  return `${universityId}:${tag || ""}`;
}

export function resolveGroupChatSwitch({ universityId, cache, joinedUniversityIds }) {
  if (!universityId) {
    return null;
  }

  const cacheKey = groupChatCacheKey(universityId, "");
  const cached = cache.get(cacheKey);
  const isJoined = joinedUniversityIdsHas(joinedUniversityIds, universityId);

  if (cached) {
    return {
      cacheKey,
      cacheHit: true,
      messages: cached.messages,
      pinned: cached.pinned,
      messagesUniversityKey: cacheKey,
      streamReady: isJoined,
      streamSinceId: isJoined ? maxMessageId(cached.messages) : null,
      clearTyping: true,
    };
  }

  return {
    cacheKey,
    cacheHit: false,
    messages: [],
    pinned: null,
    messagesUniversityKey: null,
    streamReady: false,
    streamSinceId: null,
    clearTyping: true,
  };
}
