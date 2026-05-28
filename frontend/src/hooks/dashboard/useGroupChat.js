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
} from "../../services/chatService.js";
import { getApiErrorMessage } from "../../utils/apiErrors.js";

export function useGroupChat({ reportChatError, clearChatError }) {
  const [groupMessage, setGroupMessage] = useState("");
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupPinnedMessage, setGroupPinnedMessage] = useState(null);
  const [isGroupSending, setIsGroupSending] = useState(false);
  const [isGroupJoining, setIsGroupJoining] = useState(false);
  const [editingChatMessage, setEditingChatMessage] = useState(null);

  const updateMessageInList = useCallback((setter, updated) => {
    setter((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  const openEditChatMessage = useCallback(
    (message) => {
      setEditingChatMessage({ message, scope: "group" });
      clearChatError();
      setGroupMessage(message.text);
    },
    [clearChatError]
  );

  const cancelEditChatMessage = useCallback(() => {
    setEditingChatMessage((current) => {
      if (current?.scope === "group") {
        setGroupMessage("");
      }
      return null;
    });
  }, []);

  const sendGroupChatMessage = useCallback(
    async (event, { hasJoinedSelectedChat, selectedUniversityId }) => {
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
    ]
  );

  const handleDeleteGroupMessage = useCallback(
    async (message) => {
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
    },
    [groupPinnedMessage, reportChatError]
  );

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

  const handlePinGroupMessage = useCallback(async (message) => {
    const updated = await pinUniversityMessage(message.university_id ?? message.university, message.id);
    setGroupPinnedMessage(updated);
  }, []);

  const handleUnpinGroupMessage = useCallback(async (message) => {
    await unpinUniversityMessage(message.university_id ?? message.university, message.id);
    setGroupPinnedMessage(null);
  }, []);

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
    openEditGroupMessage: openEditChatMessage,
    cancelEditChatMessage,
    sendGroupChatMessage,
    handleDeleteGroupMessage,
    handleGroupReaction,
    handlePinGroupMessage,
    handleUnpinGroupMessage,
    joinUniversity,
    leaveUniversityChat,
    updateMessageInList,
  };
}
