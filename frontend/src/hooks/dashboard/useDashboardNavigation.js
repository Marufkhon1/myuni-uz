import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { trackDashboardSection } from "@/lib/analytics.js";
import { markApplicantChecklistStep } from "@/utils/applicantChecklist.js";
import { buildDashboardSectionPath } from "@/utils/navigation.js";
import {
  applyDashboardUrlState,
  buildDeepLinkKey,
  resolveActiveSection,
} from "@/utils/dashboardUrlState.js";

export { resolveActiveSection, buildDeepLinkKey };

export function useDashboardNavigation({
  role,
  universities,
  setReviewUniversity,
  setMobileReviewScreen,
  setSelectedUniversityId,
  setSelectedThreadId,
  setChatPanel,
  setMobileChatScreen,
  setChatListTab,
  selectUniversityGroupChat,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { section: sectionParam } = useParams();
  const [searchParams] = useSearchParams();
  const activeSection = useMemo(
    () => resolveActiveSection(searchParams, sectionParam, pathname),
    [searchParams, sectionParam, pathname]
  );
  const deepLinkKey = useMemo(() => buildDeepLinkKey(searchParams), [searchParams]);
  const universitiesRef = useRef(universities);
  const searchParamsRef = useRef(searchParams);
  const activeSectionRef = useRef(activeSection);
  const chatSettersRef = useRef({
    setSelectedUniversityId,
    setSelectedThreadId,
    setChatPanel,
    setMobileChatScreen,
    setChatListTab,
  });
  const reviewSettersRef = useRef({
    setReviewUniversity,
    setMobileReviewScreen,
  });

  useEffect(() => {
    universitiesRef.current = universities;
  }, [universities]);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    chatSettersRef.current = {
      setSelectedUniversityId,
      setSelectedThreadId,
      setChatPanel,
      setMobileChatScreen,
      setChatListTab,
    };
  }, [
    setSelectedUniversityId,
    setSelectedThreadId,
    setChatPanel,
    setMobileChatScreen,
    setChatListTab,
  ]);

  useEffect(() => {
    reviewSettersRef.current = {
      setReviewUniversity,
      setMobileReviewScreen,
    };
  }, [setReviewUniversity, setMobileReviewScreen]);

  const syncSectionInUrl = useCallback(
    (sectionId, { universityId, threadId, chatPanel } = {}, { replace = false } = {}) => {
      const params = new URLSearchParams(searchParams);
      params.delete("section");

      if (universityId !== undefined) {
        if (universityId != null) {
          params.set("university_id", String(universityId));
        } else {
          params.delete("university_id");
          params.delete("university");
        }
      } else if (sectionId !== "chats" && sectionId !== "reviews") {
        params.delete("university_id");
        params.delete("university");
      }

      if (chatPanel === "private" && threadId != null) {
        params.set("chat_panel", "private");
        params.set("thread_id", String(threadId));
      } else if (sectionId === "chats" && chatPanel !== "private") {
        params.delete("chat_panel");
        params.delete("thread_id");
      } else if (sectionId !== "chats") {
        params.delete("chat_panel");
        params.delete("thread_id");
      }

      const query = params.toString();
      const path = buildDashboardSectionPath(role, sectionId);
      navigate(query ? `${path}?${query}` : path, { replace });
    },
    [navigate, role, searchParams]
  );

  const applyUrlToDashboardState = useCallback(() => {
    applyDashboardUrlState({
      section: activeSectionRef.current,
      universityIdParam: searchParamsRef.current.get("university_id"),
      universityName: searchParamsRef.current.get("university"),
      chatPanel: searchParamsRef.current.get("chat_panel"),
      threadIdParam: searchParamsRef.current.get("thread_id"),
      universities: universitiesRef.current,
      chatSetters: chatSettersRef.current,
      reviewSetters: reviewSettersRef.current,
    });
  }, []);

  useEffect(() => {
    applyUrlToDashboardState();
  }, [deepLinkKey, activeSection, universities.length, applyUrlToDashboardState]);

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

  const syncChatListTabInUrl = useCallback(
    (tabId, { universityId, threadId, replace = false } = {}) => {
      if (tabId === "private") {
        if (threadId != null) {
          syncSectionInUrl("chats", { threadId, chatPanel: "private" }, { replace });
          return;
        }
        syncSectionInUrl("chats", { universityId: null, chatPanel: "group" }, { replace });
        return;
      }

      if (tabId === "search") {
        syncSectionInUrl("chats", { universityId: null, chatPanel: "group" }, { replace });
        return;
      }

      syncSectionInUrl(
        "chats",
        {
          universityId: universityId != null ? universityId : null,
          chatPanel: "group",
        },
        { replace }
      );
    },
    [syncSectionInUrl]
  );

  const syncReviewUniversityInUrl = useCallback(
    (universityId, { replace = false } = {}) => {
      syncSectionInUrl("reviews", { universityId }, { replace });
    },
    [syncSectionInUrl]
  );

  const openUniversityChat = useCallback(
    (universityId) => {
      if (selectUniversityGroupChat) {
        selectUniversityGroupChat(universityId);
      } else {
        setSelectedUniversityId(universityId);
        setChatPanel("group");
        setMobileChatScreen("chat");
        syncChatUniversityInUrl(universityId);
      }
      trackDashboardSection("chats");
    },
    [
      selectUniversityGroupChat,
      setSelectedUniversityId,
      setChatPanel,
      setMobileChatScreen,
      syncChatUniversityInUrl,
    ]
  );

  const openUniversityReviews = useCallback(
    (universityId) => {
      markApplicantChecklistStep("reviews");
      setReviewUniversity(String(universityId));
      setMobileReviewScreen("detail");
      syncReviewUniversityInUrl(universityId, { replace: false });
      trackDashboardSection("reviews");
    },
    [setReviewUniversity, setMobileReviewScreen, syncReviewUniversityInUrl]
  );

  return {
    activeSection,
    changeSection,
    applyUrlToDashboardState,
    openUniversityChat,
    openUniversityReviews,
    syncChatUniversityInUrl,
    syncPrivateThreadInUrl,
    syncChatListTabInUrl,
    syncReviewUniversityInUrl,
  };
}
