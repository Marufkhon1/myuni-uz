import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getUniversityMembers,
  joinUniversity,
  leaveUniversityChat,
  markUniversityChatRead,
  startDirectThread,
} from "@/services/chatService.js";
import {
  blockUser,
  getBlockedUsers,
  getMutedUsers,
  muteUser,
  unmuteUser,
  unblockUser,
} from "@/services/communityService.js";
import { getPublicUser } from "@/services/userService.js";
import { getUniversityDetail } from "@/services/universityService.js";
import { getApiErrorMessage } from "@/utils/apiErrors.js";
import { formatChatMessageTime } from "@/utils/chatFormat.js";
import { buildMuteKey, isChatUserMuted } from "@/utils/chatMute.js";
import { scrollElementIntoView } from "@/utils/scrollIntoView.js";
import { sameUniversityId, findUniversityById } from "@/utils/universityIds.js";
import {
  buildOptimisticChatMembers,
  resolveActiveChatMembers,
} from "@/utils/chatMembers.js";

export function useDashboardChatUi({
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
  prepareGroupChatSwitch,
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
  getThreadTypingUsers,
}) {
  const [chatMembers, setChatMembers] = useState({
    universityId: null,
    members: [],
    member_count: 0,
  });
  const [profileUser, setProfileUser] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [isGroupChatSearchOpen, setIsGroupChatSearchOpen] = useState(false);
  const [groupChatSearchQuery, setGroupChatSearchQuery] = useState("");
  const [isPrivateChatSearchOpen, setIsPrivateChatSearchOpen] = useState(false);
  const [privateChatSearchQuery, setPrivateChatSearchQuery] = useState("");
  const [highlightedGroupMessageId, setHighlightedGroupMessageId] = useState(null);
  const [highlightedPrivateMessageId, setHighlightedPrivateMessageId] = useState(null);
  const [groupInfoDetail, setGroupInfoDetail] = useState(null);
  const [isGroupInfoDetailLoading, setIsGroupInfoDetailLoading] = useState(false);
  const [blockedUserIds, setBlockedUserIds] = useState(new Set());
  const [blockedMeUserIds, setBlockedMeUserIds] = useState(new Set());
  const [mutedUserKeys, setMutedUserKeys] = useState(new Set());
  const [isBlockActionSubmitting, setIsBlockActionSubmitting] = useState(false);

  const groupInfoUniversity = useMemo(() => {
    if (!selectedUniversity) {
      return null;
    }
    if (sameUniversityId(groupInfoDetail?.id, selectedUniversity.id)) {
      return { ...selectedUniversity, ...groupInfoDetail };
    }
    return selectedUniversity;
  }, [selectedUniversity, groupInfoDetail]);

  const displayedGroupUniversity = useMemo(() => {
    if (selectedUniversityId == null || chatPanel !== "group") {
      return null;
    }
    const fromList = findUniversityById(universities, selectedUniversityId);
    if (fromList) {
      return fromList;
    }
    if (selectedUniversity && sameUniversityId(selectedUniversity.id, selectedUniversityId)) {
      return selectedUniversity;
    }
    return null;
  }, [selectedUniversityId, universities, selectedUniversity, chatPanel]);

  const isGroupChatHeaderLoading = Boolean(
    selectedUniversityId && chatPanel === "group" && !displayedGroupUniversity
  );

  const activeChatMembers = useMemo(
    () =>
      resolveActiveChatMembers({
        selectedUniversityId,
        chatPanel,
        chatMembers,
        displayedGroupUniversity,
      }),
    [selectedUniversityId, chatPanel, chatMembers, displayedGroupUniversity]
  );

  const groupChatSearchTrimmed = groupChatSearchQuery.trim().toLowerCase();
  const groupChatSearchResults = useMemo(() => {
    if (!isGroupChatSearchOpen || !groupChatSearchTrimmed) {
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

  const hidePrivateMessageButton = useMemo(() => {
    if (!profileUser?.id) {
      return false;
    }
    const thread = directThreads.find((item) => item.other_user_id === profileUser.id);
    return Boolean(thread?.both_replied);
  }, [profileUser, directThreads]);

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
  }, [profileUser, directThreads, blockedUserIds]);

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
  }, [profileUser, directThreads, blockedUserIds, blockedMeUserIds]);

  const checkChatUserMuted = useCallback(
    (userId, scope) => isChatUserMuted(mutedUserKeys, userId, scope, selectedUniversityId),
    [mutedUserKeys, selectedUniversityId]
  );

  const closeGroupChatSearch = useCallback(() => {
    setIsGroupChatSearchOpen(false);
    setGroupChatSearchQuery("");
  }, []);

  const closePrivateChatSearch = useCallback(() => {
    setIsPrivateChatSearchOpen(false);
    setPrivateChatSearchQuery("");
  }, []);

  const openGroupChatSearch = useCallback(() => {
    closePrivateChatSearch();
    setIsGroupChatSearchOpen(true);
    setGroupChatSearchQuery("");
  }, [closePrivateChatSearch]);

  const openPrivateChatSearch = useCallback(() => {
    closeGroupChatSearch();
    setIsPrivateChatSearchOpen(true);
    setPrivateChatSearchQuery("");
  }, [closeGroupChatSearch]);

  const jumpToGroupMessage = useCallback(
    (messageId) => {
      closeGroupChatSearch();
      setHighlightedGroupMessageId(messageId);
      window.requestAnimationFrame(() => {
        scrollElementIntoView(groupMessageRefs.current[messageId], { block: "center" });
      });
      window.setTimeout(() => setHighlightedGroupMessageId(null), 2600);
    },
    [closeGroupChatSearch, groupMessageRefs]
  );

  const jumpToPrivateMessage = useCallback(
    (messageId) => {
      closePrivateChatSearch();
      setHighlightedPrivateMessageId(messageId);
      window.requestAnimationFrame(() => {
        scrollElementIntoView(privateMessageRefs.current[messageId], { block: "center" });
      });
      window.setTimeout(() => setHighlightedPrivateMessageId(null), 2600);
    },
    [closePrivateChatSearch, privateMessageRefs]
  );

  const backToChatList = useCallback(() => {
    setMobileChatScreen("list");
    setShowGroupInfoModal(false);
    closeGroupChatSearch();
    closePrivateChatSearch();
  }, [setMobileChatScreen, closeGroupChatSearch, closePrivateChatSearch]);

  const handleChatTabChange = useCallback(
    (tabId) => {
      if (tabId === "private") {
        setChatListTab("private");
        setChatPanel("private");
        if (isCompactLayout) {
          setMobileChatScreen("list");
        }
        syncChatListTabInUrl("private", {
          threadId: selectedThreadId,
          replace: true,
        });
        return;
      }

      setChatListTab(tabId);
      setChatPanel("group");
      if (isCompactLayout) {
        setMobileChatScreen("list");
      }

      if (draftThread) {
        const draftId = draftThread.id;
        setDraftThread(null);
        if (selectedThreadId === draftId) {
          setSelectedThreadId(null);
        }
      }

      const joinedUniversityId =
        tabId === "joined" &&
        selectedUniversityId &&
        joinedUniversityIds.has(selectedUniversityId)
          ? selectedUniversityId
          : null;

      syncChatListTabInUrl(tabId, {
        universityId: joinedUniversityId,
        replace: true,
      });
    },
    [
      isCompactLayout,
      draftThread,
      selectedThreadId,
      selectedUniversityId,
      joinedUniversityIds,
      setChatListTab,
      setChatPanel,
      setDraftThread,
      setMobileChatScreen,
      setSelectedThreadId,
      syncChatListTabInUrl,
    ]
  );

  const handleJoin = useCallback(
    async (universityId) => {
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
            universityId,
            members: data.members ?? [],
            member_count: data.member_count ?? 0,
          });
        } catch {
          setChatMembers({ universityId, members: [], member_count: 0 });
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
    },
    [
      setIsGroupJoining,
      clearChatError,
      setJoinedUniversityIds,
      setSelectedUniversityId,
      setChatPanel,
      setChatListTab,
      setMobileChatScreen,
      changeSectionBase,
      syncChatUniversityInUrl,
      refreshChatSummaries,
      reportChatError,
    ]
  );

  const handleLeaveChat = useCallback(async () => {
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
  }, [
    selectedUniversityId,
    hasJoinedSelectedChat,
    clearChatError,
    setJoinedUniversityIds,
    setGroupMessages,
    setChatListTab,
    setMobileChatScreen,
    reportChatError,
  ]);

  const openGroupInfoModal = useCallback(async () => {
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
  }, [selectedUniversityId, selectedUniversity]);

  const handleUnblockUser = useCallback(
    async (userId, displayName = "Foydalanuvchi") => {
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
    },
    [
      isBlockActionSubmitting,
      profileUser,
      toast,
      clearChatError,
      refreshChatSummaries,
      setPrivateMessagesReloadNonce,
      reportChatError,
    ]
  );

  const handleBlockUser = useCallback(
    async (userId, displayName = "Foydalanuvchi") => {
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
    },
    [
      isBlockActionSubmitting,
      profileUser,
      toast,
      clearChatError,
      refreshChatSummaries,
      setPrivateMessagesReloadNonce,
      reportChatError,
    ]
  );

  const handleMuteChatUser = useCallback(
    async (message, scope) => {
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
    },
    [selectedUniversityId, mutedUserKeys, toast, clearChatError, reportChatError]
  );

  const handleUnblockPrivateChatUser = useCallback(async () => {
    const otherUserId = selectedThread?.other_user_id;
    if (!otherUserId) {
      return;
    }
    await handleUnblockUser(otherUserId, selectedThread?.other_user_name);
  }, [selectedThread, handleUnblockUser]);

  const handleBlockProfileUser = useCallback(async () => {
    if (!profileUser?.id) {
      return;
    }
    await handleBlockUser(profileUser.id, profileUser.display_name);
  }, [profileUser, handleBlockUser]);

  const handleUnblockProfileUser = useCallback(async () => {
    if (!profileUser?.id) {
      return;
    }
    await handleUnblockUser(profileUser.id, profileUser.display_name);
  }, [profileUser, handleUnblockUser]);

  const handleSelectGroupTag = useCallback(
    (tag) => {
      setActiveGroupTag(tag || "");
    },
    [setActiveGroupTag]
  );

  const openUserProfile = useCallback(
    async (userId, prefetch = null, options = {}) => {
      const { universityId = null } = options;
      const hideAvatarDueToBlock = blockedMeUserIds.has(userId);
      const hasBlockRelationship = blockedUserIds.has(userId) || blockedMeUserIds.has(userId);
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
    },
    [blockedMeUserIds, blockedUserIds, clearChatError, reportChatError]
  );

  const openGroupChatAuthorProfile = useCallback(
    (userId, prefetch) => {
      if (!selectedUniversityId) {
        return;
      }
      openUserProfile(userId, prefetch, { universityId: selectedUniversityId });
    },
    [selectedUniversityId, openUserProfile]
  );

  const openPrivateChatWithUser = useCallback(
    async (userId) => {
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
      setDirectThreads((current) => {
        if (current.some((item) => item.id === thread.id)) {
          return current;
        }
        return [thread, ...current];
      });
    },
    [
      setDraftThread,
      setSelectedThreadId,
      setPrivateMessage,
      setChatListTab,
      setChatPanel,
      setMobileChatScreen,
      syncPrivateThreadInUrl,
      setDirectThreads,
    ]
  );

  const selectUniversityChat = useCallback(
    (universityId) => {
      if (sameUniversityId(selectedUniversityId, universityId)) {
        setMobileChatScreen("chat");
        return;
      }

      setSelectedUniversityId(universityId);
      setChatPanel("group");
      setShowGroupInfoModal(false);
      setMobileChatScreen("chat");
      setActiveGroupTag("");
      setGroupInfoDetail(null);
      closeGroupChatSearch();
      setChatMembers(buildOptimisticChatMembers(universityId, universities, findUniversityById));

      prepareGroupChatSwitch?.(universityId);

      if (activeSection !== "chats") {
        changeSection("chats");
      }
      syncChatUniversityInUrl(universityId, { replace: true });
    },
    [
      selectedUniversityId,
      universities,
      setSelectedUniversityId,
      setChatPanel,
      setMobileChatScreen,
      setActiveGroupTag,
      activeSection,
      changeSection,
      syncChatUniversityInUrl,
      prepareGroupChatSwitch,
      closeGroupChatSearch,
    ]
  );

  const selectPrivateThread = useCallback(
    (threadId) => {
      setDraftThread(null);
      setSelectedThreadId(threadId);
      setChatListTab("private");
      setChatPanel("private");
      setMobileChatScreen("chat");
      setPrivateMessagesReloadNonce((value) => value + 1);
      syncPrivateThreadInUrl(threadId, { replace: true });
    },
    [
      setDraftThread,
      setSelectedThreadId,
      setChatListTab,
      setChatPanel,
      setMobileChatScreen,
      setPrivateMessagesReloadNonce,
      syncPrivateThreadInUrl,
    ]
  );

  const openPrivateThreadFromHome = useCallback(
    (threadId) => {
      setChatListTab("private");
      changeSection("chats");
      selectPrivateThread(threadId);
    },
    [setChatListTab, changeSection, selectPrivateThread]
  );

  const isPrivateThreadTyping = useCallback(
    (threadId) => !threadId ? false : getThreadTypingUsers(threadId).length > 0,
    [getThreadTypingUsers]
  );

  useEffect(() => {
    if (!selectedUniversityId || chatPanel !== "group") {
      return undefined;
    }

    let isMounted = true;
    const universityId = selectedUniversityId;

    async function loadMembers() {
      try {
        const data = await getUniversityMembers(universityId);
        if (isMounted) {
          setChatMembers({
            universityId,
            members: data.members ?? [],
            member_count: data.member_count ?? 0,
          });
        }
      } catch {
        if (isMounted) {
          setChatMembers(buildOptimisticChatMembers(universityId, universities, findUniversityById));
        }
      }
    }

    loadMembers();
    return () => {
      isMounted = false;
    };
  }, [selectedUniversityId, chatPanel, joinedUniversityIds, universities]);

  useEffect(() => {
    if (!selectedUniversityId || chatPanel !== "group") {
      return;
    }

    setChatMembers((current) => {
      if (sameUniversityId(current.universityId, selectedUniversityId)) {
        return current;
      }
      return buildOptimisticChatMembers(selectedUniversityId, universities, findUniversityById);
    });
  }, [selectedUniversityId, chatPanel, universities]);

  useEffect(() => {
    setGroupInfoDetail(null);
  }, [selectedUniversityId]);

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

  return {
    profileUser,
    setProfileUser,
    isProfileLoading,
    showGroupInfoModal,
    setShowGroupInfoModal,
    isGroupChatSearchOpen,
    groupChatSearchQuery,
    setGroupChatSearchQuery,
    isPrivateChatSearchOpen,
    privateChatSearchQuery,
    setPrivateChatSearchQuery,
    highlightedGroupMessageId,
    setHighlightedGroupMessageId,
    highlightedPrivateMessageId,
    setHighlightedPrivateMessageId,
    groupInfoUniversity,
    displayedGroupUniversity,
    isGroupChatHeaderLoading,
    isGroupInfoDetailLoading,
    isBlockActionSubmitting,
    activeChatMembers,
    groupChatSearchResults,
    privateChatSearchResults,
    hidePrivateMessageButton,
    isProfileUserBlockedByMe,
    hasProfileBlockRelationship,
    checkChatUserMuted,
    closeGroupChatSearch,
    closePrivateChatSearch,
    openGroupChatSearch,
    openPrivateChatSearch,
    jumpToGroupMessage,
    jumpToPrivateMessage,
    backToChatList,
    handleChatTabChange,
    handleJoin,
    handleLeaveChat,
    openGroupInfoModal,
    handleMuteChatUser,
    handleUnblockPrivateChatUser,
    handleBlockProfileUser,
    handleUnblockProfileUser,
    handleSelectGroupTag,
    openUserProfile,
    openGroupChatAuthorProfile,
    openPrivateChatWithUser,
    selectUniversityChat,
    selectPrivateThread,
    openPrivateThreadFromHome,
    isPrivateThreadTyping,
    formatTime: formatChatMessageTime,
  };
}
