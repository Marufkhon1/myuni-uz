import { useEffect, useState } from "react";
import { getDirectThreadsTyping } from "../services/chatService.js";

export function useDirectThreadsTyping({ enabled, refreshMs = 2500 }) {
  const [typingByThread, setTypingByThread] = useState({});

  useEffect(() => {
    if (!enabled) {
      setTypingByThread({});
      return undefined;
    }

    let cancelled = false;

    async function refreshTyping() {
      try {
        const data = await getDirectThreadsTyping();
        if (!cancelled) {
          setTypingByThread(data?.typing ?? {});
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

  return typingByThread;
}
