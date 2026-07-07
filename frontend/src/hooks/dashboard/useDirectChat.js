import { useCallback, useState } from "react";
import {
  deleteDirectMessage,
  editDirectMessage,
  getDirectThreads,
  pinDirectMessage,
  reactToDirectMessage,
  sendDirectMessage,
  unpinDirectMessage,
} from "@/services/chatService.js";
import { getApiErrorMessage } from "@/utils/apiErrors.js";
import { mergeById } from "@/hooks/useMessageStream.js";

export function useDirectChat({ reportChatError, clearChatError, onMessageCreated } = {}) {
  const [privateMessage, setPrivateMessage] = useState("");
  const [directMessages, setDirectMessages] = useState([]);
  const [privatePinnedMessage, setPrivatePinnedMessage] = useState(null);
  const [isPrivateSending, setIsPrivateSending] = useState(false);
  const [editingChatMessage, setEditingChatMessage] = useState(null);

  const updateMessageInList = useCallback((setter, updated) => {
    setter((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  const openEditPrivateMessage = useCallback(
    (message) => {
      setEditingChatMessage({ message, scope: "private" });
      clearChatError();
      setPrivateMessage(message.text);
    },
    [clearChatError]
  );

  const cancelEditPrivateMessage = useCallback(() => {
    setEditingChatMessage((current) => {
      if (current?.scope === "private") {
        setPrivateMessage("");
      }
      return null;
    });
  }, []);

  const sendPrivateChatMessage = useCallback(
    async (event, { selectedThreadId, setDirectThreads, setDraftThread }) => {
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
          onMessageCreated?.(created);
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
    },
    [
      privateMessage,
      isPrivateSending,
      editingChatMessage,
      privatePinnedMessage,
      clearChatError,
      reportChatError,
      updateMessageInList,
      onMessageCreated,
    ]
  );

  const deletePrivateMessageById = useCallback(async (messageId) => {
    await deleteDirectMessage(messageId);
    setDirectMessages((current) => current.filter((item) => item.id !== messageId));
    setPrivatePinnedMessage((current) => (current?.id === messageId ? null : current));
  }, []);

  const handlePrivateReaction = useCallback(
    async (message, emoji, setReactingMessageId) => {
      setReactingMessageId(message.id);
      try {
        const updated = await reactToDirectMessage(message.id, emoji);
        updateMessageInList(setDirectMessages, updated);
      } catch (error) {
        reportChatError(getApiErrorMessage(error, "Reaksiya qo'shilmadi."));
      } finally {
        setReactingMessageId(null);
      }
    },
    [reportChatError, updateMessageInList]
  );

  const handlePinPrivateMessage = useCallback(
    async (message, selectedThreadId) => {
      try {
        const updated = await pinDirectMessage(selectedThreadId, message.id);
        setPrivatePinnedMessage(updated);
      } catch (error) {
        reportChatError(getApiErrorMessage(error, "Xabarni qadalib bo'lmadi."));
      }
    },
    [reportChatError]
  );

  const handleUnpinPrivateMessage = useCallback(
    async (message, selectedThreadId) => {
      try {
        await unpinDirectMessage(selectedThreadId, message.id);
        setPrivatePinnedMessage(null);
      } catch (error) {
        reportChatError(getApiErrorMessage(error, "Qadalgan xabarni olib bo'lmadi."));
      }
    },
    [reportChatError]
  );

  return {
    privateMessage,
    setPrivateMessage,
    directMessages,
    setDirectMessages,
    privatePinnedMessage,
    setPrivatePinnedMessage,
    isPrivateSending,
    editingChatMessage,
    setEditingChatMessage,
    openEditPrivateMessage,
    cancelEditPrivateMessage,
    sendPrivateChatMessage,
    deletePrivateMessageById,
    handlePrivateReaction,
    handlePinPrivateMessage,
    handleUnpinPrivateMessage,
    updateMessageInList,
  };
}
