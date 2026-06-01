import { useEffect, useState } from "react";
import { getSupportBotWelcome } from "../components/dashboard/supportBot.js";

export function useSupportChat(isStudent = false) {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(() => [getSupportBotWelcome(isStudent)]);

  useEffect(() => {
    setMessages([getSupportBotWelcome(isStudent)]);
    setDraft("");
  }, [isStudent]);

  return {
    isChatModalOpen,
    openChatModal: () => setIsChatModalOpen(true),
    closeChatModal: () => setIsChatModalOpen(false),
    draft,
    setDraft,
    messages,
    setMessages,
  };
}
