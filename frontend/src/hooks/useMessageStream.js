import { useCallback, useEffect, useRef } from "react";
import { fetchStreamToken } from "../services/authService.js";

function mergeById(current, incoming) {
  const map = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => map.set(item.id, item));
  return [...map.values()].sort((a, b) => a.id - b.id);
}

export function maxMessageId(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 0;
  }
  return messages.reduce((max, item) => (item.id > max ? item.id : max), 0);
}
export function useMessageStream({
  streamUrl,
  enabled,
  onMessages,
  onMessageUpdated,
  onMessageDeleted,
  onTyping,
}) {
  const sinceIdRef = useRef(0);
  const onMessagesRef = useRef(onMessages);
  const onMessageUpdatedRef = useRef(onMessageUpdated);
  const onMessageDeletedRef = useRef(onMessageDeleted);
  const onTypingRef = useRef(onTyping);

  useEffect(() => {
    onMessagesRef.current = onMessages;
  }, [onMessages]);

  useEffect(() => {
    onMessageUpdatedRef.current = onMessageUpdated;
  }, [onMessageUpdated]);

  useEffect(() => {
    onMessageDeletedRef.current = onMessageDeleted;
  }, [onMessageDeleted]);

  useEffect(() => {
    onTypingRef.current = onTyping;
  }, [onTyping]);

  useEffect(() => {
    sinceIdRef.current = 0;
  }, [streamUrl]);

  useEffect(() => {
    if (!enabled || !streamUrl) {
      return undefined;
    }

    let source;
    let reconnectTimer;
    let cancelled = false;

    async function connect() {
      if (cancelled) {
        return;
      }

      let streamToken;
      try {
        streamToken = await fetchStreamToken();
      } catch {
        reconnectTimer = window.setTimeout(connect, 3000);
        return;
      }

      if (cancelled) {
        return;
      }

      const separator = streamUrl.includes("?") ? "&" : "?";
      const url = `${streamUrl}${separator}stream_token=${encodeURIComponent(streamToken)}&since_id=${sinceIdRef.current}`;
      source = new EventSource(url, { withCredentials: true });

      source.addEventListener("messages", (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (!Array.isArray(payload) || payload.length === 0) {
            return;
          }
          const lastId = payload[payload.length - 1]?.id;
          if (lastId) {
            sinceIdRef.current = Math.max(sinceIdRef.current, lastId);
          }
          onMessagesRef.current?.(payload);
        } catch {
          // ignore malformed events
        }
      });

      source.addEventListener("message_updated", (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (Array.isArray(payload) && payload.length > 0) {
            onMessageUpdatedRef.current?.(payload);
          }
        } catch {
          // ignore
        }
      });

      source.addEventListener("message_deleted", (event) => {
        try {
          const payload = JSON.parse(event.data);
          const ids = payload?.ids;
          if (Array.isArray(ids) && ids.length > 0) {
            onMessageDeletedRef.current?.(ids);
          }
        } catch {
          // ignore
        }
      });

      source.addEventListener("typing", (event) => {
        try {
          const payload = JSON.parse(event.data);
          onTypingRef.current?.(payload.users || []);
        } catch {
          // ignore
        }
      });

      source.onerror = () => {
        source?.close();
        reconnectTimer = window.setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      cancelled = true;
      window.clearTimeout(reconnectTimer);
      source?.close();
    };
  }, [streamUrl, enabled]);

  const resetSinceId = useCallback((maxId = 0) => {
    sinceIdRef.current = maxId;
  }, []);

  return {
    resetSinceId,
  };
}

export { mergeById };
