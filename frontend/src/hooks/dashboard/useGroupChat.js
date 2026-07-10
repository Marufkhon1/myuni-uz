import { useCallback, useState } from "react";
import {
  deleteUniversityMessage,
  editUniversityMessage,
  joinUniversity,
  leaveUniversityChat,
  pinUniversityMessage,
  reactToUniversityMessage,
  sendUniversityMessage,
  unpinUniversityMessage,
} from "@/services/chatService.js";
import { getApiErrorMessage } from "@/utils/apiErrors.js";
import { mergeById } from "@/hooks/useMessageStream.js";
import { buildReplyPayload, parseReplyPayload } from "@/utils/chatReplyFormat.js";

export function useGroupChat({ reportChatError, clearChatError, onMessageCreated } = {}) {
  const [groupMessage, setGroupMessage] = useState("");
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupPinnedMessage, setGroupPinnedMessage] = useState(null);
  const [isGroupSending, setIsGroupSending] = useState(false);
  const [isGroupJoining, setIsGroupJoining] = useState(false);
  const [editingChatMessage, setEditingChatMessage] = useState(null);

  const updateMessageInList = useCallback((setter, updated) => {
    setter((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  const openEditGroupMessage = useCallback(
    (message) => {
      setEditingChatMessage({ message, scope: "group" });
      clearChatError();
      setGroupMessage(parseReplyPayload(message.text).body || message.text);
    },
    [clearChatError]
  );

  const cancelEditGroupMessage = useCallback(() => {
    setEditingChatMessage((current) => {
      if (current?.scope === "group") {
        setGroupMessage("");
      }
      return null;
    });
  }, []);

  const sendGroupChatMessage = useCallback(
    async (event, { hasJoinedSelectedChat, selectedUniversityId, replyTo = null, onSent } = {}) => {
      event.preventDefault();
      const trimmed = groupMessage.trim();
      if (!hasJoinedSelectedChat || !trimmed || !selectedUniversityId || isGroupSending) {
        return;
      }

      const isEditingGroup = editingChatMessage?.scope === "group";
      const textToSend =
        !isEditingGroup && replyTo ? buildReplyPayload(replyTo, trimmed) : trimmed;
      setIsGroupSending(true);
      clearChatError();
      try {
        if (isEditingGroup) {
          const original = editingChatMessage.message.text || "";
          const { reply } = parseReplyPayload(original);
          const nextText = reply
            ? buildReplyPayload(
                { id: reply.id, author: reply.author, text: reply.text },
                trimmed
              )
            : trimmed;
          const updated = await editUniversityMessage(editingChatMessage.message.id, nextText);
          updateMessageInList(setGroupMessages, updated);
          if (groupPinnedMessage?.id === updated.id) {
            setGroupPinnedMessage(updated);
          }
          setEditingChatMessage(null);
          setGroupMessage("");
        } else {
          const created = await sendUniversityMessage(selectedUniversityId, textToSend);
          setGroupMessages((current) => mergeById(current, [created]));
          onMessageCreated?.(created);
          setGroupMessage("");
          onSent?.();
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
    },
    [
      groupMessage,
      isGroupSending,
      editingChatMessage,
      groupPinnedMessage,
      clearChatError,
      reportChatError,
      updateMessageInList,
      onMessageCreated,
    ]
  );

  const deleteGroupMessageById = useCallback(async (messageId) => {
    await deleteUniversityMessage(messageId);
    setGroupMessages((current) => current.filter((item) => item.id !== messageId));
    setGroupPinnedMessage((current) => (current?.id === messageId ? null : current));
  }, []);

  const handleGroupReaction = useCallback(
    async (message, emoji, setReactingMessageId) => {
      setReactingMessageId(message.id);
      try {
        const updated = await reactToUniversityMessage(message.id, emoji);
        updateMessageInList(setGroupMessages, updated);
      } catch (error) {
        reportChatError(getApiErrorMessage(error, "Reaksiya qo'shilmadi."));
      } finally {
        setReactingMessageId(null);
      }
    },
    [reportChatError, updateMessageInList]
  );

  const handlePinGroupMessage = useCallback(
    async (message, selectedUniversityId) => {
      try {
        const universityId = selectedUniversityId ?? message.university_id ?? message.university;
        const updated = await pinUniversityMessage(universityId, message.id);
        setGroupPinnedMessage(updated);
      } catch (error) {
        reportChatError(getApiErrorMessage(error, "Xabarni qadalib bo'lmadi."));
      }
    },
    [reportChatError]
  );

  const handleUnpinGroupMessage = useCallback(
    async (message, selectedUniversityId) => {
      try {
        const universityId = selectedUniversityId ?? message.university_id ?? message.university;
        await unpinUniversityMessage(universityId, message.id);
        setGroupPinnedMessage(null);
      } catch (error) {
        reportChatError(getApiErrorMessage(error, "Qadalgan xabarni olib bo'lmadi."));
      }
    },
    [reportChatError]
  );

  return {
    groupMessage,
    setGroupMessage,
    groupMessages,
    setGroupMessages,
    groupPinnedMessage,
    setGroupPinnedMessage,
    isGroupSending,
    isGroupJoining,
    setIsGroupJoining,
    editingChatMessage,
    setEditingChatMessage,
    openEditGroupMessage,
    cancelEditGroupMessage,
    sendGroupChatMessage,
    deleteGroupMessageById,
    handleGroupReaction,
    handlePinGroupMessage,
    handleUnpinGroupMessage,
    joinUniversity,
    leaveUniversityChat,
    updateMessageInList,
  };
}
