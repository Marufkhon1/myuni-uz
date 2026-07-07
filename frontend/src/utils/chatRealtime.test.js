import { describe, expect, it, vi } from "vitest";
import { handleChatStreamPayload } from "./chatStreamHandlers.js";
import { isChatWebSocketEnabled, parseChatStreamUrl } from "./chatRealtimeUrls.js";

describe("parseChatStreamUrl", () => {
  it("parses university stream urls", () => {
    expect(parseChatStreamUrl("/api/universities/12/messages/stream/")).toEqual({
      channel: "university",
      id: 12,
    });
  });

  it("parses direct stream urls", () => {
    expect(parseChatStreamUrl("/api/universities/directs/9/messages/stream/")).toEqual({
      channel: "direct",
      id: 9,
    });
  });
});

describe("isChatWebSocketEnabled", () => {
  it("is enabled by default", () => {
    expect(isChatWebSocketEnabled()).toBe(true);
  });
});

describe("handleChatStreamPayload", () => {
  it("dispatches message batches and returns last id", () => {
    const onMessages = vi.fn();
    const lastId = handleChatStreamPayload(
      "messages",
      JSON.stringify([{ id: 4 }, { id: 7 }]),
      { onMessages }
    );

    expect(onMessages).toHaveBeenCalledWith([{ id: 4 }, { id: 7 }]);
    expect(lastId).toBe(7);
  });

  it("dispatches delete ids", () => {
    const onMessageDeleted = vi.fn();
    handleChatStreamPayload("message_deleted", JSON.stringify({ ids: [3, 8] }), {
      onMessageDeleted,
    });

    expect(onMessageDeleted).toHaveBeenCalledWith([3, 8]);
  });
});
