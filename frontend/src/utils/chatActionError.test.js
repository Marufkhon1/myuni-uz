import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createChatErrorReporter } from "./chatActionError.js";

describe("createChatErrorReporter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sets message and clears after timeout", () => {
    const messages = [];
    const { reportChatError } = createChatErrorReporter((value) => messages.push(value));

    reportChatError("Xabar yuborilmadi.");
    expect(messages).toEqual(["Xabar yuborilmadi."]);

    vi.advanceTimersByTime(8000);
    expect(messages.at(-1)).toBe("");
  });

  it("clearChatError resets immediately", () => {
    const messages = [];
    const { reportChatError, clearChatError } = createChatErrorReporter((value) =>
      messages.push(value)
    );

    reportChatError("Xatolik");
    clearChatError();
    expect(messages.at(-1)).toBe("");
  });
});
