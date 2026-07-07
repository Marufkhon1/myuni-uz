import { useCallback, useMemo } from "react";

export function useDashboardChatActions({
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
}) {
  const editingChatMessage = useMemo(
    () =>
      groupEditingChatMessage?.scope === "group"
        ? groupEditingChatMessage
        : privateEditingChatMessage?.scope === "private"
          ? privateEditingChatMessage
          : null,
    [groupEditingChatMessage, privateEditingChatMessage]
  );

  const openEditChatMessage = useCallback(
    (message, scope) => {
      if (scope === "group") {
        openEditGroupMessage(message);
        return;
      }
      openEditPrivateMessage(message);
    },
    [openEditGroupMessage, openEditPrivateMessage]
  );

  const cancelEditChatMessage = useCallback(() => {
    if (groupEditingChatMessage) {
      cancelEditGroupMessage();
      return;
    }
    if (privateEditingChatMessage) {
      cancelEditPrivateMessage();
    }
  }, [
    groupEditingChatMessage,
    privateEditingChatMessage,
    cancelEditGroupMessage,
    cancelEditPrivateMessage,
  ]);

  const sendGroupChatMessage = useCallback(
    (event) =>
      sendGroupChatMessageBase(event, {
        hasJoinedSelectedChat,
        selectedUniversityId,
      }),
    [sendGroupChatMessageBase, hasJoinedSelectedChat, selectedUniversityId]
  );

  const sendPrivateChatMessage = useCallback(
    (event) =>
      sendPrivateChatMessageBase(event, {
        selectedThreadId,
        setDirectThreads,
        setDraftThread,
      }),
    [sendPrivateChatMessageBase, selectedThreadId, setDirectThreads, setDraftThread]
  );

  const handleGroupReaction = useCallback(
    (message, emoji) => handleGroupReactionBase(message, emoji, setReactingMessageId),
    [handleGroupReactionBase, setReactingMessageId]
  );

  const handlePrivateReaction = useCallback(
    (message, emoji) => handlePrivateReactionBase(message, emoji, setReactingMessageId),
    [handlePrivateReactionBase, setReactingMessageId]
  );

  const handlePinGroupMessage = useCallback(
    (message) => {
      if (!selectedUniversityId || !hasJoinedSelectedChat) {
        return;
      }
      handlePinGroupMessageBase(message, selectedUniversityId);
      clearChatError();
    },
    [handlePinGroupMessageBase, selectedUniversityId, hasJoinedSelectedChat, clearChatError]
  );

  const handleUnpinGroupMessage = useCallback(
    (message) => {
      if (!selectedUniversityId) {
        return;
      }
      handleUnpinGroupMessageBase(message, selectedUniversityId);
      clearChatError();
    },
    [handleUnpinGroupMessageBase, selectedUniversityId, clearChatError]
  );

  const handlePinPrivateMessage = useCallback(
    (message) => {
      if (!selectedThreadId) {
        return;
      }
      handlePinPrivateMessageBase(message, selectedThreadId);
      clearChatError();
    },
    [handlePinPrivateMessageBase, selectedThreadId, clearChatError]
  );

  const handleUnpinPrivateMessage = useCallback(
    (message) => {
      if (!selectedThreadId) {
        return;
      }
      handleUnpinPrivateMessageBase(message, selectedThreadId);
      clearChatError();
    },
    [handleUnpinPrivateMessageBase, selectedThreadId, clearChatError]
  );

  return {
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
  };
}
