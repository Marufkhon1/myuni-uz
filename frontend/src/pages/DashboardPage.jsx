import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import DashboardBottomNav from "../components/dashboard/DashboardBottomNav.jsx";
import { ratingStars as stars } from "../components/dashboard/dashboardConstants.js";
import { dashboardPathForRole } from "../utils/navigation.js";
import { getDashboardCabinetEyebrow, getDashboardMenuItems } from "../utils/dashboardRoleContent.js";
import UniversityCompareSection from "../components/dashboard/UniversityCompareSection.jsx";
import PopularReviewsSection from "../components/dashboard/PopularReviewsSection.jsx";
import MessageReportDialog from "../components/MessageReportDialog.jsx";
import ProfileSection from "../components/dashboard/ProfileSection.jsx";
import DashboardChatSection from "./dashboard/DashboardChatSection.jsx";
import DashboardReviewsSection from "./dashboard/DashboardReviewsSection.jsx";
import DashboardSidebar from "./dashboard/DashboardSidebar.jsx";
import UserAvatar from "../components/dashboard/UserAvatar.jsx";
import UnreadBadge from "../components/UnreadBadge.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import logo from "../assets/myuni-logo.png";
import { useAuth } from "../hooks/useAuth.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";
import { useDarkMode } from "../hooks/useDarkMode.js";
import { mergeById, useMessageStream } from "../hooks/useMessageStream.js";
import {
  getDirectMessages,
  getDirectThreads,
  getJoinedUniversityIds,
  leaveUniversityChat,
  markDirectThreadRead,
  markUniversityChatRead,
  getUniversityMembers,
  getUniversityMessages,
  joinUniversity,
  pinDirectMessage,
  pinUniversityMessage,
  sendDirectMessage,
  sendDirectTyping,
  editUniversityMessage,
  editDirectMessage,
  deleteUniversityMessage,
  deleteDirectMessage,
  sendUniversityMessage,
  reactToDirectMessage,
  reactToUniversityMessage,
  reportDirectMessage,
  reportUniversityMessage,
  sendUniversityTyping,
  startDirectThread,
  unpinDirectMessage,
  unpinUniversityMessage,
} from "../services/chatService.js";
import { getPublicUser } from "../services/userService.js";
import { resolveMediaUrl } from "../utils/media.js";
import {
  createReview,
  deleteReview,
  getUniversities,
  getUniversityDetail,
  getPopularReviews,
  getReviews,
  toggleReviewLike,
} from "../services/universityService.js";
import { getApiErrorMessage } from "../utils/apiErrors.js";
import { createChatErrorReporter } from "../utils/chatActionError.js";
import { createThrottledTyping } from "../utils/throttledTyping.js";

export default function DashboardPage({ role }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout, user, refreshUser } = useAuth();
  const { isDark, setIsDark } = useDarkMode();
  const profileRole = user?.profile?.role;
  const isStudent = role === "student";
  const profile = user?.profile;

  useEffect(() => {
    if (!profileRole || profileRole === role) {
      return;
    }
    navigate(dashboardPathForRole(profileRole), { replace: true });
  }, [profileRole, role, navigate]);
  const displayName = profile?.full_name || user?.first_name || user?.email || "Foydalanuvchi";
  const [universities, setUniversities] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [chatError, setChatError] = useState("");
  const [isGroupSending, setIsGroupSending] = useState(false);
  const [isGroupJoining, setIsGroupJoining] = useState(false);
  const [isPrivateSending, setIsPrivateSending] = useState(false);
  const chatErrorReporterRef = useRef(null);
  if (!chatErrorReporterRef.current) {
    chatErrorReporterRef.current = createChatErrorReporter(setChatError);
  }
  const { reportChatError, clearChatError } = chatErrorReporterRef.current;
  const groupTypingNotifyRef = useRef(() => {});
  const privateTypingNotifyRef = useRef(() => {});

  const [activeSection, setActiveSection] = useState("chats");
  const [chatListTab, setChatListTab] = useState("search");
  const [selectedUniversityId, setSelectedUniversityId] = useState(null);
  const [joinedUniversityIds, setJoinedUniversityIds] = useState(new Set());
  const [universitySearch, setUniversitySearch] = useState("");
  const [groupMessage, setGroupMessage] = useState("");
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupPinnedMessage, setGroupPinnedMessage] = useState(null);
  const [chatMembers, setChatMembers] = useState({ members: [], member_count: 0 });
  const [directThreads, setDirectThreads] = useState([]);
  const [draftThread, setDraftThread] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [directMessages, setDirectMessages] = useState([]);
  const [privatePinnedMessage, setPrivatePinnedMessage] = useState(null);
  const [privateMessage, setPrivateMessage] = useState("");
  const [profileUser, setProfileUser] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [isGroupChatSearchOpen, setIsGroupChatSearchOpen] = useState(false);
  const [groupChatSearchQuery, setGroupChatSearchQuery] = useState("");
  const [highlightedGroupMessageId, setHighlightedGroupMessageId] = useState(null);
  const groupMessageRefs = useRef({});
  const [groupInfoDetail, setGroupInfoDetail] = useState(null);
  const [isGroupInfoDetailLoading, setIsGroupInfoDetailLoading] = useState(false);
  const [chatPanel, setChatPanel] = useState("group");
  const [reviewUniversity, setReviewUniversity] = useState("");
  const [reviewUniversityDetail, setReviewUniversityDetail] = useState(null);
  const [reviewUniversitySearch, setReviewUniversitySearch] = useState("");
  const [isReviewDetailLoading, setIsReviewDetailLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [popularReviews, setPopularReviews] = useState([]);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState("");
  const [editingChatMessage, setEditingChatMessage] = useState(null);
  const [reactingMessageId, setReactingMessageId] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [mobileChatScreen, setMobileChatScreen] = useState("list");
  const [mobileReviewScreen, setMobileReviewScreen] = useState("list");
  const [groupTypingUsers, setGroupTypingUsers] = useState([]);
  const { isPhone } = useBreakpoint();
  const [privateTypingUsers, setPrivateTypingUsers] = useState([]);

  const userUniversity = profile?.university || universities[0]?.name || "";
  const savedAvatarUrl = resolveMediaUrl(profile?.avatar_url || "");
  const selectedUniversity =
    universities.find((university) => university.id === selectedUniversityId) ?? universities[0];
  const groupInfoUniversity = useMemo(() => {
    if (!selectedUniversity) {
      return null;
    }
    if (groupInfoDetail?.id === selectedUniversity.id) {
      return { ...selectedUniversity, ...groupInfoDetail };
    }
    return selectedUniversity;
  }, [selectedUniversity, groupInfoDetail]);
  const hasJoinedSelectedChat = selectedUniversity
    ? joinedUniversityIds.has(selectedUniversity.id)
    : false;
  const selectedThread =
    directThreads.find((thread) => thread.id === selectedThreadId) ??
    (draftThread?.id === selectedThreadId ? draftThread : null);

  const privateThreadList = useMemo(() => {
    const items = [...directThreads];
    if (draftThread && !items.some((thread) => thread.id === draftThread.id)) {
      items.unshift({ ...draftThread, is_draft: true });
    }
    return items;
  }, [directThreads, draftThread]);

  const totalPrivateUnread = useMemo(
    () => directThreads.reduce((sum, thread) => sum + (thread.unread_count ?? 0), 0),
    [directThreads]
  );

  const totalJoinedUnread = useMemo(
    () =>
      universities.reduce((sum, university) => {
        if (!joinedUniversityIds.has(university.id)) {
          return sum;
        }
        return sum + (university.unread_sender_count ?? 0);
      }, 0),
    [universities, joinedUniversityIds]
  );

  const filteredUniversities = useMemo(() => {
    const query = universitySearch.trim().toLowerCase();
    let list = universities;

    if (chatListTab === "joined") {
      list = list.filter((university) => joinedUniversityIds.has(university.id));
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

  const visibleMenuItems = useMemo(() => getDashboardMenuItems(isStudent), [isStudent]);
  const cabinetEyebrow = getDashboardCabinetEyebrow(isStudent);

  const groupChatSearchTrimmed = groupChatSearchQuery.trim().toLowerCase();
  const groupChatSearchResults = useMemo(() => {
    if (!isGroupChatSearchOpen) {
      return [];
    }
    if (!groupChatSearchTrimmed) {
      return [];
    }

    const list = groupMessages.filter((item) => {
      const text = (item.text || "").toLowerCase();
      const author = (item.author || "").toLowerCase();
      return text.includes(groupChatSearchTrimmed) || author.includes(groupChatSearchTrimmed);
    });

    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [groupMessages, isGroupChatSearchOpen, groupChatSearchTrimmed]);

  function closeGroupChatSearch() {
    setIsGroupChatSearchOpen(false);
    setGroupChatSearchQuery("");
  }

  function openGroupChatSearch() {
    setIsGroupChatSearchOpen(true);
    setGroupChatSearchQuery("");
  }

  function jumpToGroupMessage(messageId) {
    closeGroupChatSearch();
    setHighlightedGroupMessageId(messageId);
    window.requestAnimationFrame(() => {
      groupMessageRefs.current[messageId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    window.setTimeout(() => setHighlightedGroupMessageId(null), 2600);
  }

  const hidePrivateMessageButton = useMemo(() => {
    if (!profileUser?.id) {
      return false;
    }

    const thread = directThreads.find((item) => item.other_user_id === profileUser.id);
    return Boolean(thread?.both_replied);
  }, [profileUser?.id, directThreads]);

  const groupStreamUrl =
    selectedUniversityId && chatPanel === "group"
      ? `/api/universities/${selectedUniversityId}/messages/stream/`
      : null;

  const privateStreamUrl =
    selectedThreadId && chatPanel === "private"
      ? `/api/universities/directs/${selectedThreadId}/messages/stream/`
      : null;

  const mergeMessages = useCallback(
    (incoming) => setGroupMessages((current) => mergeById(current, incoming)),
    []
  );

  const mergeGroupUpdated = useCallback(
    (incoming) => setGroupMessages((current) => mergeById(current, incoming)),
    []
  );

  const removeGroupMessages = useCallback((ids) => {
    const idSet = new Set(ids);
    setGroupMessages((current) => current.filter((item) => !idSet.has(item.id)));
    if (groupPinnedMessage && idSet.has(groupPinnedMessage.id)) {
      setGroupPinnedMessage(null);
    }
  }, [groupPinnedMessage]);

  const mergePrivateMessages = useCallback(
    (incoming) => setDirectMessages((current) => mergeById(current, incoming)),
    []
  );

  const mergePrivateUpdated = useCallback(
    (incoming) => setDirectMessages((current) => mergeById(current, incoming)),
    []
  );

  const removePrivateMessages = useCallback((ids) => {
    const idSet = new Set(ids);
    setDirectMessages((current) => current.filter((item) => !idSet.has(item.id)));
    if (privatePinnedMessage && idSet.has(privatePinnedMessage.id)) {
      setPrivatePinnedMessage(null);
    }
  }, [privatePinnedMessage]);

  useEffect(() => {
    groupTypingNotifyRef.current = createThrottledTyping(
      () => sendUniversityTyping(selectedUniversityId),
      {
        onError: (error) =>
          reportChatError(
            getApiErrorMessage(error, "Yozish holati yuborilmadi. Chatga qo'shilganingizni tekshiring.")
          ),
      }
    );
  }, [selectedUniversityId, reportChatError]);

  useEffect(() => {
    privateTypingNotifyRef.current = createThrottledTyping(
      () => sendDirectTyping(selectedThreadId),
      {
        onError: (error) =>
          reportChatError(getApiErrorMessage(error, "Yozish holati yuborilmadi.")),
      }
    );
  }, [selectedThreadId, reportChatError]);

  useEffect(() => {
    clearChatError();
  }, [selectedUniversityId, selectedThreadId, chatPanel, clearChatError]);

  useEffect(() => {
    setEditingChatMessage((current) => {
      if (!current) {
        return null;
      }
      if (current.scope === "group") {
        setGroupMessage("");
      } else if (current.scope === "private") {
        setPrivateMessage("");
      }
      return null;
    });
  }, [selectedUniversityId, selectedThreadId]);

  useEffect(() => {
    closeGroupChatSearch();
    setHighlightedGroupMessageId(null);
    groupMessageRefs.current = {};
  }, [selectedUniversityId]);

  useMessageStream({
    streamUrl: groupStreamUrl,
    enabled: activeSection === "chats" && chatPanel === "group" && hasJoinedSelectedChat,
    onMessages: mergeMessages,
    onMessageUpdated: mergeGroupUpdated,
    onMessageDeleted: removeGroupMessages,
    onTyping: setGroupTypingUsers,
  });

  useMessageStream({
    streamUrl: privateStreamUrl,
    enabled: activeSection === "chats" && chatPanel === "private" && Boolean(selectedThreadId),
    onMessages: mergePrivateMessages,
    onMessageUpdated: mergePrivateUpdated,
    onMessageDeleted: removePrivateMessages,
    onTyping: setPrivateTypingUsers,
  });

  const filteredReviewUniversities = useMemo(() => {
    const query = reviewUniversitySearch.trim().toLowerCase();
    if (!query) {
      return universities;
    }
    return universities.filter(
      (university) =>
        university.name.toLowerCase().includes(query) ||
        university.short_name?.toLowerCase().includes(query) ||
        university.location?.toLowerCase().includes(query)
    );
  }, [universities, reviewUniversitySearch]);

  const applyDashboardDeepLink = useCallback(
    (universityList) => {
      const section = searchParams.get("section");
      const universityName = searchParams.get("university");
      const universityIdParam = searchParams.get("university_id");

      if (section === "reviews") {
        setActiveSection("reviews");
      } else if (section === "popular") {
        setActiveSection("popular");
      } else if (section === "chats") {
        setActiveSection("chats");
      } else if (section === "profile") {
        setActiveSection("profile");
      }

      let match = null;
      if (universityIdParam) {
        match = universityList.find((university) => String(university.id) === universityIdParam) ?? null;
      }
      if (!match && universityName) {
        match = universityList.find(
          (university) =>
            university.name === universityName || university.short_name === universityName
        );
      }

      if (!match) {
        return;
      }

      if (section === "reviews") {
        setReviewUniversity(String(match.id));
        setMobileReviewScreen("detail");
      } else if (section === "chats") {
        setSelectedUniversityId(match.id);
        setChatPanel("group");
        setMobileChatScreen("chat");
      }
    },
    [searchParams]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [universityList, joinedIds, threadList, popularList] = await Promise.all([
          getUniversities(),
          getJoinedUniversityIds(),
          getDirectThreads(),
          getPopularReviews(),
        ]);

        if (!isMounted) {
          return;
        }

        setUniversities(universityList);
        setJoinedUniversityIds(new Set(joinedIds));
        setDirectThreads(threadList);
        setPopularReviews(popularList);
        const defaultUniversity =
          universityList.find((university) => university.name === profile?.university) ?? universityList[0];

        if (defaultUniversity) {
          setSelectedUniversityId(defaultUniversity.id);
        }

        applyDashboardDeepLink(universityList);
      } catch {
        if (isMounted) {
          setDataError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
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
  }, [profile?.university, searchParams, applyDashboardDeepLink]);

  useEffect(() => {
    if (universities.length === 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      applyDashboardDeepLink(universities);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [searchParams, universities, applyDashboardDeepLink]);

  useEffect(() => {
    if (!selectedUniversityId || chatPanel !== "group") {
      return;
    }

    let isMounted = true;

    async function loadMessages() {
      try {
        const { messages, pinned } = await getUniversityMessages(selectedUniversityId);
        if (isMounted) {
          setGroupMessages(messages);
          setGroupPinnedMessage(pinned);
        }
        if (joinedUniversityIds.has(selectedUniversityId)) {
          await markUniversityChatRead(selectedUniversityId);
          if (isMounted) {
            refreshChatSummaries();
          }
        }
      } catch {
        if (isMounted) {
          setGroupMessages([]);
          setGroupPinnedMessage(null);
        }
      }
    }

    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [selectedUniversityId, chatPanel]);

  useEffect(() => {
    if (!selectedThreadId || chatPanel !== "private") {
      return;
    }

    let isMounted = true;

    async function loadPrivateMessages() {
      try {
        const { messages, pinned } = await getDirectMessages(selectedThreadId);
        if (isMounted) {
          setDirectMessages(messages);
          setPrivatePinnedMessage(pinned);
        }
        await markDirectThreadRead(selectedThreadId);
        if (isMounted) {
          refreshChatSummaries();
        }
      } catch {
        if (isMounted) {
          setDirectMessages([]);
          setPrivatePinnedMessage(null);
        }
      }
    }

    loadPrivateMessages();
    return () => {
      isMounted = false;
    };
  }, [selectedThreadId, chatPanel]);

  const activeChatMembers =
    selectedUniversityId && chatPanel === "group"
      ? chatMembers
      : { members: [], member_count: 0 };

  useEffect(() => {
    if (!selectedUniversityId || chatPanel !== "group") {
      return;
    }

    let isMounted = true;

    async function loadMembers() {
      try {
        const data = await getUniversityMembers(selectedUniversityId);
        if (isMounted) {
          setChatMembers({
            members: data.members ?? [],
            member_count: data.member_count ?? 0,
          });
        }
      } catch {
        if (isMounted) {
          setChatMembers({ members: [], member_count: 0 });
        }
      }
    }

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [selectedUniversityId, chatPanel, joinedUniversityIds]);

  useEffect(() => {
    setGroupInfoDetail(null);
  }, [selectedUniversityId]);

  useEffect(() => {
    if (!reviewUniversity || activeSection !== "reviews") {
      return;
    }

    let isMounted = true;

    async function loadReviewUniversityData() {
      if (isMounted) {
        setIsReviewDetailLoading(true);
      }
      try {
        const [detail, universityReviews] = await Promise.all([
          getUniversityDetail(reviewUniversity),
          getReviews(reviewUniversity),
        ]);
        if (isMounted) {
          setReviewUniversityDetail(detail);
          setReviews(universityReviews);
        }
      } catch {
        if (isMounted) {
          setReviewUniversityDetail(null);
          setReviews([]);
        }
      } finally {
        if (isMounted) {
          setIsReviewDetailLoading(false);
        }
      }
    }

    loadReviewUniversityData();

    return () => {
      isMounted = false;
    };
  }, [reviewUniversity, activeSection]);

  async function refreshChatSummaries() {
    try {
      const [universityList, threadList] = await Promise.all([getUniversities(), getDirectThreads()]);
      setUniversities(universityList);
      setDirectThreads(threadList);
    } catch {
      // ignore polling errors
    }
  }

  useEffect(() => {
    if (activeSection !== "chats" || isDataLoading) {
      return undefined;
    }

    const intervalId = window.setInterval(refreshChatSummaries, 8000);
    return () => window.clearInterval(intervalId);
  }, [activeSection, isDataLoading]);

  function changeSection(sectionId) {
    setActiveSection(sectionId);
    if (sectionId !== "chats") {
      setMobileChatScreen("list");
    }
    if (sectionId !== "reviews") {
      setMobileReviewScreen("list");
    }
  }

  function backToChatList() {
    setMobileChatScreen("list");
    setShowGroupInfoModal(false);
    closeGroupChatSearch();
  }

  function backToReviewList() {
    setMobileReviewScreen("list");
  }

  const isPrivateChatLayout =
    !isPhone && activeSection === "chats" && chatListTab === "private";

  const isGroupChatLayout =
    !isPhone && activeSection === "chats" && chatPanel === "group";

  const isWideChatLayout = isPrivateChatLayout || isGroupChatLayout;

  const chatColumnEqualHeightClass = isPhone
    ? "h-fit max-h-[calc(100dvh-11rem)] self-start md:max-h-[calc(100vh-10rem)]"
    : "md:flex md:h-[calc(100dvh-11.5rem)] md:max-h-[calc(100dvh-11.5rem)] md:flex-col md:overflow-hidden";

  const chatListScrollClass = isPhone
    ? "chat-messages-scroll mt-4 max-h-[min(28rem,calc(100dvh-17rem))] space-y-1 overflow-y-auto overscroll-contain pr-1"
    : "chat-messages-scroll mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1";

  const chatMessagesAreaClass = isPhone
    ? "chat-messages-scroll h-[calc(100dvh-14rem)] min-h-[200px] overflow-y-auto overflow-x-hidden overscroll-contain"
    : "chat-messages-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain";

  const chatPanelInnerClass = isPhone
    ? "flex flex-col"
    : "flex min-h-0 flex-1 flex-col overflow-hidden";

  const chatSectionGridClass = isPhone
    ? "grid-cols-1"
    : isWideChatLayout
      ? "md:grid-cols-[minmax(280px,30%)_minmax(0,1fr)] md:gap-3 lg:gap-4"
      : "md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] xl:grid-cols-[420px_1fr]";

  function handleChatTabChange(tabId) {
    setChatListTab(tabId);
    if (isPhone) {
      setMobileChatScreen("list");
    }
    if (tabId === "private") {
      setChatPanel("private");
      return;
    }

    setChatPanel("group");
    if (draftThread) {
      const draftId = draftThread.id;
      setDraftThread(null);
      if (selectedThreadId === draftId) {
        setSelectedThreadId(null);
      }
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  async function handleJoin(universityId) {
    setIsGroupJoining(true);
    clearChatError();
    try {
      await joinUniversity(universityId);
      setJoinedUniversityIds((current) => {
        const next = new Set(current);
        next.add(universityId);
        return next;
      });
      setSelectedUniversityId(universityId);
      setChatPanel("group");
      setChatListTab("joined");
      setMobileChatScreen("chat");
      try {
        const data = await getUniversityMembers(universityId);
        setChatMembers({
          members: data.members ?? [],
          member_count: data.member_count ?? 0,
        });
      } catch {
        setChatMembers({ members: [], member_count: 0 });
      }
      await markUniversityChatRead(universityId);
      refreshChatSummaries();
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Chatga qo'shilib bo'lmadi. Qayta urinib ko'ring."));
    } finally {
      setIsGroupJoining(false);
    }
  }

  async function sendGroupChatMessage(event) {
    event.preventDefault();

    const trimmed = groupMessage.trim();
    if (!hasJoinedSelectedChat || !trimmed || !selectedUniversityId || isGroupSending) {
      return;
    }

    const isEditingGroup = editingChatMessage?.scope === "group";

    setIsGroupSending(true);
    clearChatError();
    try {
      if (isEditingGroup) {
        const updated = await editUniversityMessage(editingChatMessage.message.id, trimmed);
        updateMessageInList(setGroupMessages, updated);
        if (groupPinnedMessage?.id === updated.id) {
          setGroupPinnedMessage(updated);
        }
        setEditingChatMessage(null);
        setGroupMessage("");
      } else {
        const created = await sendUniversityMessage(selectedUniversityId, trimmed);
        setGroupMessages((current) => [...current, created]);
        setGroupMessage("");
        setGroupTypingUsers([]);
      }
    } catch (error) {
      reportChatError(
        getApiErrorMessage(
          error,
          isEditingGroup ? "Xabarni saqlab bo'lmadi." : "Guruh xabari yuborilmadi."
        )
      );
    } finally {
      setIsGroupSending(false);
    }
  }

  async function handleLeaveChat() {
    if (!selectedUniversityId || !hasJoinedSelectedChat) {
      return;
    }
    clearChatError();
    try {
      await leaveUniversityChat(selectedUniversityId);
      setJoinedUniversityIds((current) => {
        const next = new Set(current);
        next.delete(selectedUniversityId);
        return next;
      });
      setGroupMessages([]);
      setChatListTab("search");
      setMobileChatScreen("list");
      setShowGroupInfoModal(false);
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Chatdan chiqib bo'lmadi."));
    }
  }

  async function openGroupInfoModal() {
    if (!selectedUniversityId || !selectedUniversity) {
      return;
    }
    setShowGroupInfoModal(true);
    setGroupInfoDetail(null);
    setIsGroupInfoDetailLoading(true);
    try {
      const detail = await getUniversityDetail(selectedUniversityId);
      setGroupInfoDetail(detail);
    } catch {
      setGroupInfoDetail(null);
    } finally {
      setIsGroupInfoDetailLoading(false);
    }
  }

  function updateMessageInList(setter, updated) {
    setter((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function handleGroupReaction(message, emoji) {
    setReactingMessageId(message.id);
    try {
      const updated = await reactToUniversityMessage(message.id, emoji);
      updateMessageInList(setGroupMessages, updated);
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Reaksiya qo'shilmadi."));
    } finally {
      setReactingMessageId(null);
    }
  }

  async function handlePrivateReaction(message, emoji) {
    setReactingMessageId(message.id);
    try {
      const updated = await reactToDirectMessage(message.id, emoji);
      updateMessageInList(setDirectMessages, updated);
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Reaksiya qo'shilmadi."));
    } finally {
      setReactingMessageId(null);
    }
  }

  function openMessageReport(message, scope) {
    setReportTarget({ message, scope });
  }

  async function handlePinGroupMessage(message) {
    if (!selectedUniversityId || !hasJoinedSelectedChat) {
      return;
    }
    try {
      const pinned = await pinUniversityMessage(selectedUniversityId, message.id);
      setGroupPinnedMessage(pinned);
      clearChatError();
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Xabar biriktirilmadi."));
    }
  }

  async function handleUnpinGroupMessage(message) {
    if (!selectedUniversityId) {
      return;
    }
    try {
      await unpinUniversityMessage(selectedUniversityId, message.id);
      setGroupPinnedMessage(null);
      clearChatError();
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Biriktirish olib tashlanmadi."));
    }
  }

  async function handlePinPrivateMessage(message) {
    if (!selectedThreadId) {
      return;
    }
    try {
      const pinned = await pinDirectMessage(selectedThreadId, message.id);
      setPrivatePinnedMessage(pinned);
      clearChatError();
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Xabar biriktirilmadi."));
    }
  }

  async function handleUnpinPrivateMessage(message) {
    if (!selectedThreadId) {
      return;
    }
    try {
      await unpinDirectMessage(selectedThreadId, message.id);
      setPrivatePinnedMessage(null);
      clearChatError();
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Biriktirish olib tashlanmadi."));
    }
  }

  async function submitMessageReport(payload) {
    if (!reportTarget) {
      return;
    }
    setIsReportSubmitting(true);
    try {
      if (reportTarget.scope === "group") {
        await reportUniversityMessage(reportTarget.message.id, payload);
      } else {
        await reportDirectMessage(reportTarget.message.id, payload);
      }
      setReportTarget(null);
      clearChatError();
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Shikoyat yuborilmadi."));
    } finally {
      setIsReportSubmitting(false);
    }
  }

  function notifyGroupTyping() {
    if (selectedUniversityId && hasJoinedSelectedChat) {
      groupTypingNotifyRef.current();
    }
  }

  function notifyPrivateTyping() {
    if (selectedThreadId) {
      privateTypingNotifyRef.current();
    }
  }

  async function sendPrivateChatMessage(event) {
    event.preventDefault();

    const trimmed = privateMessage.trim();
    if (!trimmed || !selectedThreadId || isPrivateSending) {
      return;
    }

    const isEditingPrivate = editingChatMessage?.scope === "private";

    setIsPrivateSending(true);
    clearChatError();
    try {
      if (isEditingPrivate) {
        const updated = await editDirectMessage(editingChatMessage.message.id, trimmed);
        updateMessageInList(setDirectMessages, updated);
        if (privatePinnedMessage?.id === updated.id) {
          setPrivatePinnedMessage(updated);
        }
        setEditingChatMessage(null);
        setPrivateMessage("");
      } else {
        const created = await sendDirectMessage(selectedThreadId, trimmed);
        setDirectMessages((current) => [...current, created]);
        setPrivateMessage("");
        const threads = await getDirectThreads();
        setDirectThreads(threads);
        setDraftThread(null);
      }
    } catch (error) {
      reportChatError(
        getApiErrorMessage(
          error,
          isEditingPrivate ? "Xabarni saqlab bo'lmadi." : "Shaxsiy xabar yuborilmadi."
        )
      );
    } finally {
      setIsPrivateSending(false);
    }
  }

  async function openUserProfile(userId, prefetch = null, options = {}) {
    const { universityId = null } = options;
    if (prefetch) {
      setProfileUser({
        id: userId,
        display_name: prefetch.display_name,
        avatar_url: prefetch.avatar_url,
        role_label: prefetch.role_label,
        university: prefetch.university,
        study_program: prefetch.study_program,
      });
    }
    setIsProfileLoading(true);
    clearChatError();
    try {
      const profileData = await getPublicUser(userId, { universityId });
      setProfileUser(profileData);
    } catch (error) {
      setProfileUser(null);
      reportChatError(
        getApiErrorMessage(error, "Profil faqat chatda xabar yozgan foydalanuvchilar uchun ochiladi.")
      );
    } finally {
      setIsProfileLoading(false);
    }
  }

  function openGroupChatAuthorProfile(userId, prefetch) {
    if (!selectedUniversityId) {
      return;
    }
    openUserProfile(userId, prefetch, { universityId: selectedUniversityId });
  }

  async function openPrivateChatWithUser(userId) {
    const thread = await startDirectThread(userId);
    setDraftThread(thread);
    setSelectedThreadId(thread.id);
    setDirectMessages([]);
    setPrivateMessage("");
    setChatListTab("private");
    setChatPanel("private");
    setProfileUser(null);
    setShowGroupInfoModal(false);
    setMobileChatScreen("chat");
  }

  function formatTime(value) {
    return new Date(value).toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function selectUniversityChat(universityId) {
    setSelectedUniversityId(universityId);
    setChatPanel("group");
    setShowGroupInfoModal(false);
    setMobileChatScreen("chat");
  }

  function selectPrivateThread(threadId) {
    setDraftThread(null);
    setSelectedThreadId(threadId);
    setChatPanel("private");
    setMobileChatScreen("chat");
  }

  function renderPrivateThreadRow(thread) {
    const isSelected = selectedThreadId === thread.id;
    const previewText = thread.is_draft
      ? "Yangi suhbat — xabar yozing"
      : thread.last_message?.text || "";

    return (
      <button
        key={thread.id}
        type="button"
        onClick={() => selectPrivateThread(thread.id)}
        className={`flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-3 text-left transition-colors ${
          isSelected
            ? "bg-blue-50 dark:bg-blue-400/10"
            : "hover:bg-slate-100 dark:hover:bg-white/5"
        }`}
      >
        <UserAvatar name={thread.other_user_name} avatarUrl={thread.other_user_avatar_url} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{thread.other_user_name}</p>
          <p className="mt-0.5 truncate text-sm text-slate-500">{previewText}</p>
        </div>
        <span className="grid h-6 min-w-6 shrink-0 place-items-center">
          {!thread.is_draft && <UnreadBadge count={thread.unread_count ?? 0} />}
        </span>
      </button>
    );
  }

  function selectReviewUniversity(universityId) {
    setReviewUniversity(String(universityId));
    setRating(0);
    setReviewText("");
    setReviewUniversityDetail(null);
    setReviews([]);
    setMobileReviewScreen("detail");
  }

  function openReviewUniversityFromPopular(universityId) {
    changeSection("reviews");
    selectReviewUniversity(universityId);
  }

  function openChatFromReviewUniversity() {
    if (!reviewUniversity) {
      return;
    }
    const id = Number(reviewUniversity);
    setSelectedUniversityId(id);
    setChatPanel("group");
    setMobileChatScreen("group");
    changeSection("chats");
  }

  async function handleReviewLike(reviewId) {
    const result = await toggleReviewLike(reviewId);
    const updateItem = (item) =>
      item.id === reviewId ? { ...item, liked_by_me: result.liked, like_count: result.like_count } : item;
    setReviews((current) => current.map(updateItem));
    setPopularReviews((current) => current.map(updateItem));
  }

  async function handleDeleteGroupMessage(message) {
    if (!window.confirm("Xabarni o'chirishni tasdiqlaysizmi?")) {
      return;
    }
    try {
      await deleteUniversityMessage(message.id);
      setGroupMessages((current) => current.filter((item) => item.id !== message.id));
      if (groupPinnedMessage?.id === message.id) {
        setGroupPinnedMessage(null);
      }
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Xabarni o'chirib bo'lmadi."));
    }
  }

  async function handleDeletePrivateMessage(message) {
    if (!window.confirm("Xabarni o'chirishni tasdiqlaysizmi?")) {
      return;
    }
    try {
      await deleteDirectMessage(message.id);
      setDirectMessages((current) => current.filter((item) => item.id !== message.id));
      if (privatePinnedMessage?.id === message.id) {
        setPrivatePinnedMessage(null);
      }
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Xabarni o'chirib bo'lmadi."));
    }
  }

  function openEditChatMessage(message, scope) {
    setEditingChatMessage({ message, scope });
    clearChatError();
    if (scope === "group") {
      setGroupMessage(message.text);
    } else {
      setPrivateMessage(message.text);
    }
  }

  function cancelEditChatMessage() {
    const scope = editingChatMessage?.scope;
    setEditingChatMessage(null);
    if (scope === "group") {
      setGroupMessage("");
    } else if (scope === "private") {
      setPrivateMessage("");
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!window.confirm("Sharhni o'chirishni tasdiqlaysizmi?")) {
      return;
    }
    try {
      await deleteReview(reviewId);
      setReviews((current) => current.filter((item) => item.id !== reviewId));
      setPopularReviews((current) => current.filter((item) => item.id !== reviewId));
      if (reviewUniversity) {
        const detail = await getUniversityDetail(reviewUniversity);
        setReviewUniversityDetail(detail);
      }
    } catch (requestError) {
      setReviewSubmitError(
        getApiErrorMessage(requestError, "Sharhni o'chirib bo'lmadi. Qayta urinib ko'ring.")
      );
    }
  }

  async function submitReview(event) {
    event.preventDefault();

    if (!isStudent || !reviewUniversity || rating === 0 || !reviewText.trim()) {
      return;
    }

    setIsReviewSubmitting(true);
    setReviewSubmitError("");
    try {
      const nextReview = await createReview({
        university_id: Number(reviewUniversity),
        rating,
        text: reviewText.trim(),
      });
      setReviews((current) => [
        { ...nextReview, like_count: 0, liked_by_me: false },
        ...current,
      ]);
      setRating(0);
      setReviewText("");
      const detail = await getUniversityDetail(reviewUniversity);
      setReviewUniversityDetail(detail);
      if (nextReview.status === "pending") {
        setReviewSubmitError(
          "Sharh yuborildi. Moderator tasdiqlagach saytda ko'rinadi (email xabari yuboriladi)."
        );
      } else {
        setReviewSubmitError("");
      }
    } catch (requestError) {
      setReviewSubmitError(
        getApiErrorMessage(requestError, "Sharh yuborilmadi. Qayta urinib ko'ring.")
      );
    } finally {
      setIsReviewSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950 dark:bg-slateNight dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[292px_1fr]">
        <DashboardSidebar
          cabinetEyebrow={cabinetEyebrow}
          visibleMenuItems={visibleMenuItems}
          activeSection={activeSection}
          onChangeSection={changeSection}
          isStudent={isStudent}
        />

        <section className="min-w-0">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-[#f5f7fb]/90 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4 lg:px-8 dark:border-white/10 dark:bg-slateNight/85">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <Link to="/" className="grid shrink-0 lg:hidden">
                  <img src={logo} alt="" className="h-10 w-10 rounded-xl object-cover shadow-glow sm:h-11 sm:w-11" />
                </Link>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary sm:text-xs">
                    {cabinetEyebrow} · {visibleMenuItems.find((item) => item.id === activeSection)?.label}
                  </p>
                  <h1 className="truncate text-lg font-black sm:text-2xl lg:text-3xl">
                    Salom, {displayName}
                  </h1>
                  <p className="mt-0.5 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {isStudent
                      ? "Sharh yozing, chatda qatnashing va OTMlarni solishtiring."
                      : "Sharhlarni o'qing, taqqoslang va chatda savol bering."}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <ThemeToggle isDark={isDark} onToggle={() => setIsDark((value) => !value)} />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black shadow-soft transition hover:border-primary hover:text-primary sm:px-5 sm:py-2.5 sm:text-sm dark:border-white/10 dark:bg-white/10"
                >
                  Chiqish
                </button>
              </div>
            </div>
          </header>

          <div
            className={`min-h-[calc(100vh-9rem)] pb-24 sm:pb-24 lg:pb-8 ${
              isWideChatLayout ? "p-3 sm:p-4 lg:px-4 lg:py-5" : "p-4 sm:p-6 lg:p-8"
            }`}
          >
            {dataError && (
              <div className="mb-5 rounded-3xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-200">
                {dataError}
              </div>
            )}

            {activeSection === "chats" && chatError && (
              <div
                className="mb-5 rounded-3xl border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/40 dark:text-amber-100"
                role="alert"
              >
                {chatError}
              </div>
            )}

            {isDataLoading ? (
              <div className="grid min-h-[calc(100vh-12rem)] place-items-center rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
                <p className="font-black">Ma'lumotlar yuklanmoqda...</p>
              </div>
            ) : (
              <div className="min-h-[calc(100vh-12rem)]">
            {activeSection === "chats" && (
              <DashboardChatSection
                chatError={chatError}
                isPhone={isPhone}
                mobileChatScreen={mobileChatScreen}
                chatSectionGridClass={chatSectionGridClass}
                chatColumnEqualHeightClass={chatColumnEqualHeightClass}
                chatListScrollClass={chatListScrollClass}
                chatMessagesAreaClass={chatMessagesAreaClass}
                chatPanelInnerClass={chatPanelInnerClass}
                chatListTab={chatListTab}
                handleChatTabChange={handleChatTabChange}
                totalJoinedUnread={totalJoinedUnread}
                totalPrivateUnread={totalPrivateUnread}
                universitySearch={universitySearch}
                setUniversitySearch={setUniversitySearch}
                privateThreadList={privateThreadList}
                renderPrivateThreadRow={renderPrivateThreadRow}
                filteredUniversities={filteredUniversities}
                selectedUniversityId={selectedUniversityId}
                joinedUniversityIds={joinedUniversityIds}
                selectUniversityChat={selectUniversityChat}
                isWideChatLayout={isWideChatLayout}
                chatPanel={chatPanel}
                selectedThread={selectedThread}
                backToChatList={backToChatList}
                openUserProfile={openUserProfile}
                formatTime={formatTime}
                privatePinnedMessage={privatePinnedMessage}
                handleUnpinPrivateMessage={handleUnpinPrivateMessage}
                directMessages={directMessages}
                handlePrivateReaction={handlePrivateReaction}
                handlePinPrivateMessage={handlePinPrivateMessage}
                handleUnpinGroupMessage={handleUnpinGroupMessage}
                openMessageReport={openMessageReport}
                reactingMessageId={reactingMessageId}
                privateTypingUsers={privateTypingUsers}
                privateMessage={privateMessage}
                setPrivateMessage={setPrivateMessage}
                notifyPrivateTyping={notifyPrivateTyping}
                sendPrivateChatMessage={sendPrivateChatMessage}
                isPrivateSending={isPrivateSending}
                isGroupChatSearchOpen={isGroupChatSearchOpen}
                closeGroupChatSearch={closeGroupChatSearch}
                openGroupChatSearch={openGroupChatSearch}
                selectedUniversity={selectedUniversity}
                openGroupInfoModal={openGroupInfoModal}
                activeChatMembers={activeChatMembers}
                groupPinnedMessage={groupPinnedMessage}
                groupMessages={groupMessages}
                hasJoinedSelectedChat={hasJoinedSelectedChat}
                highlightedGroupMessageId={highlightedGroupMessageId}
                groupMessageRefs={groupMessageRefs}
                handleGroupReaction={handleGroupReaction}
                handlePinGroupMessage={handlePinGroupMessage}
                user={user}
                openGroupChatAuthorProfile={openGroupChatAuthorProfile}
                groupTypingUsers={groupTypingUsers}
                groupMessage={groupMessage}
                setGroupMessage={setGroupMessage}
                notifyGroupTyping={notifyGroupTyping}
                sendGroupChatMessage={sendGroupChatMessage}
                isGroupSending={isGroupSending}
                handleLeaveChat={handleLeaveChat}
                handleJoin={handleJoin}
                isGroupJoining={isGroupJoining}
                groupChatSearchQuery={groupChatSearchQuery}
                setGroupChatSearchQuery={setGroupChatSearchQuery}
                groupChatSearchResults={groupChatSearchResults}
                jumpToGroupMessage={jumpToGroupMessage}
                showGroupInfoModal={showGroupInfoModal}
                groupInfoUniversity={groupInfoUniversity}
                isGroupInfoDetailLoading={isGroupInfoDetailLoading}
                setShowGroupInfoModal={setShowGroupInfoModal}
                profileUser={profileUser}
                isProfileLoading={isProfileLoading}
                hidePrivateMessageButton={hidePrivateMessageButton}
                openPrivateChatWithUser={openPrivateChatWithUser}
                setProfileUser={setProfileUser}
                openEditChatMessage={openEditChatMessage}
                editingChatMessage={editingChatMessage}
                cancelEditChatMessage={cancelEditChatMessage}
                handleDeleteGroupMessage={handleDeleteGroupMessage}
                handleDeletePrivateMessage={handleDeletePrivateMessage}
              />
            )}

            {activeSection === "popular" && (
              <PopularReviewsSection
                popularReviews={popularReviews}
                onLike={handleReviewLike}
                onOpenSection={changeSection}
                onOpenUniversity={openReviewUniversityFromPopular}
                isStudent={isStudent}
              />
            )}

            {activeSection === "reviews" && (
              <DashboardReviewsSection
                isStudent={isStudent}
                isPhone={isPhone}
                reviewUniversity={reviewUniversity}
                reviewUniversitySearch={reviewUniversitySearch}
                onReviewUniversitySearchChange={setReviewUniversitySearch}
                filteredReviewUniversities={filteredReviewUniversities}
                onSelectReviewUniversity={selectReviewUniversity}
                mobileReviewScreen={mobileReviewScreen}
                reviewUniversityDetail={reviewUniversityDetail}
                isReviewDetailLoading={isReviewDetailLoading}
                reviews={reviews}
                onBackToReviewList={backToReviewList}
                onSubmitReview={submitReview}
                rating={rating}
                onRatingChange={setRating}
                reviewText={reviewText}
                onReviewTextChange={setReviewText}
                isReviewSubmitting={isReviewSubmitting}
                reviewSubmitError={reviewSubmitError}
                onLike={handleReviewLike}
                onDeleteReview={isStudent ? handleDeleteReview : undefined}
                stars={stars}
                onOpenSection={changeSection}
                onOpenChat={openChatFromReviewUniversity}
              />
            )}

            {activeSection === "profile" && (
              <ProfileSection
                user={user}
                profile={profile}
                displayName={displayName}
                userUniversity={userUniversity}
                universities={universities}
                isStudent={isStudent}
                savedAvatarUrl={savedAvatarUrl}
                refreshUser={refreshUser}
                joinedChatCount={joinedUniversityIds.size}
                onOpenSection={changeSection}
              />
            )}

            {activeSection === "compare" && (
              <UniversityCompareSection
                universities={universities}
                userUniversity={userUniversity}
                isStudent={isStudent}
                onViewReviews={selectReviewUniversity}
                onOpenSection={changeSection}
              />
            )}
              </div>
            )}
          </div>
        </section>
      </div>

      <DashboardBottomNav
        items={visibleMenuItems}
        activeSection={activeSection}
        onSelect={changeSection}
      />

      <MessageReportDialog
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        onSubmit={submitMessageReport}
        isSubmitting={isReportSubmitting}
      />

    </main>
  );
}
