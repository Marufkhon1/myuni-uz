import { useCallback, useEffect, useState } from "react";
import { getSupportBotWelcome } from "@/components/dashboard/supportBot.js";

export function useSupportChat(isStudent = false) {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(() => [getSupportBotWelcome(isStudent)]);

  useEffect(() => {
    setMessages([getSupportBotWelcome(isStudent)]);
    setDraft("");
  }, [isStudent]);

  const openChatModal = useCallback(() => setIsChatModalOpen(true), []);
  const closeChatModal = useCallback(() => setIsChatModalOpen(false), []);

  return {
    isChatModalOpen,
    openChatModal,
    closeChatModal,
    draft,
    setDraft,
    messages,
    setMessages,
  };
}
