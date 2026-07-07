import { findUniversityById } from "@/utils/universityIds.js";
import { parseDashboardSectionFromPath } from "@/utils/navigation.js";

const DASHBOARD_SECTIONS = new Set([
  "home",
  "reviews",
  "chats",
  "compare",
  "popular",
  "profile",
  "favorites",
]);

export function resolveActiveSection(searchParams, sectionParam, pathname) {
  const fromPath = sectionParam || parseDashboardSectionFromPath(pathname);
  if (fromPath && DASHBOARD_SECTIONS.has(fromPath)) {
    return fromPath;
  }
  const panel = searchParams?.get?.("panel");
  if (panel === "reports") {
    return "profile";
  }
  const section = searchParams?.get?.("section");
  return DASHBOARD_SECTIONS.has(section) ? section : "home";
}

export function buildDeepLinkKey(searchParams) {
  return [
    searchParams.get("section") || "",
    searchParams.get("university_id") || "",
    searchParams.get("university") || "",
    searchParams.get("chat_panel") || "",
    searchParams.get("thread_id") || "",
    searchParams.get("panel") || "",
  ].join("|");
}

export function findUniversityUrlMatch(universities, universityIdParam, universityName) {
  const universityList = universities ?? [];
  let match = null;

  if (universityIdParam && universityList.length > 0) {
    match = findUniversityById(universityList, universityIdParam);
  }
  if (!match && universityName && universityList.length > 0) {
    match =
      universityList.find(
        (university) =>
          university.name === universityName || university.short_name === universityName
      ) ?? null;
  }

  return { match, canValidateUniversity: universityList.length > 0 };
}

export function resolveChatUrlState({
  section,
  chatPanel,
  threadIdParam,
  match,
  hasUniversityParam,
  canValidateUniversity,
}) {
  if (section !== "chats") {
    return {
      type: "leave_chats_section",
      selectedUniversityId: null,
      selectedThreadId: null,
      chatPanel: "group",
      mobileChatScreen: "list",
    };
  }

  if (chatPanel === "private" && threadIdParam) {
    const threadId = Number(threadIdParam);
    if (Number.isFinite(threadId) && threadId > 0) {
      return {
        type: "private_thread",
        chatListTab: "private",
        chatPanel: "private",
        selectedThreadId: threadId,
        mobileChatScreen: "chat",
      };
    }

    return {
      type: "invalid_private_thread",
      selectedThreadId: null,
      chatPanel: "group",
      mobileChatScreen: "list",
    };
  }

  if (match) {
    return {
      type: "group_university",
      selectedUniversityId: match.id,
      chatPanel: "group",
      selectedThreadId: null,
      mobileChatScreen: "chat",
    };
  }

  if (hasUniversityParam && canValidateUniversity) {
    return {
      type: "invalid_university_param",
      selectedUniversityId: null,
      selectedThreadId: null,
      chatPanel: "group",
      mobileChatScreen: "list",
    };
  }

  return { type: "preserve" };
}

export function resolveReviewsUrlState({
  section,
  match,
  hasUniversityParam,
  canValidateUniversity,
}) {
  if (section !== "reviews") {
    return {
      type: "leave_reviews_section",
      reviewUniversity: "",
      mobileReviewScreen: "list",
    };
  }

  if (match) {
    return {
      type: "select_university",
      reviewUniversity: String(match.id),
      mobileReviewScreen: "detail",
    };
  }

  if (hasUniversityParam && canValidateUniversity) {
    return {
      type: "invalid_university_param",
      reviewUniversity: "",
      mobileReviewScreen: "list",
    };
  }

  return { type: "preserve" };
}

export function resolveDashboardUrlState({
  section,
  universityIdParam,
  universityName,
  chatPanel,
  threadIdParam,
  universities,
}) {
  const hasUniversityParam = Boolean(universityIdParam || universityName);
  const { match, canValidateUniversity } = findUniversityUrlMatch(
    universities,
    universityIdParam,
    universityName
  );

  return {
    chat: resolveChatUrlState({
      section,
      chatPanel,
      threadIdParam,
      match,
      hasUniversityParam,
      canValidateUniversity,
    }),
    reviews: resolveReviewsUrlState({
      section,
      match,
      hasUniversityParam,
      canValidateUniversity,
    }),
  };
}

export function applyChatUrlState(patch, setters) {
  const {
    setSelectedUniversityId,
    setSelectedThreadId,
    setChatPanel,
    setMobileChatScreen,
    setChatListTab,
  } = setters;

  if (patch.type === "preserve") {
    return;
  }

  if (patch.type === "leave_chats_section" || patch.type === "invalid_university_param") {
    setSelectedUniversityId?.(patch.selectedUniversityId);
    setSelectedThreadId?.(patch.selectedThreadId);
    setChatPanel(patch.chatPanel);
    setMobileChatScreen(patch.mobileChatScreen);
    return;
  }

  if (patch.type === "invalid_private_thread") {
    setSelectedThreadId?.(patch.selectedThreadId);
    setChatPanel(patch.chatPanel);
    setMobileChatScreen(patch.mobileChatScreen);
    return;
  }

  if (patch.type === "private_thread") {
    setChatListTab?.(patch.chatListTab);
    setChatPanel(patch.chatPanel);
    setSelectedThreadId?.(patch.selectedThreadId);
    setMobileChatScreen(patch.mobileChatScreen);
    return;
  }

  if (patch.type === "group_university") {
    setSelectedUniversityId(patch.selectedUniversityId);
    setChatPanel(patch.chatPanel);
    setSelectedThreadId?.(patch.selectedThreadId);
    setMobileChatScreen(patch.mobileChatScreen);
  }
}

export function applyReviewsUrlState(patch, setters) {
  const { setReviewUniversity, setMobileReviewScreen } = setters;

  if (patch.type === "preserve") {
    return;
  }

  setReviewUniversity(patch.reviewUniversity);
  setMobileReviewScreen(patch.mobileReviewScreen);
}

export function applyDashboardUrlState({
  section,
  universityIdParam,
  universityName,
  chatPanel,
  threadIdParam,
  universities,
  chatSetters,
  reviewSetters,
}) {
  const { chat, reviews } = resolveDashboardUrlState({
    section,
    universityIdParam,
    universityName,
    chatPanel,
    threadIdParam,
    universities,
  });

  applyChatUrlState(chat, chatSetters);
  applyReviewsUrlState(reviews, reviewSetters);
}
