import { useCallback, useMemo, useState } from "react";
import { getChatMessagePlainPreview, normalizeReplySource } from "@/utils/chatReplyFormat.js";

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
  setComposerFocusToken,
}) {
  const [replyingToChatMessage, setReplyingToChatMessage] = useState(null);

  const editingChatMessage = useMemo(
    () =>
      groupEditingChatMessage?.scope === "group"
        ? groupEditingChatMessage
        : privateEditingChatMessage?.scope === "private"
          ? privateEditingChatMessage
          : null,
    [groupEditingChatMessage, privateEditingChatMessage]
  );

  const cancelReplyChatMessage = useCallback(() => {
    setReplyingToChatMessage(null);
  }, []);

  const openReplyChatMessage = useCallback(
    (message, scope) => {
      cancelEditGroupMessage();
      cancelEditPrivateMessage();
      setReplyingToChatMessage({ message, scope });
      clearChatError();
      setComposerFocusToken?.((value) => value + 1);
    },
    [cancelEditGroupMessage, cancelEditPrivateMessage, clearChatError, setComposerFocusToken]
  );

  const openEditChatMessage = useCallback(
    (message, scope) => {
      setReplyingToChatMessage(null);
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
        replyTo:
          replyingToChatMessage?.scope === "group" ? replyingToChatMessage.message : null,
        onSent: cancelReplyChatMessage,
      }),
    [
      sendGroupChatMessageBase,
      hasJoinedSelectedChat,
      selectedUniversityId,
      replyingToChatMessage,
      cancelReplyChatMessage,
    ]
  );

  const sendPrivateChatMessage = useCallback(
    (event) =>
      sendPrivateChatMessageBase(event, {
        selectedThreadId,
        setDirectThreads,
        setDraftThread,
        replyTo:
          replyingToChatMessage?.scope === "private" ? replyingToChatMessage.message : null,
        onSent: cancelReplyChatMessage,
      }),
    [
      sendPrivateChatMessageBase,
      selectedThreadId,
      setDirectThreads,
      setDraftThread,
      replyingToChatMessage,
      cancelReplyChatMessage,
    ]
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

  const replyComposePreview = useMemo(() => {
    if (!replyingToChatMessage?.message) {
      return null;
    }
    const source = normalizeReplySource(replyingToChatMessage.message);
    return {
      scope: replyingToChatMessage.scope,
      author: source?.author || "Foydalanuvchi",
      preview: getChatMessagePlainPreview(replyingToChatMessage.message.text || "", 160),
    };
  }, [replyingToChatMessage]);

  return {
    editingChatMessage,
    openEditChatMessage,
    cancelEditChatMessage,
    replyingToChatMessage,
    replyComposePreview,
    openReplyChatMessage,
    cancelReplyChatMessage,
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
