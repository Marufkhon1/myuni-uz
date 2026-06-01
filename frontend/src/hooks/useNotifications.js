import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getNotifications, markNotificationsRead } from "../services/notificationService.js";

const SYNTHETIC_CHAT_ID = "chat-unread-summary";

function buildChatUnreadItem({ totalUnread, dashboardPath }) {
  if (!totalUnread || totalUnread <= 0) {
    return null;
  }

  const label = totalUnread > 99 ? "99+" : String(totalUnread);
  return {
    id: SYNTHETIC_CHAT_ID,
    kind: "chat_unread",
    title: "O'qilmagan chat xabarlari",
    body: `${label} ta yangi xabar bor. Chat bo'limini oching.`,
    link: `${dashboardPath}?section=chats`,
    is_read: false,
    is_synthetic: true,
    created_at: new Date().toISOString(),
  };
}

export function useNotifications({ enabled = true, chatUnreadTotal = 0, dashboardPath = "/student/dashboard" }) {
  const [items, setItems] = useState([]);
  const [apiUnreadCount, setApiUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const hasLoadedOnceRef = useRef(false);

  const chatUnreadItem = useMemo(
    () => buildChatUnreadItem({ totalUnread: chatUnreadTotal, dashboardPath }),
    [chatUnreadTotal, dashboardPath]
  );

  const visibleItems = useMemo(() => {
    if (!chatUnreadItem) {
      return items;
    }
    return [chatUnreadItem, ...items];
  }, [items, chatUnreadItem]);

  const unreadCount = apiUnreadCount + (chatUnreadItem ? chatUnreadTotal : 0);

  const loadNotifications = useCallback(
    async ({ silent = false } = {}) => {
      if (!enabled) {
        return;
      }
      try {
        if (!silent) {
          setIsLoading(true);
        }
        const data = await getNotifications();
        setItems(data.results ?? []);
        setApiUnreadCount(data.unread_count ?? 0);
        hasLoadedOnceRef.current = true;
      } catch {
        // ignore polling errors
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const intervalId = window.setInterval(() => loadNotifications({ silent: true }), 30000);
    return () => window.clearInterval(intervalId);
  }, [enabled, loadNotifications]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications({ silent: hasLoadedOnceRef.current });
    }
  }, [isOpen, loadNotifications]);

  const markAllRead = useCallback(async () => {
    if (apiUnreadCount <= 0) {
      return;
    }
    try {
      await markNotificationsRead();
      setItems((current) => current.map((item) => ({ ...item, is_read: true })));
      setApiUnreadCount(0);
    } catch {
      // ignore
    }
  }, [apiUnreadCount]);

  const markOneRead = useCallback(async (notificationId) => {
    if (!notificationId || String(notificationId) === SYNTHETIC_CHAT_ID) {
      return;
    }
    try {
      await markNotificationsRead(notificationId);
      setItems((current) =>
        current.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item))
      );
      setApiUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      // ignore
    }
  }, []);

  return {
    items: visibleItems,
    unreadCount,
    apiUnreadCount,
    chatUnreadTotal,
    isLoading,
    isOpen,
    setIsOpen,
    loadNotifications,
    markAllRead,
    markOneRead,
  };
}
