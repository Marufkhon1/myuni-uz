import { describe, expect, it } from "vitest";
import { groupChatCacheKey, resolveGroupChatSwitch } from "@/utils/groupChatSwitch.js";

describe("groupChatCacheKey", () => {
  it("builds stable cache keys with optional tag", () => {
    expect(groupChatCacheKey(12)).toBe("12:");
    expect(groupChatCacheKey(12, "abituriyent")).toBe("12:abituriyent");
  });
});

describe("resolveGroupChatSwitch", () => {
  const messages = [{ id: 3, text: "Salom" }, { id: 7, text: "Yangi xabar" }];
  const pinned = { id: 1, text: "Pinned" };

  it("hydrates from cache on hit", () => {
    const cache = new Map([["2:", { messages, pinned }]]);
    const result = resolveGroupChatSwitch({
      universityId: 2,
      cache,
      joinedUniversityIds: new Set([2]),
    });

    expect(result).toEqual({
      cacheKey: "2:",
      cacheHit: true,
      messages,
      pinned,
      messagesUniversityKey: "2:",
      streamReady: true,
      streamSinceId: 7,
      clearTyping: true,
    });
  });

  it("clears messages on cache miss", () => {
    const result = resolveGroupChatSwitch({
      universityId: 5,
      cache: new Map(),
      joinedUniversityIds: new Set([5]),
    });

    expect(result).toEqual({
      cacheKey: "5:",
      cacheHit: false,
      messages: [],
      pinned: null,
      messagesUniversityKey: null,
      streamReady: false,
      streamSinceId: null,
      clearTyping: true,
    });
  });

  it("does not mark stream ready when user has not joined chat", () => {
    const cache = new Map([["4:", { messages, pinned: null }]]);
    const result = resolveGroupChatSwitch({
      universityId: 4,
      cache,
      joinedUniversityIds: new Set(),
    });

    expect(result?.cacheHit).toBe(true);
    expect(result?.streamReady).toBe(false);
    expect(result?.streamSinceId).toBeNull();
  });

  it("returns null without university id", () => {
    expect(
      resolveGroupChatSwitch({
        universityId: null,
        cache: new Map(),
        joinedUniversityIds: new Set(),
      })
    ).toBeNull();
  });
});
