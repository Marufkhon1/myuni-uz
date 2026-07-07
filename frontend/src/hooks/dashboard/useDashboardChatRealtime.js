import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDirectThreadsTyping } from "@/hooks/useDirectThreadsTyping.js";
import { useJoinedChatsTyping } from "@/hooks/useJoinedChatsTyping.js";
import { mergeById, maxMessageId } from "@/hooks/useMessageStream.js";
import { useChatRealtimeStream } from "@/hooks/useChatRealtimeStream.js";
import {
  getDirectMessages,
  getUniversityMessages,
  markDirectThreadRead,
  markUniversityChatRead,
  sendDirectTyping,
  sendUniversityTyping,
} from "@/services/chatService.js";
import { getUniversityChatTags } from "@/services/communityService.js";
import { getApiErrorMessage } from "@/utils/apiErrors.js";
import { createActiveTypingNotifier } from "@/utils/throttledTyping.js";
import { joinedUniversityIdsHas } from "@/utils/universityIds.js";
import { groupChatCacheKey, resolveGroupChatSwitch } from "@/utils/groupChatSwitch.js";

export { groupChatCacheKey };

export function useDashboardChatRealtime({
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
  closeGroupChatSearch,
  closePrivateChatSearch,
  setHighlightedGroupMessageId,
  setHighlightedPrivateMessageId,
  groupMessageRefs: groupMessageRefsRef,
  privateMessageRefs: privateMessageRefsRef,
  refreshChatSummariesRef,
  privateMessagesReloadNonce,
}) {
  const [groupTypingUsers, setGroupTypingUsers] = useState([]);
  const [privateTypingUsers, setPrivateTypingUsers] = useState([]);
  const [groupChatTags, setGroupChatTags] = useState([]);
  const [groupStreamReady, setGroupStreamReady] = useState(false);
  const [privateStreamReady, setPrivateStreamReady] = useState(false);
  const [groupMessagesUniversityKey, setGroupMessagesUniversityKey] = useState(null);
  const [isPrivateMessagesLoading, setIsPrivateMessagesLoading] = useState(false);

  const groupTypingNotifyRef = useRef(() => {});
  const privateTypingNotifyRef = useRef(() => {});
  const resetGroupStreamSinceIdRef = useRef(() => {});
  const resetPrivateStreamSinceIdRef = useRef(() => {});
  const privateThreadLoadRef = useRef(null);
  const groupUniversityLoadRef = useRef(null);
  const privateSyncRequestRef = useRef(0);
  const groupChatCacheRef = useRef(new Map());
  const groupPrefetchInflightRef = useRef(new Set());

  const activeGroupMessageTag =
    selectedUniversityId &&
    chatPanel === "group" &&
    joinedUniversityIdsHas(joinedUniversityIds, selectedUniversityId) &&
    activeGroupTag
      ? activeGroupTag
      : "";

  const activeGroupMessagesKey =
    selectedUniversityId && chatPanel === "group"
      ? groupChatCacheKey(selectedUniversityId, activeGroupMessageTag)
      : null;

  const isGroupMessagesLoading = Boolean(
    activeGroupMessagesKey && activeGroupMessagesKey !== groupMessagesUniversityKey
  );

  const onGroupMessageCreated = useCallback((created) => {
    resetGroupStreamSinceIdRef.current(created.id);
    setGroupTypingUsers([]);
  }, []);

  const onPrivateMessageCreated = useCallback((created) => {
    resetPrivateStreamSinceIdRef.current(created.id);
    refreshChatSummariesRef.current();
  }, [refreshChatSummariesRef]);

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
    [setGroupMessages]
  );

  const mergeGroupUpdated = useCallback(
    (incoming) => setGroupMessages((current) => mergeById(current, incoming)),
    [setGroupMessages]
  );

  const removeGroupMessages = useCallback(
    (ids) => {
      const idSet = new Set(ids);
      setGroupMessages((current) => current.filter((item) => !idSet.has(item.id)));
      if (groupPinnedMessage && idSet.has(groupPinnedMessage.id)) {
        setGroupPinnedMessage(null);
      }
    },
    [groupPinnedMessage, setGroupMessages, setGroupPinnedMessage]
  );

  const mergePrivateMessages = useCallback(
    (incoming) => {
      setDirectMessages((current) => mergeById(current, incoming));
      refreshChatSummariesRef.current();
    },
    [setDirectMessages, refreshChatSummariesRef]
  );

  const mergePrivateUpdated = useCallback(
    (incoming) => setDirectMessages((current) => mergeById(current, incoming)),
    [setDirectMessages]
  );

  const removePrivateMessages = useCallback(
    (ids) => {
      const idSet = new Set(ids);
      setDirectMessages((current) => current.filter((item) => !idSet.has(item.id)));
      if (privatePinnedMessage && idSet.has(privatePinnedMessage.id)) {
        setPrivatePinnedMessage(null);
      }
    },
    [privatePinnedMessage, setDirectMessages, setPrivatePinnedMessage]
  );

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
    cancelEditChatMessage();
  }, [selectedUniversityId, selectedThreadId, cancelEditChatMessage]);

  useEffect(() => {
    closeGroupChatSearch();
    closePrivateChatSearch();
    setHighlightedGroupMessageId(null);
    setHighlightedPrivateMessageId(null);
    groupMessageRefsRef.current = {};
    privateMessageRefsRef.current = {};
    setGroupTypingUsers([]);
  }, [
    selectedUniversityId,
    closeGroupChatSearch,
    closePrivateChatSearch,
    setHighlightedGroupMessageId,
    setHighlightedPrivateMessageId,
    groupMessageRefsRef,
    privateMessageRefsRef,
  ]);

  useEffect(() => {
    closePrivateChatSearch();
    setHighlightedPrivateMessageId(null);
    privateMessageRefsRef.current = {};
    setPrivateTypingUsers([]);
  }, [
    selectedThreadId,
    closePrivateChatSearch,
    setHighlightedPrivateMessageId,
    privateMessageRefsRef,
  ]);

  const { resetSinceId: resetGroupStreamSinceId } = useChatRealtimeStream({
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

  const { resetSinceId: resetPrivateStreamSinceId } = useChatRealtimeStream({
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

  useEffect(() => {
    resetGroupStreamSinceIdRef.current = resetGroupStreamSinceId;
    resetPrivateStreamSinceIdRef.current = resetPrivateStreamSinceId;
  }, [resetGroupStreamSinceId, resetPrivateStreamSinceId]);

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

  useEffect(() => {
    if (!selectedUniversityId || chatPanel !== "group") {
      setGroupStreamReady(false);
      groupUniversityLoadRef.current = null;
      return undefined;
    }

    const cacheKey = groupChatCacheKey(selectedUniversityId, activeGroupMessageTag);
    const isNewTarget = groupUniversityLoadRef.current !== cacheKey;
    groupUniversityLoadRef.current = cacheKey;

    const isMember = joinedUniversityIdsHas(joinedUniversityIds, selectedUniversityId);
    let isMounted = true;
    setGroupStreamReady(false);

    const cached = groupChatCacheRef.current.get(cacheKey);
    if (isNewTarget && cached) {
      setGroupMessages(cached.messages);
      setGroupPinnedMessage(cached.pinned);
      setGroupMessagesUniversityKey(cacheKey);
      if (isMember) {
        resetGroupStreamSinceIdRef.current(maxMessageId(cached.messages));
        setGroupStreamReady(true);
      }
    }

    async function loadMessages() {
      try {
        const { messages, pinned } = await getUniversityMessages(selectedUniversityId, {
          tag: isMember && activeGroupMessageTag ? activeGroupMessageTag : undefined,
        });
        if (!isMounted || groupUniversityLoadRef.current !== cacheKey) {
          return;
        }
        groupChatCacheRef.current.set(cacheKey, { messages, pinned });
        setGroupMessages(messages);
        setGroupPinnedMessage(pinned);
        setGroupMessagesUniversityKey(cacheKey);
        if (isMember) {
          resetGroupStreamSinceIdRef.current(maxMessageId(messages));
          setGroupStreamReady(true);
          void markUniversityChatRead(selectedUniversityId).then(() => {
            if (isMounted) {
              refreshChatSummariesRef.current();
            }
          });
        }
      } catch {
        if (isMounted && groupUniversityLoadRef.current === cacheKey) {
          setGroupMessages([]);
          setGroupPinnedMessage(null);
          setGroupMessagesUniversityKey(cacheKey);
          setGroupStreamReady(false);
        }
      }
    }

    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [
    selectedUniversityId,
    chatPanel,
    joinedUniversityIds,
    activeGroupMessageTag,
    setGroupMessages,
    setGroupPinnedMessage,
    refreshChatSummariesRef,
  ]);

  useEffect(() => {
    if (!activeGroupMessagesKey || activeGroupMessagesKey !== groupMessagesUniversityKey) {
      return;
    }
    groupChatCacheRef.current.set(activeGroupMessagesKey, {
      messages: groupMessages,
      pinned: groupPinnedMessage,
    });
  }, [groupMessages, groupPinnedMessage, activeGroupMessagesKey, groupMessagesUniversityKey]);

  const prefetchGroupMessages = useCallback(
    (universityId) => {
      if (!universityId) {
        return;
      }
      const cacheKey = groupChatCacheKey(universityId, "");
      if (
        groupChatCacheRef.current.has(cacheKey) ||
        groupPrefetchInflightRef.current.has(cacheKey)
      ) {
        return;
      }
      groupPrefetchInflightRef.current.add(cacheKey);
      void getUniversityMessages(universityId)
        .then(({ messages, pinned }) => {
          groupChatCacheRef.current.set(cacheKey, { messages, pinned });
        })
        .catch(() => {})
        .finally(() => {
          groupPrefetchInflightRef.current.delete(cacheKey);
        });
    },
    []
  );

  const prepareGroupChatSwitch = useCallback(
    (universityId) => {
      const resolved = resolveGroupChatSwitch({
        universityId,
        cache: groupChatCacheRef.current,
        joinedUniversityIds,
      });

      if (!resolved) {
        return false;
      }

      groupUniversityLoadRef.current = resolved.cacheKey;

      if (resolved.clearTyping) {
        setGroupTypingUsers([]);
      }

      setGroupMessages(resolved.messages);
      setGroupPinnedMessage(resolved.pinned);
      setGroupMessagesUniversityKey(resolved.messagesUniversityKey);
      setGroupStreamReady(resolved.streamReady);

      if (resolved.streamSinceId != null) {
        resetGroupStreamSinceIdRef.current(resolved.streamSinceId);
      }

      return resolved.cacheHit;
    },
    [joinedUniversityIds, setGroupMessages, setGroupPinnedMessage]
  );

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
      setIsPrivateMessagesLoading(false);
      privateThreadLoadRef.current = null;
      return undefined;
    }

    const isNewThread = privateThreadLoadRef.current !== selectedThreadId;
    privateThreadLoadRef.current = selectedThreadId;

    let isMounted = true;
    setPrivateStreamReady(false);

    if (isNewThread) {
      setIsPrivateMessagesLoading(true);
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
      } finally {
        if (isMounted) {
          setIsPrivateMessagesLoading(false);
        }
      }
    }

    loadPrivateMessages();
    return () => {
      isMounted = false;
    };
  }, [
    selectedThreadId,
    chatPanel,
    privateMessagesReloadNonce,
    setDirectMessages,
    setPrivatePinnedMessage,
    refreshChatSummariesRef,
  ]);

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
    const intervalId = window.setInterval(pollPrivateMessages, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [
    privateStreamReady,
    selectedThreadId,
    chatPanel,
    activeSection,
    setDirectMessages,
    setPrivatePinnedMessage,
  ]);

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
    setDirectMessages,
    setPrivatePinnedMessage,
  ]);

  const notifyGroupTyping = useCallback(() => {
    if (selectedUniversityId && hasJoinedSelectedChat) {
      groupTypingNotifyRef.current();
    }
  }, [selectedUniversityId, hasJoinedSelectedChat]);

  const notifyPrivateTyping = useCallback(() => {
    if (selectedThreadId) {
      privateTypingNotifyRef.current();
    }
  }, [selectedThreadId]);

  return {
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
  };
}
