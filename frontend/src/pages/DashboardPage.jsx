import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardBottomNav from "../components/dashboard/DashboardBottomNav.jsx";
import DashboardMobileSupport from "../components/dashboard/DashboardMobileSupport.jsx";
import { dashboardPathForRole } from "../utils/navigation.js";
import { mainContentProps } from "../utils/mainContent.js";
import { scrollElementIntoView } from "../utils/scrollIntoView.js";
import { getDashboardCabinetEyebrow, getDashboardMenuItems } from "../utils/dashboardRoleContent.js";
import UniversityCompareSection from "../components/dashboard/UniversityCompareSection.jsx";
import PopularReviewsSection from "../components/dashboard/PopularReviewsSection.jsx";
import MessageReportDialog from "../components/MessageReportDialog.jsx";
import ReviewReportDialog from "../components/reviews/ReviewReportDialog.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import OnboardingWizard from "../components/dashboard/OnboardingWizard.jsx";
import ProfileSection from "../components/dashboard/ProfileSection.jsx";
import DashboardChatSection from "./dashboard/DashboardChatSection.jsx";
import DashboardHomeSection from "./dashboard/DashboardHomeSection.jsx";
import DashboardReviewsSection from "./dashboard/DashboardReviewsSection.jsx";
import DashboardSidebar from "./dashboard/DashboardSidebar.jsx";
import DashboardHeader from "./dashboard/DashboardHeader.jsx";
import DashboardSectionSkeleton from "../components/skeletons/DashboardSkeletons.jsx";
import UserAvatarWithPresence from "../components/dashboard/UserAvatarWithPresence.jsx";
import AnimatedTypingDots from "../components/chat/AnimatedTypingDots.jsx";
import UnreadBadge from "../components/UnreadBadge.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";
import { useDarkMode } from "../hooks/useDarkMode.js";
import { useToast } from "../hooks/useToast.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { useDashboardKeyboardShortcuts } from "../hooks/useDashboardKeyboardShortcuts.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { useWebPush } from "../hooks/useWebPush.js";
import { useDashboardNavigation } from "../hooks/dashboard/useDashboardNavigation.js";
import { useDashboardData } from "../hooks/dashboard/useDashboardData.js";
import { useJoinedChatsTyping } from "../hooks/useJoinedChatsTyping.js";
import { useDirectThreadsTyping } from "../hooks/useDirectThreadsTyping.js";
import { mergeById, maxMessageId, useMessageStream } from "../hooks/useMessageStream.js";
import {
  getDirectMessages,
  getDirectThreads,
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
import {
  blockUser,
  getBlockedUsers,
  getMutedUsers,
  getUniversityChatTags,
  muteUser,
  unmuteUser,
  unblockUser,
} from "../services/communityService.js";
import { getPublicUser } from "../services/userService.js";
import { resolveMediaUrl } from "../utils/media.js";
import {
  aspectRatingsComplete,
  buildDefaultAspectRatings,
  flattenReviewPayload,
} from "../utils/reviewAspects.js";
import {
  createReview,
  deleteReview,
  getUniversityDetail,
  getReviews,
  reportReview,
  toggleReviewLike,
} from "../services/universityService.js";
import { getApiErrorMessage } from "../utils/apiErrors.js";
import { createChatErrorReporter } from "../utils/chatActionError.js";
import { createActiveTypingNotifier } from "../utils/throttledTyping.js";
import { buildMuteKey, isChatUserMuted } from "../utils/chatMute.js";
import { shouldOfferOnboarding, markOnboardingComplete, isOnboardingComplete } from "../utils/onboardingStorage.js";
import { markApplicantChecklistStep } from "../utils/applicantChecklist.js";
import {
  findUniversityById,
  joinedUniversityIdsHas,
  sameUniversityId,
} from "../utils/universityIds.js";

export default function DashboardPage({ role }) {
  const navigate = useNavigate();
  const { logout, user, refreshUser } = useAuth();
  const { isDark, setIsDark } = useDarkMode();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const profileRole = user?.profile?.role;
  const isStudent = profileRole === "student";
  const profile = user?.profile;

  usePageMeta({
    title: isStudent ? "Talaba kabineti | MyUni.uz" : "Abituriyent kabineti | MyUni.uz",
    description: "MyUni.uz shaxsiy kabineti.",
    path: isStudent ? "/student/dashboard" : "/applicant/dashboard",
    robots: "noindex, nofollow",
  });

  useEffect(() => {
    if (!profileRole || profileRole === role) {
      return;
    }
    navigate(dashboardPathForRole(profileRole), { replace: true });
  }, [profileRole, role, navigate]);

  const displayName = profile?.full_name || user?.first_name || user?.email || "Foydalanuvchi";
  const [selectedUniversityId, setSelectedUniversityId] = useState(null);
  const onDashboardLoadError = useCallback(() => {
    toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi.");
  }, [toast]);
  const [isGroupSending, setIsGroupSending] = useState(false);
  const [isGroupJoining, setIsGroupJoining] = useState(false);
  const [isPrivateSending, setIsPrivateSending] = useState(false);
  const chatErrorReporterRef = useRef(null);
  if (!chatErrorReporterRef.current) {
    chatErrorReporterRef.current = createChatErrorReporter((message, options) =>
      toastRef.current.error(message, options)
    );
  }
  const { reportChatError, clearChatError } = chatErrorReporterRef.current;
  const groupTypingNotifyRef = useRef(() => {});
  const privateTypingNotifyRef = useRef(() => {});

  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [composerFocusToken, setComposerFocusToken] = useState(0);
  const onboardingOfferedRef = useRef(false);
  const [chatListTab, setChatListTab] = useState("search");
  const [universitySearch, setUniversitySearch] = useState("");
  const [groupMessage, setGroupMessage] = useState("");
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupPinnedMessage, setGroupPinnedMessage] = useState(null);
  const [chatMembers, setChatMembers] = useState({ members: [], member_count: 0 });
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
  const [isPrivateChatSearchOpen, setIsPrivateChatSearchOpen] = useState(false);
  const [privateChatSearchQuery, setPrivateChatSearchQuery] = useState("");
  const [highlightedGroupMessageId, setHighlightedGroupMessageId] = useState(null);
  const [highlightedPrivateMessageId, setHighlightedPrivateMessageId] = useState(null);
  const groupMessageRefs = useRef({});
  const privateMessageRefs = useRef({});
  const [groupInfoDetail, setGroupInfoDetail] = useState(null);
  const [isGroupInfoDetailLoading, setIsGroupInfoDetailLoading] = useState(false);
  const [chatPanel, setChatPanel] = useState("group");
  const [reviewUniversity, setReviewUniversity] = useState("");
  const [reviewUniversityDetail, setReviewUniversityDetail] = useState(null);
  const [reviewUniversitySearch, setReviewUniversitySearch] = useState("");
  const [isReviewDetailLoading, setIsReviewDetailLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [aspectRatings, setAspectRatings] = useState(buildDefaultAspectRatings);
  const [studyDirectionId, setStudyDirectionId] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [editingChatMessage, setEditingChatMessage] = useState(null);
  const [reactingMessageId, setReactingMessageId] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [reviewReportTarget, setReviewReportTarget] = useState(null);
  const [isReviewReportSubmitting, setIsReviewReportSubmitting] = useState(false);
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [messageDeleteTarget, setMessageDeleteTarget] = useState(null);
  const [isMessageDeleting, setIsMessageDeleting] = useState(false);
  const [reviewDeleteTarget, setReviewDeleteTarget] = useState(null);
  const [isReviewDeleting, setIsReviewDeleting] = useState(false);
  const [mobileChatScreen, setMobileChatScreen] = useState("list");
  const [mobileReviewScreen, setMobileReviewScreen] = useState("list");
  const [groupTypingUsers, setGroupTypingUsers] = useState([]);
  const [privateTypingUsers, setPrivateTypingUsers] = useState([]);
  const [groupChatTags, setGroupChatTags] = useState([]);
  const [activeGroupTag, setActiveGroupTag] = useState("");
  const [groupStreamReady, setGroupStreamReady] = useState(false);
  const [privateStreamReady, setPrivateStreamReady] = useState(false);
  const [privateMessagesReloadNonce, setPrivateMessagesReloadNonce] = useState(0);
  const privateThreadLoadRef = useRef(null);
  const privateSyncRequestRef = useRef(0);
  const { isPhone, isTablet, isDesktop, isWideChat } = useBreakpoint();
  const isCompactLayout = isPhone || isTablet;
  const isReviewCompactLayout = isCompactLayout;
  const [comparePrefill, setComparePrefill] = useState(null);
  const [checklistVersion, setChecklistVersion] = useState(0);
  const [blockedUserIds, setBlockedUserIds] = useState(new Set());
  const [blockedMeUserIds, setBlockedMeUserIds] = useState(new Set());
  const [mutedUserKeys, setMutedUserKeys] = useState(new Set());
  const [isBlockActionSubmitting, setIsBlockActionSubmitting] = useState(false);

  const visibleMenuItems = useMemo(() => getDashboardMenuItems(isStudent), [isStudent]);
  const cabinetEyebrow = getDashboardCabinetEyebrow(isStudent);
  const dashboardPath = dashboardPathForRole(profileRole);

  const {
    universities,
    isDataLoading,
    joinedUniversityIds,
    setJoinedUniversityIds,
    directThreads,
    setDirectThreads,
    popularReviews,
    setPopularReviews,
    refreshChatSummaries,
  } = useDashboardData({
    profileUniversity: profile?.university,
    onLoadError: onDashboardLoadError,
    setSelectedUniversityId,
  });

  const refreshChatSummariesRef = useRef(refreshChatSummaries);
  refreshChatSummariesRef.current = refreshChatSummaries;

  const {
    activeSection,
    changeSection: changeSectionBase,
    openUniversityChat,
    openUniversityReviews,
    syncChatUniversityInUrl,
    syncPrivateThreadInUrl,
  } = useDashboardNavigation({
    universities,
    setReviewUniversity,
    setMobileReviewScreen,
    setSelectedUniversityId,
    setSelectedThreadId,
    setChatPanel,
    setMobileChatScreen,
    setChatListTab,
  });

  const changeSection = useCallback(
    (sectionId) => {
      changeSectionBase(sectionId);
      if (sectionId === "reviews" || sectionId === "popular" || sectionId === "compare") {
        setChecklistVersion((value) => value + 1);
      }
    },
    [changeSectionBase]
  );

  const handleOpenCompareSuggestion = useCallback(
    (universities) => {
      if (!universities?.length) {
        return;
      }
      markApplicantChecklistStep("compare");
      setChecklistVersion((value) => value + 1);
      setComparePrefill(universities.map((university) => String(university.id)));
      changeSectionBase("compare");
    },
    [changeSectionBase]
  );

  const clearComparePrefill = useCallback(() => {
    setComparePrefill(null);
  }, []);

  const handleOpenUniversityReviews = useCallback(
    (universityId) => {
      openUniversityReviews(universityId);
      setChecklistVersion((value) => value + 1);
    },
    [openUniversityReviews]
  );

  const totalPrivateUnread = useMemo(
    () => directThreads.reduce((sum, thread) => sum + (thread.unread_count ?? 0), 0),
    [directThreads]
  );

  const totalJoinedUnread = useMemo(
    () =>
      universities.reduce((sum, university) => {
        if (!joinedUniversityIdsHas(joinedUniversityIds, university.id)) {
          return sum;
        }
        return sum + (university.unread_count ?? 0);
      }, 0),
    [universities, joinedUniversityIds]
  );

  const notifications = useNotifications({
    enabled: !isDataLoading,
    chatUnreadTotal: totalPrivateUnread + totalJoinedUnread,
    dashboardPath,
  });

  useWebPush({ enabled: !isDataLoading && joinedUniversityIds.size > 0 });

  const userUniversity = profile?.university || universities[0]?.name || "";
  const savedAvatarUrl = resolveMediaUrl(profile?.avatar_url || "");
  const selectedUniversity =
    selectedUniversityId != null
      ? findUniversityById(universities, selectedUniversityId)
      : universities[0] ?? null;
  const hasJoinedSelectedChat = selectedUniversityId
    ? joinedUniversityIdsHas(joinedUniversityIds, selectedUniversityId)
    : false;
  const groupInfoUniversity = useMemo(() => {
    if (!selectedUniversity) {
      return null;
    }
    if (sameUniversityId(groupInfoDetail?.id, selectedUniversity.id)) {
      return { ...selectedUniversity, ...groupInfoDetail };
    }
    return selectedUniversity;
  }, [selectedUniversity, groupInfoDetail]);
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

  const privateChatSearchTrimmed = privateChatSearchQuery.trim().toLowerCase();
  const privateChatSearchResults = useMemo(() => {
    if (!isPrivateChatSearchOpen) {
      return [];
    }
    if (!privateChatSearchTrimmed) {
      return directMessages.slice(-50).reverse();
    }
    return directMessages.filter((item) => {
      const text = (item.text || "").toLowerCase();
      const author = (item.author || item.sender_name || "").toLowerCase();
      return text.includes(privateChatSearchTrimmed) || author.includes(privateChatSearchTrimmed);
    });
  }, [directMessages, isPrivateChatSearchOpen, privateChatSearchTrimmed]);

  function closeGroupChatSearch() {
    setIsGroupChatSearchOpen(false);
    setGroupChatSearchQuery("");
  }

  function closePrivateChatSearch() {
    setIsPrivateChatSearchOpen(false);
    setPrivateChatSearchQuery("");
  }

  function openGroupChatSearch() {
    closePrivateChatSearch();
    setIsGroupChatSearchOpen(true);
    setGroupChatSearchQuery("");
  }

  function openPrivateChatSearch() {
    closeGroupChatSearch();
    setIsPrivateChatSearchOpen(true);
    setPrivateChatSearchQuery("");
  }

  function jumpToGroupMessage(messageId) {
    closeGroupChatSearch();
    setHighlightedGroupMessageId(messageId);
    window.requestAnimationFrame(() => {
      scrollElementIntoView(groupMessageRefs.current[messageId], { block: "center" });
    });
    window.setTimeout(() => setHighlightedGroupMessageId(null), 2600);
  }

  function jumpToPrivateMessage(messageId) {
    closePrivateChatSearch();
    setHighlightedPrivateMessageId(messageId);
    window.requestAnimationFrame(() => {
      scrollElementIntoView(privateMessageRefs.current[messageId], { block: "center" });
    });
    window.setTimeout(() => setHighlightedPrivateMessageId(null), 2600);
  }

  const hidePrivateMessageButton = useMemo(() => {
    if (!profileUser?.id) {
      return false;
    }

    const thread = directThreads.find((item) => item.other_user_id === profileUser.id);
    return Boolean(thread?.both_replied);
  }, [profileUser?.id, directThreads]);

  const isProfileUserBlockedByMe = useMemo(() => {
    if (!profileUser?.id) {
      return false;
    }

    if (profileUser.blocked_by_me) {
      return true;
    }

    const thread = directThreads.find((item) => item.other_user_id === profileUser.id);
    if (thread?.other_user_blocked_by_me) {
      return true;
    }

    return blockedUserIds.has(profileUser.id);
  }, [profileUser?.id, profileUser?.blocked_by_me, directThreads, blockedUserIds]);

  const hasProfileBlockRelationship = useMemo(() => {
    if (!profileUser?.id) {
      return false;
    }

    if (profileUser.has_block_relationship) {
      return true;
    }

    const thread = directThreads.find((item) => item.other_user_id === profileUser.id);
    if (thread?.has_block_relationship) {
      return true;
    }

    return blockedUserIds.has(profileUser.id) || blockedMeUserIds.has(profileUser.id);
  }, [
    profileUser?.id,
    profileUser?.has_block_relationship,
    directThreads,
    blockedUserIds,
    blockedMeUserIds,
  ]);

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

  const mergePrivateMessages = useCallback((incoming) => {
    setDirectMessages((current) => mergeById(current, incoming));
    refreshChatSummariesRef.current();
  }, []);

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
    groupTypingNotifyRef.current = createActiveTypingNotifier(
      () => sendUniversityTyping(selectedUniversityId),
      {
        intervalMs: 2000,
        idleMs: 1800,
        onError: (error) =>
          reportChatError(
            getApiErrorMessage(error, "Yozish holati yuborilmadi. Chatga qo'shilganingizni tekshiring.")
          ),
      }
    );
  }, [selectedUniversityId, reportChatError]);

  useEffect(() => {
    privateTypingNotifyRef.current = createActiveTypingNotifier(
      () => sendDirectTyping(selectedThreadId),
      {
        intervalMs: 2000,
        idleMs: 1800,
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
    closePrivateChatSearch();
    setHighlightedGroupMessageId(null);
    setHighlightedPrivateMessageId(null);
    groupMessageRefs.current = {};
    privateMessageRefs.current = {};
    setGroupTypingUsers([]);
  }, [selectedUniversityId]);

  useEffect(() => {
    closePrivateChatSearch();
    setHighlightedPrivateMessageId(null);
    privateMessageRefs.current = {};
  }, [selectedThreadId]);

  const { resetSinceId: resetGroupStreamSinceId } = useMessageStream({
    streamUrl: groupStreamUrl,
    enabled:
      activeSection === "chats" &&
      chatPanel === "group" &&
      hasJoinedSelectedChat &&
      groupStreamReady,
    onMessages: mergeMessages,
    onMessageUpdated: mergeGroupUpdated,
    onMessageDeleted: removeGroupMessages,
    onTyping: setGroupTypingUsers,
  });

  const { resetSinceId: resetPrivateStreamSinceId } = useMessageStream({
    streamUrl: privateStreamUrl,
    enabled:
      activeSection === "chats" &&
      chatPanel === "private" &&
      Boolean(selectedThreadId) &&
      privateStreamReady,
    onMessages: mergePrivateMessages,
    onMessageUpdated: mergePrivateUpdated,
    onMessageDeleted: removePrivateMessages,
    onTyping: setPrivateTypingUsers,
  });

  const resetGroupStreamSinceIdRef = useRef(resetGroupStreamSinceId);
  resetGroupStreamSinceIdRef.current = resetGroupStreamSinceId;
  const resetPrivateStreamSinceIdRef = useRef(resetPrivateStreamSinceId);
  resetPrivateStreamSinceIdRef.current = resetPrivateStreamSinceId;

  const polledJoinedChatsTyping = useJoinedChatsTyping({
    enabled:
      !isDataLoading &&
      joinedUniversityIds.size > 0 &&
      (activeSection === "chats" || activeSection === "home"),
    refreshMs: 1500,
  });

  const polledDirectThreadsTyping = useDirectThreadsTyping({
    enabled:
      !isDataLoading &&
      directThreads.length > 0 &&
      (activeSection === "chats" || activeSection === "home"),
    refreshMs: 1500,
  });

  const joinedChatsTypingByUniversity = useMemo(() => {
    const merged = { ...polledJoinedChatsTyping };
    const canUseLiveTyping =
      activeSection === "chats" &&
      chatPanel === "group" &&
      groupStreamReady &&
      selectedUniversityId;

    if (canUseLiveTyping) {
      merged[String(selectedUniversityId)] = groupTypingUsers;
    }

    return merged;
  }, [
    polledJoinedChatsTyping,
    selectedUniversityId,
    chatPanel,
    groupTypingUsers,
    groupStreamReady,
    activeSection,
  ]);

  const getUniversityTypingUsers = useCallback(
    (universityId) => joinedChatsTypingByUniversity[String(universityId)] ?? [],
    [joinedChatsTypingByUniversity]
  );

  const directThreadsTypingById = useMemo(() => {
    const merged = { ...polledDirectThreadsTyping };
    const canUseLiveTyping =
      activeSection === "chats" &&
      chatPanel === "private" &&
      privateStreamReady &&
      selectedThreadId;

    if (canUseLiveTyping) {
      merged[String(selectedThreadId)] = privateTypingUsers;
    }

    return merged;
  }, [
    polledDirectThreadsTyping,
    selectedThreadId,
    chatPanel,
    privateTypingUsers,
    privateStreamReady,
    activeSection,
  ]);

  const getThreadTypingUsers = useCallback(
    (threadId) => directThreadsTypingById[String(threadId)] ?? [],
    [directThreadsTypingById]
  );

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

  useEffect(() => {
    if (!selectedUniversityId || chatPanel !== "group") {
      setGroupStreamReady(false);
      return undefined;
    }

    const isMember = joinedUniversityIdsHas(joinedUniversityIds, selectedUniversityId);
    let isMounted = true;
    setGroupStreamReady(false);

    async function loadMessages() {
      try {
        const { messages, pinned } = await getUniversityMessages(selectedUniversityId, {
          tag: isMember && activeGroupTag ? activeGroupTag : undefined,
        });
        if (!isMounted) {
          return;
        }
        setGroupMessages(messages);
        setGroupPinnedMessage(pinned);
        if (isMember) {
          resetGroupStreamSinceIdRef.current(maxMessageId(messages));
          setGroupStreamReady(true);
          await markUniversityChatRead(selectedUniversityId);
          refreshChatSummariesRef.current();
        }
      } catch {
        if (isMounted) {
          setGroupMessages([]);
          setGroupPinnedMessage(null);
          setGroupStreamReady(false);
        }
      }
    }

    loadMessages();
    return () => {
      isMounted = false;
      setGroupStreamReady(false);
    };
  }, [
    selectedUniversityId,
    chatPanel,
    joinedUniversityIds,
    activeGroupTag,
  ]);

  useEffect(() => {
    if (!selectedUniversityId || !joinedUniversityIdsHas(joinedUniversityIds, selectedUniversityId)) {
      setGroupChatTags([]);
      return undefined;
    }

    let isMounted = true;

    getUniversityChatTags(selectedUniversityId)
      .then((tags) => {
        if (isMounted) {
          setGroupChatTags(tags);
        }
      })
      .catch(() => {
        if (isMounted) {
          setGroupChatTags([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedUniversityId, joinedUniversityIds, groupMessages.length]);

  useEffect(() => {
    if (!selectedThreadId || chatPanel !== "private") {
      setPrivateStreamReady(false);
      privateThreadLoadRef.current = null;
      return undefined;
    }

    const isNewThread = privateThreadLoadRef.current !== selectedThreadId;
    privateThreadLoadRef.current = selectedThreadId;

    let isMounted = true;
    setPrivateStreamReady(false);

    if (isNewThread) {
      setDirectMessages([]);
      setPrivatePinnedMessage(null);
    }

    async function loadPrivateMessages() {
      try {
        const { messages, pinned } = await getDirectMessages(selectedThreadId);
        if (!isMounted) {
          return;
        }
        setDirectMessages((current) => (isNewThread ? messages : mergeById(current, messages)));
        setPrivatePinnedMessage(pinned);
        resetPrivateStreamSinceIdRef.current(maxMessageId(messages));
        setPrivateStreamReady(true);
        await markDirectThreadRead(selectedThreadId);
        if (isMounted) {
          refreshChatSummariesRef.current();
        }
      } catch {
        if (isMounted) {
          if (isNewThread) {
            setDirectMessages([]);
            setPrivatePinnedMessage(null);
          }
          setPrivateStreamReady(false);
        }
      }
    }

    loadPrivateMessages();
    return () => {
      isMounted = false;
    };
  }, [selectedThreadId, chatPanel, privateMessagesReloadNonce]);

  useEffect(() => {
    if (
      !privateStreamReady ||
      !selectedThreadId ||
      chatPanel !== "private" ||
      activeSection !== "chats"
    ) {
      return undefined;
    }

    let cancelled = false;
    let pollVersion = 0;

    async function pollPrivateMessages() {
      const version = ++pollVersion;
      try {
        const { messages, pinned } = await getDirectMessages(selectedThreadId);
        if (cancelled || version !== pollVersion) {
          return;
        }
        setDirectMessages((current) => {
          const merged = mergeById(current, messages);
          resetPrivateStreamSinceIdRef.current(maxMessageId(merged));
          return merged;
        });
        setPrivatePinnedMessage(pinned);
      } catch {
        // ignore polling errors
      }
    }

    pollPrivateMessages();
    const intervalId = window.setInterval(pollPrivateMessages, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [privateStreamReady, selectedThreadId, chatPanel, activeSection]);

  useEffect(() => {
    if (!selectedThreadId || chatPanel !== "private" || !privateStreamReady) {
      return undefined;
    }

    const thread = directThreads.find((item) => item.id === selectedThreadId);
    if (!thread?.last_message?.created_at) {
      return undefined;
    }

    const remoteTime = new Date(thread.last_message.created_at).getTime();
    const localMaxTime = directMessages.reduce(
      (max, message) => Math.max(max, new Date(message.created_at).getTime()),
      0
    );

    if (remoteTime <= localMaxTime + 500) {
      return undefined;
    }

    let cancelled = false;
    const requestId = ++privateSyncRequestRef.current;

    async function syncPrivateMessagesFromThreadSummary() {
      try {
        const { messages, pinned } = await getDirectMessages(selectedThreadId);
        if (cancelled || requestId !== privateSyncRequestRef.current) {
          return;
        }
        setDirectMessages((current) => {
          const merged = mergeById(current, messages);
          resetPrivateStreamSinceIdRef.current(maxMessageId(merged));
          return merged;
        });
        setPrivatePinnedMessage(pinned);
      } catch {
        // ignore sync errors
      }
    }

    syncPrivateMessagesFromThreadSummary();
    return () => {
      cancelled = true;
    };
  }, [
    directThreads,
    selectedThreadId,
    chatPanel,
    privateStreamReady,
    directMessages,
  ]);

  const activeChatMembers =
    selectedUniversityId && chatPanel === "group"
      ? {
          members: chatMembers.members,
          member_count:
            chatMembers.member_count > 0
              ? chatMembers.member_count
              : (selectedUniversity?.member_count ?? 0),
        }
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

  useEffect(() => {
    if (isDataLoading) {
      return undefined;
    }

    let cancelled = false;

    getBlockedUsers()
      .then(({ blockedUsers, blockedMeUsers }) => {
        if (!cancelled) {
          setBlockedUserIds(new Set(blockedUsers.map((item) => item.id)));
          setBlockedMeUserIds(new Set(blockedMeUsers.map((item) => item.id)));
        }
      })
      .catch(() => {
        // ignore
      });

    getMutedUsers()
      .then((users) => {
        if (!cancelled) {
          setMutedUserKeys(
            new Set(users.map((item) => buildMuteKey(item.id, item.university_id)))
          );
        }
      })
      .catch(() => {
        // ignore
      });

    return () => {
      cancelled = true;
    };
  }, [isDataLoading]);

  useEffect(() => {
    if (isDataLoading) {
      return undefined;
    }

    const intervalId = window.setInterval(refreshChatSummaries, 8000);
    return () => window.clearInterval(intervalId);
  }, [isDataLoading, refreshChatSummaries]);

  useEffect(() => {
    if (isDataLoading || !profile) {
      return;
    }

    const needsOnboarding = shouldOfferOnboarding({
      profile,
      joinedChatCount: joinedUniversityIds.size,
      universities,
    });

    if (!needsOnboarding) {
      if (!isOnboardingComplete()) {
        markOnboardingComplete();
      }
      return;
    }

    if (!onboardingOfferedRef.current) {
      onboardingOfferedRef.current = true;
      setOnboardingOpen(true);
    }
  }, [isDataLoading, profile, joinedUniversityIds.size, universities]);

  useDashboardKeyboardShortcuts({
    enabled: !isDataLoading,
    onFocusChatComposer: () => {
      changeSection("chats");
      setComposerFocusToken((value) => value + 1);
    },
  });

  function backToChatList() {
    setMobileChatScreen("list");
    setShowGroupInfoModal(false);
    closeGroupChatSearch();
    closePrivateChatSearch();
  }

  function backToReviewList() {
    setMobileReviewScreen("list");
  }

  const isPrivateChatLayout =
    isDesktop && activeSection === "chats" && chatListTab === "private";

  const isGroupChatLayout =
    isDesktop && activeSection === "chats" && chatPanel === "group";

  const isWideChatLayout = isPrivateChatLayout || isGroupChatLayout;

  const chatColumnEqualHeightClass = isCompactLayout
    ? "h-fit max-h-[calc(100dvh-11rem)] self-start md:max-h-[calc(100vh-10rem)]"
    : "md:flex md:h-[calc(100dvh-11.5rem)] md:max-h-[calc(100dvh-11.5rem)] md:flex-col md:overflow-hidden";

  const chatListScrollClass = isCompactLayout
    ? "chat-messages-scroll mt-4 max-h-[min(28rem,calc(100dvh-17rem))] space-y-1 overflow-y-auto overscroll-contain pr-1"
    : "chat-messages-scroll mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1";

  const chatMessagesAreaClass = isCompactLayout
    ? "chat-messages-scroll h-[calc(100dvh-14rem)] min-h-[200px] overflow-y-auto overflow-x-hidden overscroll-contain"
    : "chat-messages-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain";

  const chatPanelInnerClass = isCompactLayout
    ? "flex flex-col"
    : "flex min-h-0 flex-1 flex-col overflow-hidden";

  const chatSectionGridClass = isCompactLayout
    ? "grid-cols-1"
    : isWideChatLayout
      ? "lg:grid-cols-[minmax(280px,30%)_minmax(0,1fr)] lg:gap-4 xl:gap-5"
      : "lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] xl:grid-cols-[420px_1fr]";

  function handleChatTabChange(tabId) {
    setChatListTab(tabId);
    if (isCompactLayout) {
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
      changeSectionBase("chats");
      syncChatUniversityInUrl(universityId);
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
      const message = getApiErrorMessage(error, "Chatga qo'shilib bo'lmadi. Qayta urinib ko'ring.");
      reportChatError(message);
      throw error;
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
        resetGroupStreamSinceIdRef.current(created.id);
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

  const checkChatUserMuted = useCallback(
    (userId, scope) => isChatUserMuted(mutedUserKeys, userId, scope, selectedUniversityId),
    [mutedUserKeys, selectedUniversityId]
  );

  async function handleMuteChatUser(message, scope) {
    const userId = message.author_id ?? message.sender_id;
    if (!userId) {
      return;
    }

    const universityId = scope === "group" ? selectedUniversityId : null;
    const globallyMuted = mutedUserKeys.has(buildMuteKey(userId, null));
    const universityMuted =
      scope === "group" && selectedUniversityId
        ? mutedUserKeys.has(buildMuteKey(userId, selectedUniversityId))
        : false;
    const isMuted = globallyMuted || universityMuted;

    try {
      if (isMuted) {
        if (scope === "group" && universityMuted) {
          await unmuteUser(userId, selectedUniversityId);
          setMutedUserKeys((current) => {
            const next = new Set(current);
            next.delete(buildMuteKey(userId, selectedUniversityId));
            return next;
          });
        } else if (globallyMuted) {
          await unmuteUser(userId, null);
          setMutedUserKeys((current) => {
            const next = new Set(current);
            next.delete(buildMuteKey(userId, null));
            return next;
          });
        }
        toast.success("Bildirishnomalar yoqildi.");
      } else {
        await muteUser(userId, universityId);
        setMutedUserKeys((current) => new Set(current).add(buildMuteKey(userId, universityId)));
        toast.success("Bildirishnomalar o'chirildi. Xabarlar chatda qoladi.");
      }
      clearChatError();
    } catch (error) {
      reportChatError(
        getApiErrorMessage(error, isMuted ? "Bildirishnomalarni yoqib bo'lmadi." : "Mute amalga oshmadi.")
      );
    }
  }

  async function handleUnblockUser(userId, displayName = "Foydalanuvchi") {
    if (!userId || isBlockActionSubmitting) {
      return;
    }

    setIsBlockActionSubmitting(true);
    try {
      await unblockUser(userId);
      setBlockedUserIds((current) => {
        const next = new Set(current);
        next.delete(userId);
        return next;
      });
      if (profileUser?.id === userId) {
        try {
          const profileData = await getPublicUser(userId);
          setProfileUser(profileData);
        } catch {
          setProfileUser((current) =>
            current
              ? {
                  ...current,
                  blocked_by_me: false,
                  has_block_relationship: false,
                }
              : current
          );
        }
      }
      toast.success(`${displayName} blokdan olindi. Yashirilgan xabarlar qayta ko'rinadi.`);
      clearChatError();
      await refreshChatSummaries();
      setPrivateMessagesReloadNonce((value) => value + 1);
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Blokdan olib bo'lmadi."));
    } finally {
      setIsBlockActionSubmitting(false);
    }
  }

  async function handleBlockUser(userId, displayName = "Foydalanuvchi") {
    if (!userId || isBlockActionSubmitting) {
      return;
    }

    setIsBlockActionSubmitting(true);
    try {
      await blockUser(userId);
      setBlockedUserIds((current) => new Set(current).add(userId));
      if (profileUser?.id === userId) {
        setProfileUser((current) =>
          current
            ? {
                ...current,
                blocked_by_me: true,
                has_block_relationship: true,
              }
            : current
        );
      }
      toast.success(`${displayName} bloklandi.`);
      clearChatError();
      await refreshChatSummaries();
      setPrivateMessagesReloadNonce((value) => value + 1);
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Blok qilib bo'lmadi."));
    } finally {
      setIsBlockActionSubmitting(false);
    }
  }

  async function handleUnblockPrivateChatUser() {
    const otherUserId = selectedThread?.other_user_id;
    if (!otherUserId) {
      return;
    }
    await handleUnblockUser(otherUserId, selectedThread?.other_user_name);
  }

  async function handleBlockProfileUser() {
    if (!profileUser?.id) {
      return;
    }
    await handleBlockUser(profileUser.id, profileUser.display_name);
  }

  async function handleUnblockProfileUser() {
    if (!profileUser?.id) {
      return;
    }
    await handleUnblockUser(profileUser.id, profileUser.display_name);
  }

  function handleSelectGroupTag(tag) {
    setActiveGroupTag(tag || "");
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
      toast.success("Shikoyat yuborildi. Moderatorlar ko'rib chiqadi.");
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
        setDirectMessages((current) => mergeById(current, [created]));
        resetPrivateStreamSinceIdRef.current(created.id);
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
    const hideAvatarDueToBlock = blockedMeUserIds.has(userId);
    const hasBlockRelationship =
      blockedUserIds.has(userId) || blockedMeUserIds.has(userId);
    if (prefetch) {
      setProfileUser({
        id: userId,
        display_name: prefetch.display_name,
        avatar_url: hideAvatarDueToBlock ? null : prefetch.avatar_url,
        role_label: prefetch.role_label,
        university: prefetch.university,
        study_program: prefetch.study_program,
        blocked_by_me: blockedUserIds.has(userId),
        has_block_relationship: hasBlockRelationship,
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
        getApiErrorMessage(error, "Profil ochib bo'lmadi. Chat kontekstida qayta urinib ko'ring.")
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
    setPrivateMessage("");
    setChatListTab("private");
    setChatPanel("private");
    setProfileUser(null);
    setShowGroupInfoModal(false);
    setMobileChatScreen("chat");
    syncPrivateThreadInUrl(thread.id);
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
    changeSection("chats");
    syncChatUniversityInUrl(universityId);
  }

  function selectPrivateThread(threadId) {
    setDraftThread(null);
    setPrivateTypingUsers([]);
    setSelectedThreadId(threadId);
    setChatPanel("private");
    setMobileChatScreen("chat");
    setPrivateMessagesReloadNonce((value) => value + 1);
    syncPrivateThreadInUrl(threadId);
  }

  function openPrivateThreadFromHome(threadId) {
    setChatListTab("private");
    selectPrivateThread(threadId);
  }

  function renderPrivateThreadRow(thread) {
    const isSelected = selectedThreadId === thread.id;
    const previewText = thread.is_draft
      ? "Yangi suhbat — xabar yozing"
      : thread.last_message?.text || "";
    const isTyping = !thread.is_draft && getThreadTypingUsers(thread.id).length > 0;

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
        <UserAvatarWithPresence
          name={thread.other_user_name}
          avatarUrl={thread.other_user_avatar_url}
          size="sm"
          colorKey={thread.other_user_chat_color}
          userId={thread.other_user_id}
          isOnline={thread.other_user_is_online}
          lastSeenAt={thread.other_user_last_seen_at}
          showPresence
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{thread.other_user_name}</p>
          {isTyping ? (
            <p className="mt-0.5 flex items-center truncate text-sm font-medium text-primary">
              Yozmoqda
              <AnimatedTypingDots className="text-primary/85" />
            </p>
          ) : (
            <p className="mt-0.5 truncate text-sm text-slate-500">{previewText}</p>
          )}
        </div>
        <span className="grid h-6 min-w-6 shrink-0 place-items-center">
          {!thread.is_draft && <UnreadBadge count={thread.unread_count ?? 0} />}
        </span>
      </button>
    );
  }

  function selectReviewUniversity(universityId) {
    const nextId = String(universityId);

    if (nextId === reviewUniversity) {
      setMobileReviewScreen("detail");
      if (reviewUniversityDetail) {
        return;
      }
    }

    setReviewUniversity(nextId);
    setRating(0);
    setAspectRatings(buildDefaultAspectRatings());
    setStudyDirectionId("");
    setReviewText("");
    setReviewUniversityDetail(null);
    setReviews([]);
    setMobileReviewScreen("detail");
  }

  function openReviewUniversityFromPopular(universityId) {
    markApplicantChecklistStep("reviews");
    setChecklistVersion((value) => value + 1);
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
    setMobileChatScreen("chat");
    changeSection("chats");
    syncChatUniversityInUrl(id);
  }

  async function handleReviewLike(reviewId) {
    const result = await toggleReviewLike(reviewId);
    const updateItem = (item) =>
      item.id === reviewId
        ? {
            ...item,
            liked_by_me: result.liked,
            like_count: result.like_count,
            helpful_count: result.like_count,
          }
        : item;
    setReviews((current) => current.map(updateItem));
    setPopularReviews((current) => current.map(updateItem));
  }

  async function submitReviewReport(payload) {
    if (!reviewReportTarget) {
      return;
    }
    setIsReviewReportSubmitting(true);
    try {
      await reportReview(reviewReportTarget.id, payload);
      toast.success("Shikoyat qabul qilindi. Moderatorlar ko'rib chiqadi.");
      setReviewReportTarget(null);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Shikoyat yuborilmadi."));
    } finally {
      setIsReviewReportSubmitting(false);
    }
  }

  function requestDeleteGroupMessage(message) {
    setMessageDeleteTarget({ message, scope: "group" });
  }

  function requestDeletePrivateMessage(message) {
    setMessageDeleteTarget({ message, scope: "private" });
  }

  async function confirmMessageDelete() {
    if (!messageDeleteTarget) {
      return;
    }

    const { message, scope } = messageDeleteTarget;
    setIsMessageDeleting(true);
    try {
      if (scope === "group") {
        await deleteUniversityMessage(message.id);
        setGroupMessages((current) => current.filter((item) => item.id !== message.id));
        if (groupPinnedMessage?.id === message.id) {
          setGroupPinnedMessage(null);
        }
      } else {
        await deleteDirectMessage(message.id);
        setDirectMessages((current) => current.filter((item) => item.id !== message.id));
        if (privatePinnedMessage?.id === message.id) {
          setPrivatePinnedMessage(null);
        }
      }
      setMessageDeleteTarget(null);
      clearChatError();
    } catch (error) {
      reportChatError(getApiErrorMessage(error, "Xabarni o'chirib bo'lmadi."));
    } finally {
      setIsMessageDeleting(false);
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

  function requestDeleteReview(reviewId) {
    setReviewDeleteTarget(reviewId);
  }

  async function confirmReviewDelete() {
    if (!reviewDeleteTarget) {
      return;
    }

    setIsReviewDeleting(true);
    try {
      await deleteReview(reviewDeleteTarget);
      setReviews((current) => current.filter((item) => item.id !== reviewDeleteTarget));
      setPopularReviews((current) => current.filter((item) => item.id !== reviewDeleteTarget));
      if (reviewUniversity) {
        const detail = await getUniversityDetail(reviewUniversity);
        setReviewUniversityDetail(detail);
      }
      setReviewDeleteTarget(null);
      toast.success("Sharh o'chirildi.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Sharhni o'chirib bo'lmadi. Qayta urinib ko'ring."));
    } finally {
      setIsReviewDeleting(false);
    }
  }

  async function submitReview(event) {
    event.preventDefault();

    if (
      !isStudent ||
      !reviewUniversity ||
      rating === 0 ||
      !reviewText.trim() ||
      !aspectRatingsComplete(aspectRatings)
    ) {
      return;
    }

    setIsReviewSubmitting(true);
    try {
      const payload = flattenReviewPayload({
        universityId: Number(reviewUniversity),
        rating,
        aspectRatings,
        reviewText,
        studyDirectionId: studyDirectionId ? Number(studyDirectionId) : null,
      });
      const nextReview = await createReview(payload);
      setReviews((current) => [
        { ...nextReview, like_count: 0, helpful_count: 0, liked_by_me: false },
        ...current,
      ]);
      setRating(0);
      setAspectRatings(buildDefaultAspectRatings());
      setStudyDirectionId("");
      setReviewText("");
      const detail = await getUniversityDetail(reviewUniversity);
      setReviewUniversityDetail(detail);
      if (nextReview.status === "pending") {
        toast.warning(
          "Sharh yuborildi. Moderator tasdiqlagach saytda ko'rinadi (email xabari yuboriladi)."
        );
      } else {
        toast.success("Sharhingiz muvaffaqiyatli yuborildi.");
      }
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Sharh yuborilmadi. Qayta urinib ko'ring."));
    } finally {
      setIsReviewSubmitting(false);
    }
  }

  return (
    <main {...mainContentProps} className="min-h-screen bg-[#f5f7fb] text-slate-950 dark:bg-slateNight dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[292px_1fr]">
        <DashboardSidebar
          cabinetEyebrow={cabinetEyebrow}
          visibleMenuItems={visibleMenuItems}
          activeSection={activeSection}
          onChangeSection={changeSection}
          isStudent={isStudent}
        />

        <section className="min-w-0">
          <DashboardHeader
            cabinetEyebrow={cabinetEyebrow}
            activeSectionLabel={visibleMenuItems.find((item) => item.id === activeSection)?.label}
            displayName={displayName}
            subtitle={
              isStudent
                ? "Sharh yozing, chatda qatnashing va OTMlarni solishtiring."
                : "Sharhlarni o'qing, taqqoslang va chatda savol bering."
            }
            isDark={isDark}
            onToggleTheme={() => setIsDark((value) => !value)}
            onLogout={handleLogout}
            notifications={notifications}
          />

          <div
            className={`dashboard-page-shell min-h-[calc(100dvh-9rem)] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-8 ${
              isWideChatLayout ? "p-3 sm:p-4 md:p-5 lg:px-6 lg:py-6" : "p-3 sm:p-5 md:p-6 lg:p-8"
            }`}
          >
            {isDataLoading ? (
              <DashboardSectionSkeleton section={activeSection} />
            ) : (
              <div className="min-h-[calc(100vh-12rem)]" data-dashboard-ready="true">
            {activeSection === "home" && (
              <DashboardHomeSection
                displayName={displayName}
                isStudent={isStudent}
                profile={profile}
                universities={universities}
                joinedUniversityIds={joinedUniversityIds}
                directThreads={directThreads}
                popularReviews={popularReviews}
                totalJoinedUnread={totalJoinedUnread}
                totalPrivateUnread={totalPrivateUnread}
                userUniversity={userUniversity}
                checklistVersion={checklistVersion}
                onOpenSection={changeSection}
                onOpenUniversityChat={openUniversityChat}
                onOpenUniversityReviews={handleOpenUniversityReviews}
                onOpenCompareSuggestion={handleOpenCompareSuggestion}
                onOpenPrivateThread={openPrivateThreadFromHome}
                getUniversityTypingUsers={getUniversityTypingUsers}
              />
            )}

            {activeSection === "chats" && (
              <DashboardChatSection
                composerFocusToken={composerFocusToken}
                isPhone={isCompactLayout}
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
                getUniversityTypingUsers={getUniversityTypingUsers}
                isWideChatLayout={isWideChatLayout}
                isWideChat={isWideChat}
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
                isPrivateChatSearchOpen={isPrivateChatSearchOpen}
                closePrivateChatSearch={closePrivateChatSearch}
                openPrivateChatSearch={openPrivateChatSearch}
                privateChatSearchQuery={privateChatSearchQuery}
                setPrivateChatSearchQuery={setPrivateChatSearchQuery}
                privateChatSearchResults={privateChatSearchResults}
                jumpToPrivateMessage={jumpToPrivateMessage}
                highlightedPrivateMessageId={highlightedPrivateMessageId}
                privateMessageRefs={privateMessageRefs}
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
                handleDeleteGroupMessage={requestDeleteGroupMessage}
                handleDeletePrivateMessage={requestDeletePrivateMessage}
                groupChatTags={groupChatTags}
                activeGroupTag={activeGroupTag}
                onSelectGroupTag={handleSelectGroupTag}
                onClearGroupTag={() => setActiveGroupTag("")}
                onMuteChatUser={handleMuteChatUser}
                isChatUserMuted={checkChatUserMuted}
                onUnblockPrivateChatUser={handleUnblockPrivateChatUser}
                isProfileUserBlockedByMe={isProfileUserBlockedByMe}
                hasProfileBlockRelationship={hasProfileBlockRelationship}
                onBlockProfileUser={handleBlockProfileUser}
                onUnblockProfileUser={handleUnblockProfileUser}
                isBlockActionSubmitting={isBlockActionSubmitting}
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
                isPhone={isReviewCompactLayout}
                isWideReview={isDesktop}
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
                aspectRatings={aspectRatings}
                onAspectChange={(field, value) =>
                  setAspectRatings((current) => ({ ...current, [field]: value }))
                }
                studyDirectionId={studyDirectionId}
                onStudyDirectionChange={setStudyDirectionId}
                reviewText={reviewText}
                onReviewTextChange={setReviewText}
                isReviewSubmitting={isReviewSubmitting}
                onLike={handleReviewLike}
                onDeleteReview={isStudent ? requestDeleteReview : undefined}
                onReportReview={(review) => setReviewReportTarget(review)}
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
              />
            )}

            {activeSection === "compare" && (
              <UniversityCompareSection
                universities={universities}
                userUniversity={userUniversity}
                isStudent={isStudent}
                onViewReviews={selectReviewUniversity}
                prefillIds={comparePrefill}
                onPrefillConsumed={clearComparePrefill}
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

      <DashboardMobileSupport isStudent={isStudent} />

      <MessageReportDialog
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        onSubmit={submitMessageReport}
        isSubmitting={isReportSubmitting}
      />

      <ReviewReportDialog
        open={Boolean(reviewReportTarget)}
        onClose={() => setReviewReportTarget(null)}
        onSubmit={submitReviewReport}
        isSubmitting={isReviewReportSubmitting}
      />

      <ConfirmDialog
        open={Boolean(reviewDeleteTarget)}
        title="Sharhni o'chirish"
        description="Bu sharhni butunlay o'chirmoqchimisiz? Amalni ortga qaytarib bo'lmaydi."
        confirmLabel="Ha"
        cancelLabel="Yo'q"
        onClose={() => {
          if (!isReviewDeleting) {
            setReviewDeleteTarget(null);
          }
        }}
        onConfirm={confirmReviewDelete}
        isSubmitting={isReviewDeleting}
        tone="danger"
      />

      <ConfirmDialog
        open={Boolean(messageDeleteTarget)}
        title="Xabarni o'chirish"
        description="Bu xabarni butunlay o'chirmoqchimisiz? Amalni ortga qaytarib bo'lmaydi."
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
        onClose={() => {
          if (!isMessageDeleting) {
            setMessageDeleteTarget(null);
          }
        }}
        onConfirm={confirmMessageDelete}
        isSubmitting={isMessageDeleting}
        tone="danger"
      />

      <OnboardingWizard
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        profile={profile}
        displayName={displayName}
        universities={universities}
        isStudent={isStudent}
        joinedChatCount={joinedUniversityIds.size}
        onRefreshUser={refreshUser}
        onJoinChat={handleJoin}
        onGoToChats={() => changeSection("chats")}
      />

    </main>
  );
}
