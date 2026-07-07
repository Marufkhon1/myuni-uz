export function isChatWebSocketEnabled() {
  return import.meta.env.VITE_CHAT_WEBSOCKET !== "false";
}

export function parseChatStreamUrl(streamUrl) {
  if (!streamUrl) {
    return null;
  }

  const universityMatch = streamUrl.match(/\/universities\/(\d+)\/messages\/stream\/?/);
  if (universityMatch) {
    return { channel: "university", id: Number(universityMatch[1]) };
  }

  const directMatch = streamUrl.match(/\/directs\/(\d+)\/messages\/stream\/?/);
  if (directMatch) {
    return { channel: "direct", id: Number(directMatch[1]) };
  }

  return null;
}

export function resolveChatWebSocketUrl() {
  const configured = import.meta.env.VITE_CHAT_WEBSOCKET_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    return "/ws/chat/";
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/chat/`;
}
