import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import DashboardBottomNav from "../components/dashboard/DashboardBottomNav.jsx";
import DashboardIcon from "../components/dashboard/DashboardIcon.jsx";
import { chatTabs, ratingStars as stars } from "../components/dashboard/dashboardConstants.js";
import { dashboardPathForRole } from "../utils/navigation.js";
import { getDashboardCabinetEyebrow, getDashboardMenuItems } from "../utils/dashboardRoleContent.js";
import UniversityCompareSection from "../components/dashboard/UniversityCompareSection.jsx";
import PopularReviewsSection from "../components/dashboard/PopularReviewsSection.jsx";
import ChatMessageBubble from "../components/dashboard/ChatMessageBubble.jsx";
import GroupInfoModal from "../components/dashboard/GroupInfoModal.jsx";
import ProfileModal from "../components/dashboard/ProfileModal.jsx";
import ProfileSection from "../components/dashboard/ProfileSection.jsx";
import ReviewUniversityList from "../components/dashboard/ReviewUniversityList.jsx";
import SupportPanel from "../components/dashboard/SupportPanel.jsx";
import ReviewWorkspacePanel from "../components/dashboard/ReviewWorkspacePanel.jsx";
import UserAvatar from "../components/dashboard/UserAvatar.jsx";
import ChatUniversityRow from "../components/ChatUniversityRow.jsx";
import UnreadBadge from "../components/UnreadBadge.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import logo from "../assets/myuni-logo.png";
import { useAuth } from "../hooks/useAuth.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";
import { useDarkMode } from "../hooks/useDarkMode.js";
import { useMessageStream } from "../hooks/useMessageStream.js";
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
  sendDirectMessage,
  sendDirectTyping,
  sendUniversityMessage,
  reactToDirectMessage,
  reactToUniversityMessage,
  sendUniversityTyping,
  startDirectThread,
} from "../services/chatService.js";
import { getPublicUser } from "../services/userService.js";
import { resolveMediaUrl } from "../utils/media.js";
import {
  createReview,
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
  const [chatMembers, setChatMembers] = useState({ members: [], member_count: 0 });
  const [directThreads, setDirectThreads] = useState([]);
  const [draftThread, setDraftThread] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [directMessages, setDirectMessages] = useState([]);
  const [privateMessage, setPrivateMessage] = useState("");
  const [profileUser, setProfileUser] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
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
  const [reactingMessageId, setReactingMessageId] = useState(null);
  const [mobileChatScreen, setMobileChatScreen] = useState("list");
  const [mobileReviewScreen, setMobileReviewScreen] = useState("list");
  const [groupTypingUsers, setGroupTypingUsers] = useState([]);
  const { isPhone, isTablet } = useBreakpoint();
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

  const mergeMessages = useCallback((incoming) => {
    setGroupMessages((current) => {
      const map = new Map(current.map((item) => [item.id, item]));
      incoming.forEach((item) => map.set(item.id, item));
      return [...map.values()].sort((a, b) => a.id - b.id);
    });
  }, []);

  const mergePrivateMessages = useCallback((incoming) => {
    setDirectMessages((current) => {
      const map = new Map(current.map((item) => [item.id, item]));
      incoming.forEach((item) => map.set(item.id, item));
      return [...map.values()].sort((a, b) => a.id - b.id);
    });
  }, []);

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

  useMessageStream({
    streamUrl: groupStreamUrl,
    enabled: activeSection === "chats" && chatPanel === "group" && Boolean(selectedUniversityId),
    onMessages: mergeMessages,
    onTyping: setGroupTypingUsers,
  });

  useMessageStream({
    streamUrl: privateStreamUrl,
    enabled: activeSection === "chats" && chatPanel === "private" && Boolean(selectedThreadId),
    onMessages: mergePrivateMessages,
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

      if (section === "reviews") {
        setActiveSection("reviews");
      } else if (section === "popular") {
        setActiveSection("popular");
      } else if (section === "chats") {
        setActiveSection("chats");
      } else if (section === "profile") {
        setActiveSection("profile");
      }

      if (!universityName) {
        return;
      }

      const match = universityList.find(
        (university) => university.name === universityName || university.short_name === universityName
      );

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
        const items = await getUniversityMessages(selectedUniversityId);
        if (isMounted) {
          setGroupMessages(items);
        }
        await markUniversityChatRead(selectedUniversityId);
        if (isMounted) {
          refreshChatSummaries();
        }
      } catch {
        if (isMounted) {
          setGroupMessages([]);
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
        const items = await getDirectMessages(selectedThreadId);
        if (isMounted) {
          setDirectMessages(items);
        }
        await markDirectThreadRead(selectedThreadId);
        if (isMounted) {
          refreshChatSummaries();
        }
      } catch {
        if (isMounted) {
          setDirectMessages([]);
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
  }

  function backToReviewList() {
    setMobileReviewScreen("list");
  }

  const chatMessagesHeight = isPhone
    ? "h-[calc(100dvh-14rem)] min-h-[240px]"
    : isTablet
      ? "h-[min(520px,calc(100dvh-12rem))]"
      : "h-[470px]";

  const privateChatMessagesHeight = isPhone
    ? "h-[calc(100dvh-14rem)] min-h-[240px]"
    : isTablet
      ? "h-[min(640px,calc(100dvh-11rem))]"
      : "min-h-0 flex-1";

  const isPrivateChatLayout =
    !isPhone && activeSection === "chats" && chatListTab === "private";

  const isGroupChatLayout =
    !isPhone && activeSection === "chats" && chatPanel === "group";

  const isWideChatLayout = isPrivateChatLayout || isGroupChatLayout;

  const chatSectionGridClass = isPhone
    ? "grid-cols-1"
    : isWideChatLayout
      ? "md:grid-cols-[minmax(280px,30%)_minmax(0,1fr)] md:gap-3 lg:gap-4"
      : "md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] xl:grid-cols-[420px_1fr]";

  const groupChatMessagesHeight = isPhone
    ? "h-[calc(100dvh-14rem)] min-h-[200px]"
    : isTablet
      ? "h-[min(640px,calc(100dvh-11rem))]"
      : "min-h-0 flex-1";

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

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  async function handleJoin(universityId) {
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
  }

  async function sendGroupChatMessage(event) {
    event.preventDefault();

    if (!hasJoinedSelectedChat || !groupMessage.trim() || !selectedUniversityId || isGroupSending) {
      return;
    }

    setIsGroupSending(true);
    clearChatError();
    try {
      const created = await sendUniversityMessage(selectedUniversityId, groupMessage.trim());
      setGroupMessages((current) => [...current, created]);
      setGroupMessage("");
      setGroupTypingUsers([]);
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Guruh xabari yuborilmadi."));
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

    if (!privateMessage.trim() || !selectedThreadId || isPrivateSending) {
      return;
    }

    setIsPrivateSending(true);
    clearChatError();
    try {
      const created = await sendDirectMessage(selectedThreadId, privateMessage.trim());
      setDirectMessages((current) => [...current, created]);
      setPrivateMessage("");
      const threads = await getDirectThreads();
      setDirectThreads(threads);
      setDraftThread(null);
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Shaxsiy xabar yuborilmadi."));
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
    selectReviewUniversity(universityId);
    changeSection("reviews");
  }

  async function handleReviewLike(reviewId) {
    const result = await toggleReviewLike(reviewId);
    const updateItem = (item) =>
      item.id === reviewId ? { ...item, liked_by_me: result.liked, like_count: result.like_count } : item;
    setReviews((current) => current.map(updateItem));
    setPopularReviews((current) => current.map(updateItem));
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
        <aside className="hidden min-h-screen flex-col border-r border-slate-200 bg-white/90 p-5 backdrop-blur-xl lg:flex dark:border-white/10 dark:bg-slate-950/80">
          <Link to="/" className="flex items-center gap-3 rounded-3xl p-2">
            <img src={logo} alt="MyUni.uz logotipi" className="h-12 w-12 rounded-2xl object-cover shadow-glow" />
            <div>
              <p className="text-xl font-black">MyUni.uz</p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{cabinetEyebrow}</p>
            </div>
          </Link>

          <nav className="mt-8 flex-1 space-y-2 overflow-y-auto">
            {visibleMenuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => changeSection(item.id)}
                className={`flex min-h-[4.5rem] w-full items-center gap-4 rounded-3xl p-4 text-left transition ${
                  activeSection === item.id
                    ? "bg-slate-950 text-white shadow-soft dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-2xl ${
                    activeSection === item.id ? "bg-white/10" : "bg-slate-100 dark:bg-white/10"
                  }`}
                >
                  <DashboardIcon name={item.id} />
                </span>
                <span>
                  <span className="block font-black">{item.label}</span>
                  <span className="mt-0.5 block text-xs font-semibold opacity-70">{item.helper}</span>
                </span>
              </button>
            ))}
          </nav>

          <SupportPanel isStudent={isStudent} />
        </aside>

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
              <section
                className={`grid gap-4 md:items-stretch md:gap-6 ${chatSectionGridClass}`}
              >
                <div
                  className={`flex h-fit w-full max-h-[calc(100dvh-11rem)] flex-col self-start rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft sm:p-5 md:max-h-[calc(100vh-10rem)] dark:border-white/10 dark:bg-white/[0.06] ${
                    isPhone && mobileChatScreen !== "list" ? "hidden" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Chatlar</p>
                    <h2 className="mt-2 text-2xl font-black sm:text-3xl">Universitet tanlang</h2>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {chatTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleChatTabChange(tab.id)}
                        className={`relative rounded-2xl px-3 py-2.5 text-xs font-black transition hover:-translate-y-0.5 ${
                          chatListTab === tab.id
                            ? "bg-slate-950 text-white shadow-soft dark:bg-white dark:text-slate-950"
                            : "bg-slate-100 text-slate-600 hover:border-primary/30 hover:bg-slate-200 hover:text-slate-950 hover:shadow-sm dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20 dark:hover:text-white"
                        }`}
                      >
                        {tab.label}
                        {tab.id === "joined" && totalJoinedUnread > 0 && (
                          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-sm">
                            {totalJoinedUnread > 99 ? "99+" : totalJoinedUnread}
                          </span>
                        )}
                        {tab.id === "private" && totalPrivateUnread > 0 && (
                          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-sm">
                            {totalPrivateUnread > 99 ? "99+" : totalPrivateUnread}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {chatListTab === "search" && (
                    <input
                      value={universitySearch}
                      onChange={(event) => setUniversitySearch(event.target.value)}
                      placeholder="Universitet qidiring..."
                      className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-400/25"
                    />
                  )}

                  <div className="mt-4 max-h-[min(28rem,calc(100dvh-17rem))] space-y-1 overflow-y-auto overscroll-contain pr-1">
                    {chatListTab === "private" ? (
                      privateThreadList.length === 0 ? (
                        <p className="rounded-3xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-white/5">
                          Hali shaxsiy xabar yo'q. Guruh chatidan profilni ochib «Shaxsiy xabar» tugmasini bosing.
                        </p>
                      ) : (
                        privateThreadList.map((thread) => renderPrivateThreadRow(thread))
                      )
                    ) : filteredUniversities.length === 0 ? (
                      <p className="px-2 py-4 text-sm font-semibold text-slate-500">
                        {chatListTab === "joined"
                          ? "Hali qo'shilgan chat yo'q."
                          : "Universitet topilmadi."}
                      </p>
                    ) : (
                      filteredUniversities.map((university) => (
                        <ChatUniversityRow
                          key={university.id}
                          university={university}
                          isSelected={selectedUniversityId === university.id}
                          isJoined={joinedUniversityIds.has(university.id)}
                          onSelect={selectUniversityChat}
                        />
                      ))
                    )}
                  </div>
                </div>

                <div
                  className={`flex min-h-0 flex-col overflow-hidden border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06] ${
                    isPhone && mobileChatScreen !== "chat" ? "hidden" : ""
                  } ${
                    isWideChatLayout
                      ? "min-h-[calc(100vh-11rem)] rounded-2xl md:rounded-[1.25rem]"
                      : "rounded-[2rem]"
                  }`}
                >
                  {chatPanel === "private" && selectedThread ? (
                    <div className="flex min-h-0 flex-1 flex-col">
                      <div className="border-b border-slate-200 p-4 sm:p-6 dark:border-white/10">
                        {isPhone && (
                          <button
                            type="button"
                            onClick={backToChatList}
                            className="mb-3 flex items-center gap-2 text-sm font-black text-primary"
                          >
                            ← Ro'yxat
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedThread.other_user_id) {
                              openUserProfile(
                                selectedThread.other_user_id,
                                {
                                  display_name: selectedThread.other_user_name,
                                  avatar_url: selectedThread.other_user_avatar_url,
                                },
                                {}
                              );
                            }
                          }}
                          className="flex w-full items-center gap-4 rounded-2xl text-left transition hover:bg-slate-50 dark:hover:bg-white/5"
                        >
                          <UserAvatar
                            name={selectedThread.other_user_name}
                            avatarUrl={selectedThread.other_user_avatar_url}
                            size="lg"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Shaxsiy chat</p>
                            <h2 className="mt-1 truncate text-2xl font-black sm:text-3xl hover:text-primary">
                              {selectedThread.other_user_name}
                            </h2>
                          </div>
                          <span className="shrink-0 text-xl text-slate-400">›</span>
                        </button>
                      </div>
                      <div
                        className={`overflow-y-auto overflow-x-hidden bg-[#e8ecf4] px-4 py-4 sm:px-6 sm:py-5 dark:bg-slate-950/60 ${privateChatMessagesHeight}`}
                      >
                        {directMessages.length === 0 ? (
                          <div className="grid h-full min-h-[12rem] place-items-center text-center text-slate-500">
                            Birinchi shaxsiy xabaringizni yozing
                          </div>
                        ) : (
                          <div className="w-full space-y-3 pb-3">
                            {directMessages.map((item) => (
                              <ChatMessageBubble
                                key={item.id}
                                message={item}
                                formatTime={formatTime}
                                onReact={handlePrivateReaction}
                                onAuthorClick={(authorId, prefetch) =>
                                  openUserProfile(authorId, prefetch, {})
                                }
                                isReacting={reactingMessageId === item.id}
                                containerClassName="max-w-[min(42rem,78%)]"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {privateTypingUsers.length > 0 && (
                        <p className="border-t border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10">
                          {privateTypingUsers.join(", ")} yozmoqda...
                        </p>
                      )}
                      <form
                        onSubmit={sendPrivateChatMessage}
                        className="border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/90"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <input
                            value={privateMessage}
                            onChange={(event) => {
                              setPrivateMessage(event.target.value);
                              notifyPrivateTyping();
                            }}
                            placeholder="Shaxsiy xabar yozing..."
                            className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-400/25"
                          />
                          <button
                            type="submit"
                            disabled={!privateMessage.trim() || isPrivateSending}
                            className="rounded-2xl bg-premium-gradient px-6 py-3 font-black text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Yuborish
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : chatPanel === "private" ? (
                    <div className="grid min-h-[280px] flex-1 place-items-center bg-slate-50 p-8 text-center md:min-h-[420px] dark:bg-slate-950/40">
                      <p className="text-slate-500 dark:text-slate-400">Chap ro'yxatdan suhbat tanlang</p>
                    </div>
                  ) : (
                    <div className="flex min-h-0 flex-1 flex-col">
                      <div className="shrink-0 border-b border-slate-200 p-4 sm:px-5 dark:border-white/10">
                        {isPhone && selectedUniversity && (
                          <button
                            type="button"
                            onClick={backToChatList}
                            className="mb-3 flex items-center gap-2 text-sm font-black text-primary"
                          >
                            ← Ro&apos;yxat
                          </button>
                        )}
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={openGroupInfoModal}
                            className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl text-left transition hover:bg-slate-50 dark:hover:bg-white/5"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                                Guruh chat
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <h2 className="text-2xl font-black sm:text-3xl hover:text-primary">
                                  {selectedUniversity?.short_name || selectedUniversity?.name || "Universitet"}
                                </h2>
                                {selectedUniversity?.location && (
                                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    {selectedUniversity.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="shrink-0 text-xl text-slate-400" aria-hidden="true">
                              ›
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={openGroupInfoModal}
                            className="flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-primary hover:bg-blue-50/80 dark:border-white/10 dark:bg-white/5 dark:hover:border-primary/40"
                          >
                            <div className="flex -space-x-2">
                              {activeChatMembers.members.length === 0 ? (
                                <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-[10px] font-black text-slate-500 dark:bg-white/10">
                                  ?
                                </span>
                              ) : (
                                activeChatMembers.members.slice(0, 3).map((member) => (
                                  <UserAvatar
                                    key={member.id}
                                    name={member.display_name}
                                    avatarUrl={member.avatar_url}
                                    size="sm"
                                  />
                                ))
                              )}
                            </div>
                            <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                              {activeChatMembers.member_count === 0
                                ? "A'zolar"
                                : `${activeChatMembers.member_count} a'zo`}
                            </span>
                            <span className="text-slate-400" aria-hidden="true">
                              ›
                            </span>
                          </button>

                          {!hasJoinedSelectedChat && selectedUniversity ? (
                            <button
                              type="button"
                              onClick={() => handleJoin(selectedUniversity.id)}
                              className="shrink-0 rounded-2xl border border-primary/30 bg-blue-50 px-3 py-2 text-xs font-black text-primary transition hover:bg-blue-100 dark:border-primary/40 dark:bg-blue-400/15 dark:hover:bg-blue-400/25 sm:text-sm"
                            >
                              Qo&apos;shilish
                            </button>
                          ) : hasJoinedSelectedChat ? (
                            <button
                              type="button"
                              onClick={handleLeaveChat}
                              className="shrink-0 rounded-2xl border border-red-200 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-50 dark:border-red-400/30 dark:text-red-400 dark:hover:bg-red-500/10 sm:text-sm"
                            >
                              Chiqish
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div
                        className={`overflow-y-auto overflow-x-hidden bg-[#e8ecf4] px-4 py-4 sm:px-6 sm:py-5 dark:bg-slate-950/60 ${groupChatMessagesHeight}`}
                      >
                        {groupMessages.length === 0 ? (
                          <div className="grid h-full min-h-[12rem] place-items-center text-center text-slate-500">
                            {hasJoinedSelectedChat
                              ? "Birinchi xabarni yozing"
                              : "Chatga qo'shilib yozing"}
                          </div>
                        ) : (
                          <div className="w-full space-y-3 pb-3">
                            {groupMessages.map((item) => (
                              <ChatMessageBubble
                                key={item.id}
                                message={{ ...item, is_mine: item.is_mine ?? item.author_id === user?.id }}
                                formatTime={formatTime}
                                onReact={handleGroupReaction}
                                onAuthorClick={openGroupChatAuthorProfile}
                                isReacting={reactingMessageId === item.id}
                                containerClassName="max-w-[min(42rem,78%)]"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {groupTypingUsers.length > 0 && (
                        <p className="shrink-0 border-t border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10">
                          {groupTypingUsers.join(", ")} yozmoqda...
                        </p>
                      )}

                      <form
                        onSubmit={sendGroupChatMessage}
                        className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/90"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <input
                            value={groupMessage}
                            onChange={(event) => {
                              setGroupMessage(event.target.value);
                              notifyGroupTyping();
                            }}
                            disabled={!hasJoinedSelectedChat}
                            placeholder={
                              hasJoinedSelectedChat
                                ? "Xabar yozing..."
                                : "Qo'shilgandan keyin yozish mumkin"
                            }
                            className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-400/25 dark:disabled:bg-white/5 dark:disabled:text-slate-500"
                          />
                          <button
                            type="submit"
                            disabled={!hasJoinedSelectedChat || !groupMessage.trim() || isGroupSending}
                            className="rounded-2xl bg-premium-gradient px-6 py-3 font-black text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Yuborish
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {showGroupInfoModal && chatPanel === "group" && (
                  <GroupInfoModal
                    university={groupInfoUniversity}
                    isDetailLoading={isGroupInfoDetailLoading}
                    members={activeChatMembers.members}
                    memberCount={activeChatMembers.member_count}
                    hasJoined={hasJoinedSelectedChat}
                    onJoin={() => selectedUniversity && handleJoin(selectedUniversity.id)}
                    onLeave={handleLeaveChat}
                    onMemberClick={(member) =>
                      openUserProfile(
                        member.id,
                        {
                          display_name: member.display_name,
                          avatar_url: member.avatar_url,
                          role_label: member.is_me ? "Siz" : member.role_label,
                          university: member.university,
                        },
                        { universityId: selectedUniversityId }
                      )
                    }
                    onClose={() => setShowGroupInfoModal(false)}
                  />
                )}

                <ProfileModal
                  profileUser={profileUser}
                  isProfileLoading={isProfileLoading}
                  currentUserId={user?.id}
                  hidePrivateMessage={hidePrivateMessageButton}
                  onPrivateMessage={() => openPrivateChatWithUser(profileUser.id)}
                  onClose={() => setProfileUser(null)}
                />
              </section>
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
              <section
                className={`grid items-stretch gap-4 lg:gap-6 ${
                  isPhone ? "grid-cols-1" : "xl:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]"
                }`}
              >
                <ReviewUniversityList
                  title={isStudent ? "Sharh yozish" : "Sharhlarni ko'rish"}
                  subtitle={isStudent ? "O'qiyotgan yoki tanlangan OTM" : "Qiziqayotgan universitet"}
                  hint={
                    isStudent
                      ? "Baholang va tajribangizni yozing."
                      : "Talabalar sharhlarini o'qing — yozish faqat talabalarga."
                  }
                  search={reviewUniversitySearch}
                  onSearchChange={setReviewUniversitySearch}
                  universities={filteredReviewUniversities}
                  selectedId={reviewUniversity}
                  onSelect={selectReviewUniversity}
                  className={isPhone && mobileReviewScreen !== "list" ? "hidden" : ""}
                />

                <ReviewWorkspacePanel
                  isStudent={isStudent}
                  isPhone={isPhone}
                  reviewUniversity={reviewUniversity}
                  reviewUniversityDetail={reviewUniversityDetail}
                  isReviewDetailLoading={isReviewDetailLoading}
                  reviews={reviews}
                  onBack={backToReviewList}
                  onSubmitReview={submitReview}
                  rating={rating}
                  onRatingChange={setRating}
                  reviewText={reviewText}
                  onReviewTextChange={setReviewText}
                  isReviewSubmitting={isReviewSubmitting}
                  reviewSubmitError={reviewSubmitError}
                  onLike={handleReviewLike}
                  stars={stars}
                  className={isPhone && mobileReviewScreen !== "detail" ? "hidden" : ""}
                />
              </section>
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
    </main>
  );
}
