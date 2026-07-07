export function handleChatStreamPayload(eventName, rawData, handlers) {
  try {
    const payload = typeof rawData === "string" ? JSON.parse(rawData) : rawData;

    if (eventName === "messages") {
      if (!Array.isArray(payload) || payload.length === 0) {
        return null;
      }
      const lastId = payload[payload.length - 1]?.id;
      handlers.onMessages?.(payload);
      return lastId ?? null;
    }

    if (eventName === "message_updated") {
      if (Array.isArray(payload) && payload.length > 0) {
        handlers.onMessageUpdated?.(payload);
      }
      return null;
    }

    if (eventName === "message_deleted") {
      const ids = payload?.ids;
      if (Array.isArray(ids) && ids.length > 0) {
        handlers.onMessageDeleted?.(ids);
      }
      return null;
    }

    if (eventName === "typing") {
      handlers.onTyping?.(payload?.users || []);
      return null;
    }
  } catch {
    // ignore malformed events
  }

  return null;
}
