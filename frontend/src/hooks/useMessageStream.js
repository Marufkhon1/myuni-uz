import { useEffect, useRef } from "react";

const ACCESS_TOKEN_KEY = "myuni_access_token";

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
}

export function useMessageStream({ streamUrl, enabled, onMessages, onTyping }) {
  const sinceIdRef = useRef(0);
  const onMessagesRef = useRef(onMessages);
  const onTypingRef = useRef(onTyping);

  useEffect(() => {
    onMessagesRef.current = onMessages;
  }, [onMessages]);

  useEffect(() => {
    onTypingRef.current = onTyping;
  }, [onTyping]);

  useEffect(() => {
    if (!enabled || !streamUrl) {
      return undefined;
    }

    let source;
    let reconnectTimer;

    function connect() {
      const token = getAccessToken();
      const separator = streamUrl.includes("?") ? "&" : "?";
      const url = `${streamUrl}${separator}token=${encodeURIComponent(token)}&since_id=${sinceIdRef.current}`;
      source = new EventSource(url);

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

      source.addEventListener("typing", (event) => {
        try {
          const payload = JSON.parse(event.data);
          onTypingRef.current?.(payload.users || []);
        } catch {
          // ignore malformed events
        }
      });

      source.onerror = () => {
        source?.close();
        reconnectTimer = window.setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      window.clearTimeout(reconnectTimer);
      source?.close();
    };
  }, [streamUrl, enabled]);

  return {
    resetSinceId(maxId = 0) {
      sinceIdRef.current = maxId;
    },
  };
}
