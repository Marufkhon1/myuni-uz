import { useCallback, useEffect, useRef } from "react";
import { fetchStreamToken } from "@/services/authService.js";
import { getAccessToken, isCookieSession } from "@/utils/authStorage.js";
import { handleChatStreamPayload } from "@/utils/chatStreamHandlers.js";
import { parseChatStreamUrl, resolveChatWebSocketUrl } from "@/utils/chatRealtimeUrls.js";

function buildWebSocketUrl(baseUrl) {
  const url = new URL(baseUrl);
  if (!isCookieSession()) {
    const accessToken = getAccessToken();
    if (accessToken) {
      url.searchParams.set("token", accessToken);
      return url.toString();
    }
  }
  return url.toString();
}

export function useChatWebSocketStream({
  streamUrl,
  enabled,
  onMessages,
  onMessageUpdated,
  onMessageDeleted,
  onTyping,
}) {
  const sinceIdRef = useRef(0);
  const subscriptionRef = useRef(null);
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

    const target = parseChatStreamUrl(streamUrl);
    if (!target) {
      return undefined;
    }

    let socket;
    let reconnectTimer;
    let cancelled = false;
    let reconnectAttempt = 0;

    function dispatchEvent(eventName, data) {
      const lastId = handleChatStreamPayload(eventName, data, handlersRef.current);
      if (lastId) {
        sinceIdRef.current = Math.max(sinceIdRef.current, lastId);
      }
    }

    async function subscribe() {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return;
      }

      socket.send(
        JSON.stringify({
          type: "subscribe",
          channel: target.channel,
          id: target.id,
          since_id: sinceIdRef.current,
        })
      );
      subscriptionRef.current = `${target.channel}:${target.id}`;
    }

    async function connect() {
      if (cancelled) {
        return;
      }

      let url = buildWebSocketUrl(resolveChatWebSocketUrl());

      if (!isCookieSession() && !url.includes("token=")) {
        try {
          const streamToken = await fetchStreamToken();
          if (cancelled) {
            return;
          }
          const nextUrl = new URL(url);
          nextUrl.searchParams.set("stream_token", streamToken);
          url = nextUrl.toString();
        } catch {
          reconnectAttempt += 1;
          reconnectTimer = window.setTimeout(connect, Math.min(10000, 1000 * reconnectAttempt));
          return;
        }
      }

      socket = new WebSocket(url);

      socket.addEventListener("open", () => {
        reconnectAttempt = 0;
        subscribe();
      });

      socket.addEventListener("message", (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "connected" || payload.type === "subscribed" || payload.type === "pong") {
            return;
          }
          if (payload.event) {
            dispatchEvent(payload.event, payload.data);
          }
        } catch {
          // ignore malformed payloads
        }
      });

      socket.addEventListener("close", () => {
        if (cancelled) {
          return;
        }
        reconnectAttempt += 1;
        reconnectTimer = window.setTimeout(connect, Math.min(10000, 1000 * reconnectAttempt));
      });

      socket.addEventListener("error", () => {
        socket?.close();
      });
    }

    connect();

    return () => {
      cancelled = true;
      window.clearTimeout(reconnectTimer);
      subscriptionRef.current = null;
      socket?.close();
    };
  }, [streamUrl, enabled]);

  const resetSinceId = useCallback((maxId = 0) => {
    sinceIdRef.current = maxId;
  }, []);

  return {
    resetSinceId,
  };
}
