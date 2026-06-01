export function buildMuteKey(userId, universityId = null) {
  return `${userId}:${universityId ?? "global"}`;
}

export function isChatUserMuted(mutedUserKeys, userId, scope, selectedUniversityId = null) {
  if (!userId) {
    return false;
  }

  if (mutedUserKeys.has(buildMuteKey(userId, null))) {
    return true;
  }

  if (scope === "group" && selectedUniversityId) {
    return mutedUserKeys.has(buildMuteKey(userId, selectedUniversityId));
  }

  return false;
}
