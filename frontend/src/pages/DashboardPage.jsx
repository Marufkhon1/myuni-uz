import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardProvider } from "@/context/DashboardProvider.jsx";
import { DashboardChatProvider } from "@/context/DashboardChatProvider.jsx";
import { dashboardPathForRole } from "@/utils/navigation.js";
import { getDashboardCabinetEyebrow, getDashboardMenuItems } from "@/utils/dashboardRoleContent.js";
import DashboardLayout from "./dashboard/DashboardLayout.jsx";
import DashboardDialogs from "./dashboard/DashboardDialogs.jsx";
import {
  DashboardChatSection,
  DashboardFavoritesSection,
  DashboardHomeSection,
  DashboardReviewsSection,
  PopularReviewsSection,
  ProfileSection,
  UniversityCompareSection,
} from "./dashboard/lazySections.js";
import DashboardSectionSkeleton from "@/components/skeletons/DashboardSkeletons.jsx";
import { useAuth } from "@/hooks/useAuth.js";
import { useBreakpoint } from "@/hooks/useBreakpoint.js";
import { useDarkMode } from "@/hooks/useDarkMode.js";
import { useToast } from "@/hooks/useToast.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import { useDashboardKeyboardShortcuts } from "@/hooks/useDashboardKeyboardShortcuts.js";
import { useNotifications } from "@/hooks/useNotifications.js";
import { useWebPush } from "@/hooks/useWebPush.js";
import { useDashboardNavigation } from "@/hooks/dashboard/useDashboardNavigation.js";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData.js";
import { useReviews } from "@/hooks/dashboard/useReviews.js";
import { useGroupChat } from "@/hooks/dashboard/useGroupChat.js";
import { useDirectChat } from "@/hooks/dashboard/useDirectChat.js";
import { useDashboardDialogs } from "@/hooks/dashboard/useDashboardDialogs.js";
import { useDashboardChatRealtime } from "@/hooks/dashboard/useDashboardChatRealtime.js";
import { useDashboardChatUi } from "@/hooks/dashboard/useDashboardChatUi.js";
import { useDashboardChatSectionValue } from "@/hooks/dashboard/useDashboardChatSectionValue.js";
import { useApplicantChecklistVersion } from "@/hooks/dashboard/useApplicantChecklistVersion.js";
import { useDashboardCompare } from "@/hooks/dashboard/useDashboardCompare.js";
import { useDashboardReviewNav } from "@/hooks/dashboard/useDashboardReviewNav.js";
import { useDashboardChatActions } from "@/hooks/dashboard/useDashboardChatActions.js";
import { useDashboardChatLists } from "@/hooks/dashboard/useDashboardChatLists.js";
import { useDashboardUnreadCounts } from "@/hooks/dashboard/useDashboardUnreadCounts.js";
import { useDashboardChatSummaryPolling } from "@/hooks/dashboard/useDashboardChatSummaryPolling.js";
import { useDashboardOnboarding } from "@/hooks/dashboard/useDashboardOnboarding.js";
import { useDashboardContextValue } from "@/hooks/dashboard/useDashboardContextValue.js";
import {
  useDashboardChatBridgeSync,
  useDashboardChatBridges,
} from "@/hooks/dashboard/useDashboardChatBridges.js";
import { createChatErrorReporter } from "@/utils/chatActionError.js";
import { resolveMediaUrl } from "@/utils/media.js";

export default function DashboardPage({ role }) {
  const navigate = useNavigate();
  const { logout, user, refreshUser } = useAuth();
  const { isDark, setIsDark } = useDarkMode();
  const toast = useToast();
  const { reportChatError, clearChatError } = useMemo(
    () => createChatErrorReporter((message, options) => toast.error(message, options)),
    [toast]
  );
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

  const {
    getThreadTypingUsersRef,
    onGroupMessageCreatedBridge,
    onPrivateMessageCreatedBridge,
    groupMessageCreatedBridgeRef,
    privateMessageCreatedBridgeRef,
  } = useDashboardChatBridges();
  const [chatListTab, setChatListTab] = useState("search");
  const [universitySearch, setUniversitySearch] = useState("");
  const [draftThread, setDraftThread] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const groupMessageRefs = useRef({});
  const privateMessageRefs = useRef({});
  const prepareGroupChatSwitchRef = useRef(() => false);
  const selectUniversityChatRef = useRef(() => {});
  const [chatPanel, setChatPanel] = useState("group");
  const [reactingMessageId, setReactingMessageId] = useState(null);
  const [mobileChatScreen, setMobileChatScreen] = useState("list");
  const [composerFocusToken, setComposerFocusToken] = useState(0);
  const [activeGroupTag, setActiveGroupTag] = useState("");
  const [privateMessagesReloadNonce, setPrivateMessagesReloadNonce] = useState(0);
  const { isPhone, isTablet, isDesktop, isWideChat } = useBreakpoint();
  const isCompactLayout = isPhone || isTablet;
  const isReviewCompactLayout = isCompactLayout;
  const { checklistVersion, bumpChecklistVersion, wrapChangeSection } = useApplicantChecklistVersion();

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

  useEffect(() => {
  refreshChatSummariesRef.current = refreshChatSummaries;
  }, [refreshChatSummaries]);

  const reviewNavBridgeRef = useRef({
    setReviewUniversity: () => {},
    setMobileReviewScreen: () => {},
  });

  const {
    activeSection,
    changeSection: changeSectionBase,
    openUniversityChat,
    openUniversityReviews,
    syncChatUniversityInUrl,
    syncPrivateThreadInUrl,
    syncChatListTabInUrl,
    syncReviewUniversityInUrl,
  } = useDashboardNavigation({
    role,
    universities,
    setReviewUniversity: (value) => reviewNavBridgeRef.current.setReviewUniversity(value),
    setMobileReviewScreen: (value) => reviewNavBridgeRef.current.setMobileReviewScreen(value),
    setSelectedUniversityId,
    setSelectedThreadId,
    setChatPanel,
    setMobileChatScreen,
    setChatListTab,
    selectUniversityGroupChat: (universityId) => selectUniversityChatRef.current(universityId),
  });

  const changeSection = useMemo(
    () => wrapChangeSection(changeSectionBase),
    [wrapChangeSection, changeSectionBase]
  );

  const onReviewLikeUpdate = useCallback(
    (updateItem) => {
      setPopularReviews((current) => current.map(updateItem));
    },
    [setPopularReviews]
  );

  const onReviewSubmitted = useCallback(
    (nextReview) => {
      if (nextReview.status === "pending") {
        toast.warning(
          "Sharh yuborildi. Moderator tasdiqlagach saytda ko'rinadi (email xabari yuboriladi)."
        );
      } else {
        toast.success("Sharhingiz muvaffaqiyatli yuborildi.");
      }
    },
    [toast]
  );

  const {
    reviewUniversity,
    setReviewUniversity,
    reviewUniversityDetail,
    reviewUniversitySearch,
    setReviewUniversitySearch,
    isReviewDetailLoading,
    rating,
    setRating,
    aspectRatings,
    handleAspectChange,
    studyDirectionId,
    setStudyDirectionId,
    reviewText,
    setReviewText,
    reviews,
    isReviewSubmitting,
    mobileReviewScreen,
    setMobileReviewScreen,
    filteredReviewUniversities,
    selectReviewUniversity,
    backToReviewList,
    handleReviewLike,
    handleDeleteReview,
    submitReview,
  } = useReviews({
    isStudent,
    activeSection,
    universities,
    onReviewLikeUpdate,
    onReviewSubmitted,
  });

  const handleSelectReviewUniversity = useCallback(
    (universityId) => {
      selectReviewUniversity(universityId);
      syncReviewUniversityInUrl(universityId, { replace: true });
    },
    [selectReviewUniversity, syncReviewUniversityInUrl]
  );

  useLayoutEffect(() => {
    reviewNavBridgeRef.current = {
      setReviewUniversity,
      setMobileReviewScreen,
    };
  }, [setReviewUniversity, setMobileReviewScreen]);

  const {
    comparePrefill,
    handleOpenFavoriteCompare,
    handleOpenCompareSuggestion,
    clearComparePrefill,
  } = useDashboardCompare({
    changeSection,
    bumpChecklistVersion,
  });

  const { openReviewUniversityFromPopular, openChatFromReviewUniversity } = useDashboardReviewNav({
    changeSection,
    bumpChecklistVersion,
    selectReviewUniversity: handleSelectReviewUniversity,
    reviewUniversity,
    setSelectedUniversityId,
    setChatPanel,
    setMobileChatScreen,
    syncChatUniversityInUrl,
    prepareGroupChatSwitch: (universityId) =>
      prepareGroupChatSwitchRef.current(universityId),
  });

  const {
    groupMessage,
    setGroupMessage,
    groupMessages,
    setGroupMessages,
    groupPinnedMessage,
    setGroupPinnedMessage,
    isGroupSending,
    isGroupJoining,
    setIsGroupJoining,
    editingChatMessage: groupEditingChatMessage,
    openEditGroupMessage,
    cancelEditGroupMessage,
    sendGroupChatMessage: sendGroupChatMessageBase,
    deleteGroupMessageById,
    handleGroupReaction: handleGroupReactionBase,
    handlePinGroupMessage: handlePinGroupMessageBase,
    handleUnpinGroupMessage: handleUnpinGroupMessageBase,
  } = useGroupChat({
    reportChatError,
    clearChatError,
    onMessageCreated: onGroupMessageCreatedBridge,
  });

  const {
    privateMessage,
    setPrivateMessage,
    directMessages,
    setDirectMessages,
    privatePinnedMessage,
    setPrivatePinnedMessage,
    isPrivateSending,
    editingChatMessage: privateEditingChatMessage,
    openEditPrivateMessage,
    cancelEditPrivateMessage,
    sendPrivateChatMessage: sendPrivateChatMessageBase,
    deletePrivateMessageById,
    handlePrivateReaction: handlePrivateReactionBase,
    handlePinPrivateMessage: handlePinPrivateMessageBase,
    handleUnpinPrivateMessage: handleUnpinPrivateMessageBase,
  } = useDirectChat({
    reportChatError,
    clearChatError,
    onMessageCreated: onPrivateMessageCreatedBridge,
  });

  const {
    setOnboardingOpen,
    openMessageReport,
    requestDeleteGroupMessage,
    requestDeletePrivateMessage,
    requestDeleteReview,
    openReviewReport,
    dialogProps,
  } = useDashboardDialogs({
    toast,
    reportChatError,
    clearChatError,
    deleteGroupMessageById,
    deletePrivateMessageById,
    handleDeleteReview,
    setPopularReviews,
  });

  const { totalPrivateUnread, totalJoinedUnread } = useDashboardUnreadCounts({
    directThreads,
    universities,
    joinedUniversityIds,
  });

  const notifications = useNotifications({
    enabled: !isDataLoading,
    chatUnreadTotal: totalPrivateUnread + totalJoinedUnread,
    dashboardPath,
  });

  useWebPush({ enabled: !isDataLoading && joinedUniversityIds.size > 0 });

  const userUniversity = profile?.university || universities[0]?.name || "";
  const savedAvatarUrl = resolveMediaUrl(profile?.avatar_url || "");

  const {
    selectedUniversity,
    hasJoinedSelectedChat,
    selectedThread,
    privateThreadList,
    filteredUniversities,
  } = useDashboardChatLists({
    universities,
    joinedUniversityIds,
    selectedUniversityId,
    directThreads,
    selectedThreadId,
    draftThread,
    chatListTab,
    universitySearch,
  });

  const {
    editingChatMessage,
    openEditChatMessage,
    cancelEditChatMessage,
    sendGroupChatMessage,
    sendPrivateChatMessage,
    handleGroupReaction,
    handlePrivateReaction,
    handlePinGroupMessage,
    handleUnpinGroupMessage,
    handlePinPrivateMessage,
    handleUnpinPrivateMessage,
  } = useDashboardChatActions({
    clearChatError,
    groupEditingChatMessage,
    privateEditingChatMessage,
    openEditGroupMessage,
    openEditPrivateMessage,
    cancelEditGroupMessage,
    cancelEditPrivateMessage,
    sendGroupChatMessageBase,
    sendPrivateChatMessageBase,
    handleGroupReactionBase,
    handlePrivateReactionBase,
    handlePinGroupMessageBase,
    handleUnpinGroupMessageBase,
    handlePinPrivateMessageBase,
    handleUnpinPrivateMessageBase,
    setReactingMessageId,
    hasJoinedSelectedChat,
    selectedUniversityId,
    selectedThreadId,
    setDirectThreads,
    setDraftThread,
  });

  const chatUi = useDashboardChatUi({
    toast,
    reportChatError,
    clearChatError,
    isDataLoading,
    refreshChatSummaries,
    joinedUniversityIds,
    setJoinedUniversityIds,
    directThreads,
    setDirectThreads,
    selectedUniversityId,
    selectedUniversity,
    selectedThread,
    selectedThreadId,
    hasJoinedSelectedChat,
    chatPanel,
    draftThread,
    setDraftThread,
    setSelectedUniversityId,
    setSelectedThreadId,
    setChatPanel,
    setChatListTab,
    setMobileChatScreen,
    setGroupMessages,
    setPrivateMessage,
    setIsGroupJoining,
    setPrivateMessagesReloadNonce,
    setActiveGroupTag,
    activeSection,
    universities,
    prepareGroupChatSwitch: (universityId) =>
      prepareGroupChatSwitchRef.current(universityId),
    changeSection,
    changeSectionBase,
    syncChatUniversityInUrl,
    syncPrivateThreadInUrl,
    syncChatListTabInUrl,
    isCompactLayout,
    groupMessages,
    directMessages,
    groupMessageRefs,
    privateMessageRefs,
    getThreadTypingUsers: (threadId) => getThreadTypingUsersRef.current(threadId),
  });

  const {
    groupChatTags,
    groupTypingUsers,
    privateTypingUsers,
    getUniversityTypingUsers,
    getThreadTypingUsers,
    notifyGroupTyping,
    notifyPrivateTyping,
    onGroupMessageCreated,
    onPrivateMessageCreated,
    isGroupMessagesLoading,
    isPrivateMessagesLoading,
    prefetchGroupMessages,
    prepareGroupChatSwitch,
  } = useDashboardChatRealtime({
    activeSection,
    chatPanel,
    selectedUniversityId,
    selectedThreadId,
    joinedUniversityIds,
    hasJoinedSelectedChat,
    activeGroupTag,
    isDataLoading,
    directThreads,
    directMessages,
    groupMessages,
    groupPinnedMessage,
    privatePinnedMessage,
    setGroupMessages,
    setGroupPinnedMessage,
    setDirectMessages,
    setPrivatePinnedMessage,
    reportChatError,
    clearChatError,
    cancelEditChatMessage,
    closeGroupChatSearch: chatUi.closeGroupChatSearch,
    closePrivateChatSearch: chatUi.closePrivateChatSearch,
    setHighlightedGroupMessageId: chatUi.setHighlightedGroupMessageId,
    setHighlightedPrivateMessageId: chatUi.setHighlightedPrivateMessageId,
    groupMessageRefs,
    privateMessageRefs,
    refreshChatSummariesRef,
    privateMessagesReloadNonce,
  });

  useDashboardChatBridgeSync({
    groupMessageCreatedBridgeRef,
    privateMessageCreatedBridgeRef,
    getThreadTypingUsersRef,
    getThreadTypingUsers,
    onGroupMessageCreated,
    onPrivateMessageCreated,
  });

  useEffect(() => {
    prepareGroupChatSwitchRef.current = prepareGroupChatSwitch;
  }, [prepareGroupChatSwitch]);

  useEffect(() => {
    selectUniversityChatRef.current = chatUi.selectUniversityChat;
  }, [chatUi.selectUniversityChat]);

  useDashboardChatSummaryPolling({ isDataLoading, refreshChatSummaries });

  useDashboardOnboarding({
    isDataLoading,
      profile,
    joinedUniversityIds,
      universities,
    setOnboardingOpen,
  });

  useDashboardKeyboardShortcuts({
    enabled: !isDataLoading,
    onFocusChatComposer: () => {
      changeSection("chats");
      setComposerFocusToken((value) => value + 1);
    },
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
    await logout();
    } finally {
    navigate("/", { replace: true });
  }
  }, [isLoggingOut, logout, navigate]);

  const dashboardChatSectionValue = useDashboardChatSectionValue({
    chatUi,
    activeSection,
    isDesktop,
    isCompactLayout,
    isWideChat,
    chatListTab,
    chatPanel,
    selectedThreadId,
    composerFocusToken,
    mobileChatScreen,
    totalJoinedUnread,
    totalPrivateUnread,
    universitySearch,
    setUniversitySearch,
    privateThreadList,
    filteredUniversities,
    selectedUniversityId,
    joinedUniversityIds,
    getUniversityTypingUsers,
    selectedThread,
    selectedUniversity,
    hasJoinedSelectedChat,
    privatePinnedMessage,
    handleUnpinPrivateMessage,
    directMessages,
    handlePrivateReaction,
    handlePinPrivateMessage,
    handleUnpinGroupMessage,
    reactingMessageId,
    privateTypingUsers,
    privateMessage,
    setPrivateMessage,
    notifyPrivateTyping,
    sendPrivateChatMessage,
    isPrivateSending,
    privateMessageRefs,
    groupPinnedMessage,
    groupMessages,
    groupMessageRefs,
    handleGroupReaction,
    handlePinGroupMessage,
    user,
    groupTypingUsers,
    groupMessage,
    setGroupMessage,
    notifyGroupTyping,
    sendGroupChatMessage,
    isGroupSending,
    isGroupJoining,
    editingChatMessage,
    openEditChatMessage,
    cancelEditChatMessage,
    requestDeleteGroupMessage,
    requestDeletePrivateMessage,
    groupChatTags,
    activeGroupTag,
    setActiveGroupTag,
    isGroupMessagesLoading,
    isPrivateMessagesLoading,
    prefetchGroupMessages,
  });

  const dashboardContextValue = useDashboardContextValue({
    role,
    isStudent,
    activeSection,
    changeSection,
    openUniversityChat,
    openUniversityReviews,
    openReviewUniversityFromPopular,
    selectReviewUniversity: handleSelectReviewUniversity,
    openMessageReport,
    requestDeleteReview,
    openReviewReport,
    requestDeleteGroupMessage,
    requestDeletePrivateMessage,
  });

    return (
    <DashboardProvider value={dashboardContextValue}>
    <>
    <DashboardLayout
      role={role}
          cabinetEyebrow={cabinetEyebrow}
          visibleMenuItems={visibleMenuItems}
          activeSection={activeSection}
          onChangeSection={changeSection}
          isStudent={isStudent}
            displayName={displayName}
            isDark={isDark}
            onToggleTheme={() => setIsDark((value) => !value)}
            onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
            notifications={notifications}
      isDataLoading={isDataLoading}
      isWideChatLayout={dashboardChatSectionValue.isWideChatLayout}
    >
            {activeSection === "home" && (
              <Suspense fallback={<DashboardSectionSkeleton section="home" />}>
              <DashboardHomeSection
                displayName={displayName}
                profile={profile}
                universities={universities}
                joinedUniversityIds={joinedUniversityIds}
                directThreads={directThreads}
                popularReviews={popularReviews}
                totalJoinedUnread={totalJoinedUnread}
                totalPrivateUnread={totalPrivateUnread}
                userUniversity={userUniversity}
                checklistVersion={checklistVersion}
                onOpenCompareSuggestion={handleOpenCompareSuggestion}
                onOpenPrivateThread={chatUi.openPrivateThreadFromHome}
                getUniversityTypingUsers={getUniversityTypingUsers}
              />
              </Suspense>
            )}

            {activeSection === "chats" && (
              <Suspense fallback={<DashboardSectionSkeleton section="chats" />}>
              <DashboardChatProvider value={dashboardChatSectionValue}>
                <DashboardChatSection />
              </DashboardChatProvider>
              </Suspense>
            )}

            {activeSection === "popular" && (
              <Suspense fallback={<DashboardSectionSkeleton section="popular" />}>
              <PopularReviewsSection
                popularReviews={popularReviews}
                onLike={handleReviewLike}
              />
              </Suspense>
            )}

            {activeSection === "reviews" && (
              <Suspense fallback={<DashboardSectionSkeleton section="reviews" />}>
              <DashboardReviewsSection
                isPhone={isReviewCompactLayout}
                isWideReview={isDesktop}
                reviewUniversity={reviewUniversity}
                reviewUniversitySearch={reviewUniversitySearch}
                onReviewUniversitySearchChange={setReviewUniversitySearch}
                filteredReviewUniversities={filteredReviewUniversities}
                onSelectReviewUniversity={handleSelectReviewUniversity}
                mobileReviewScreen={mobileReviewScreen}
                reviewUniversityDetail={reviewUniversityDetail}
                isReviewDetailLoading={isReviewDetailLoading}
                reviews={reviews}
                onBackToReviewList={backToReviewList}
                onSubmitReview={submitReview}
                rating={rating}
                onRatingChange={setRating}
                aspectRatings={aspectRatings}
                onAspectChange={handleAspectChange}
                studyDirectionId={studyDirectionId}
                onStudyDirectionChange={setStudyDirectionId}
                reviewText={reviewText}
                onReviewTextChange={setReviewText}
                isReviewSubmitting={isReviewSubmitting}
                onLike={handleReviewLike}
                onOpenChat={openChatFromReviewUniversity}
              />
              </Suspense>
            )}

            {activeSection === "profile" && (
              <Suspense fallback={<DashboardSectionSkeleton section="profile" />}>
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
              </Suspense>
            )}

            {activeSection === "compare" && (
              <Suspense fallback={<DashboardSectionSkeleton section="compare" />}>
              <UniversityCompareSection
                universities={universities}
                userUniversity={userUniversity}
                isStudent={isStudent}
                onViewReviews={handleSelectReviewUniversity}
                prefillIds={comparePrefill}
                onPrefillConsumed={clearComparePrefill}
              />
              </Suspense>
            )}

            {activeSection === "favorites" && (
              <Suspense fallback={<DashboardSectionSkeleton section="favorites" />}>
              <DashboardFavoritesSection onOpenCompare={handleOpenFavoriteCompare} />
              </Suspense>
            )}
    </DashboardLayout>

      <DashboardDialogs
        {...dialogProps}
        profile={profile}
        displayName={displayName}
        universities={universities}
        isStudent={isStudent}
        joinedChatCount={joinedUniversityIds.size}
        onRefreshUser={refreshUser}
        onJoinChat={chatUi.handleJoin}
        onGoToChats={() => changeSection("chats")}
      />

    </>
    </DashboardProvider>
  );
}
