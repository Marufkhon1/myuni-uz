import { hasMatchedUniversity } from "./universityMatch.js";

const STORAGE_KEY = "myuni_onboarding_v1_done";

export function isOnboardingComplete() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

export function markOnboardingComplete() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}

export function shouldOfferOnboarding({ profile, joinedChatCount, universities = [] }) {
  if (isOnboardingComplete()) {
    return false;
  }
  const hasName = Boolean(profile?.full_name?.trim());
  const hasUniversity = hasMatchedUniversity(universities, profile?.university);
  const hasJoinedChat = joinedChatCount > 0;
  return !hasName || !hasUniversity || !hasJoinedChat;
}

export function getInitialOnboardingStep({ profile, joinedChatCount, universities = [] }) {
  if (!profile?.full_name?.trim()) {
    return 0;
  }
  if (!hasMatchedUniversity(universities, profile?.university)) {
    return 1;
  }
  if (joinedChatCount === 0) {
    return 2;
  }
  return 0;
}
