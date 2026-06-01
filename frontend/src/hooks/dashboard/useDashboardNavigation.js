import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { trackDashboardSection } from "../../lib/analytics.js";
import { markApplicantChecklistStep } from "../../utils/applicantChecklist.js";
import { findUniversityById } from "../../utils/universityIds.js";

const DASHBOARD_SECTIONS = new Set(["home", "reviews", "chats", "compare", "popular", "profile"]);

function resolveActiveSection(searchParams) {
  const panel = searchParams.get("panel");
  if (panel === "reports") {
    return "profile";
  }
  const section = searchParams.get("section");
  return DASHBOARD_SECTIONS.has(section) ? section : "home";
}

function buildDeepLinkKey(searchParams) {
  return [
    searchParams.get("section") || "",
    searchParams.get("university_id") || "",
    searchParams.get("university") || "",
    searchParams.get("chat_panel") || "",
    searchParams.get("thread_id") || "",
    searchParams.get("panel") || "",
  ].join("|");
}

export function useDashboardNavigation({
  universities,
  setReviewUniversity,
  setMobileReviewScreen,
  setSelectedUniversityId,
  setSelectedThreadId,
  setChatPanel,
  setMobileChatScreen,
  setChatListTab,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = useMemo(() => resolveActiveSection(searchParams), [searchParams]);
  const deepLinkKey = useMemo(() => buildDeepLinkKey(searchParams), [searchParams]);
  const universitiesRef = useRef(universities);
  universitiesRef.current = universities;

  const syncSectionInUrl = useCallback(
    (sectionId, { universityId, threadId, chatPanel } = {}, { replace = false } = {}) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set("section", sectionId);

          if (universityId != null) {
            next.set("university_id", String(universityId));
          } else if (sectionId !== "chats" && sectionId !== "reviews") {
            next.delete("university_id");
            next.delete("university");
          }

          if (chatPanel === "private" && threadId != null) {
            next.set("chat_panel", "private");
            next.set("thread_id", String(threadId));
          } else if (sectionId === "chats" && chatPanel !== "private") {
            next.delete("chat_panel");
            next.delete("thread_id");
          } else if (sectionId !== "chats") {
            next.delete("chat_panel");
            next.delete("thread_id");
          }

          return next;
        },
        { replace }
      );
    },
    [setSearchParams]
  );

  const applyUrlToDashboardState = useCallback(() => {
    const section = searchParams.get("section") || "home";
    const universityName = searchParams.get("university");
    const universityIdParam = searchParams.get("university_id");
    const chatPanel = searchParams.get("chat_panel");
    const threadIdParam = searchParams.get("thread_id");
    const universityList = universitiesRef.current;

    let match = null;
    if (universityIdParam && universityList.length > 0) {
      match = findUniversityById(universityList, universityIdParam);
    }
    if (!match && universityName && universityList.length > 0) {
      match = universityList.find(
        (university) =>
          university.name === universityName || university.short_name === universityName
      );
    }

    if (section === "chats") {
      if (chatPanel === "private" && threadIdParam) {
        const threadId = Number(threadIdParam);
        if (Number.isFinite(threadId) && threadId > 0) {
          setChatListTab?.("private");
          setChatPanel("private");
          setSelectedThreadId?.(threadId);
          setMobileChatScreen("chat");
        }
      } else if (match) {
        setSelectedUniversityId(match.id);
        setChatPanel("group");
        setSelectedThreadId?.(null);
        setMobileChatScreen("chat");
      } else {
        setSelectedUniversityId?.(null);
        setSelectedThreadId?.(null);
        setChatPanel("group");
        setMobileChatScreen("list");
      }
    } else {
      setSelectedUniversityId?.(null);
      setSelectedThreadId?.(null);
      setChatPanel("group");
      setMobileChatScreen("list");
    }

    if (section === "reviews" && match) {
      setReviewUniversity(String(match.id));
      setMobileReviewScreen("detail");
    } else if (section !== "reviews") {
      setReviewUniversity("");
      setMobileReviewScreen("list");
    } else {
      setReviewUniversity("");
      setMobileReviewScreen("list");
    }
  }, [
    searchParams,
    setReviewUniversity,
    setMobileReviewScreen,
    setSelectedUniversityId,
    setSelectedThreadId,
    setChatPanel,
    setMobileChatScreen,
    setChatListTab,
  ]);

  useEffect(() => {
    applyUrlToDashboardState();
  }, [deepLinkKey, universities.length, applyUrlToDashboardState]);

  const changeSection = useCallback(
    (sectionId, { replace = false } = {}) => {
      syncSectionInUrl(sectionId, {}, { replace });
      trackDashboardSection(sectionId);
      if (sectionId === "reviews" || sectionId === "popular") {
        markApplicantChecklistStep("reviews");
      }
      if (sectionId === "compare") {
        markApplicantChecklistStep("compare");
      }
    },
    [syncSectionInUrl]
  );

  const syncChatUniversityInUrl = useCallback(
    (universityId, { replace = false } = {}) => {
      syncSectionInUrl("chats", { universityId, chatPanel: "group" }, { replace });
    },
    [syncSectionInUrl]
  );

  const syncPrivateThreadInUrl = useCallback(
    (threadId, { replace = false } = {}) => {
      syncSectionInUrl("chats", { threadId, chatPanel: "private" }, { replace });
    },
    [syncSectionInUrl]
  );

  const openUniversityChat = useCallback(
    (universityId) => {
      setSelectedUniversityId(universityId);
      setChatPanel("group");
      setMobileChatScreen("chat");
      syncChatUniversityInUrl(universityId);
      trackDashboardSection("chats");
    },
    [setSelectedUniversityId, setChatPanel, setMobileChatScreen, syncChatUniversityInUrl]
  );

  const openUniversityReviews = useCallback(
    (universityId) => {
      markApplicantChecklistStep("reviews");
      setReviewUniversity(String(universityId));
      setMobileReviewScreen("detail");
      syncSectionInUrl(
        "reviews",
        { universityId },
        { replace: false }
      );
      trackDashboardSection("reviews");
    },
    [setReviewUniversity, setMobileReviewScreen, syncSectionInUrl]
  );

  return {
    activeSection,
    changeSection,
    applyUrlToDashboardState,
    openUniversityChat,
    openUniversityReviews,
    syncChatUniversityInUrl,
    syncPrivateThreadInUrl,
  };
}
