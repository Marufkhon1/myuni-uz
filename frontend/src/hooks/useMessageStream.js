import { useCallback, useEffect, useRef } from "react";
import { fetchStreamToken } from "@/services/authService.js";
import { AUTH_LOGOUT_EVENT } from "@/utils/authEvents.js";
import { isCookieSession } from "@/utils/authStorage.js";import { handleChatStreamPayload } from "@/utils/chatStreamHandlers.js";

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

function attachEventSourceHandlers(source, handlers, sinceIdRef) {
  const dispatch = (eventName) => (event) => {
    const lastId = handleChatStreamPayload(eventName, event.data, handlers);
    if (lastId) {
      sinceIdRef.current = Math.max(sinceIdRef.current, lastId);
    }
  };

  source.addEventListener("messages", dispatch("messages"));
  source.addEventListener("message_updated", dispatch("message_updated"));
  source.addEventListener("message_deleted", dispatch("message_deleted"));
  source.addEventListener("typing", dispatch("typing"));
  source.addEventListener("ping", () => {
    // keep-alive from server
  });
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
  const handlersRef = useRef({
    onMessages,
    onMessageUpdated,
    onMessageDeleted,
    onTyping,
  });

  useEffect(() => {
    handlersRef.current = {
      onMessages,
      onMessageUpdated,
      onMessageDeleted,
      onTyping,
    };
  }, [onMessages, onMessageUpdated, onMessageDeleted, onTyping]);

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

    function stopStream() {
      cancelled = true;
      window.clearTimeout(reconnectTimer);
      source?.close();
      source = undefined;
    }

    function onAuthLogout() {
      stopStream();
    }

    window.addEventListener(AUTH_LOGOUT_EVENT, onAuthLogout);

    async function connect() {
      if (cancelled) {
        return;
      }

      const separator = streamUrl.includes("?") ? "&" : "?";
      let url = `${streamUrl}${separator}since_id=${sinceIdRef.current}`;

      if (!isCookieSession()) {
        try {
          const streamToken = await fetchStreamToken();
          if (cancelled) {
            return;
          }
          url = `${url}&stream_token=${encodeURIComponent(streamToken)}`;
        } catch {
          reconnectTimer = window.setTimeout(connect, 3000);
          return;
        }
      }

      source = new EventSource(url, { withCredentials: true });
      attachEventSourceHandlers(source, handlersRef.current, sinceIdRef);

      source.onerror = () => {
        source?.close();
        reconnectTimer = window.setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, onAuthLogout);
      stopStream();
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
