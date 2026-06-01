import { useEffect, useState } from "react";
import { getJoinedChatsTyping } from "../services/chatService.js";

export function useJoinedChatsTyping({ enabled, refreshMs = 2500 }) {
  const [typingByUniversity, setTypingByUniversity] = useState({});

  useEffect(() => {
    if (!enabled) {
      setTypingByUniversity({});
      return undefined;
    }

    let cancelled = false;

    async function refreshTyping() {
      try {
        const data = await getJoinedChatsTyping();
        if (!cancelled) {
          setTypingByUniversity(data?.typing ?? {});
        }
      } catch {
        // ignore polling failures
      }
    }

    refreshTyping();
    const timerId = window.setInterval(refreshTyping, refreshMs);

    return () => {
      cancelled = true;
      window.clearInterval(timerId);
    };
  }, [enabled, refreshMs]);

  return typingByUniversity;
}
