import { describe, expect, it } from "vitest";
import { createChatErrorReporter } from "./chatActionError.js";

describe("createChatErrorReporter", () => {
  it("reports unique chat errors to the handler", () => {
    const messages = [];
    const { reportChatError } = createChatErrorReporter((value, options) =>
      messages.push({ value, options })
    );

    reportChatError("Xabar yuborilmadi.");
    reportChatError("Xabar yuborilmadi.");

    expect(messages).toHaveLength(1);
    expect(messages[0].value).toBe("Xabar yuborilmadi.");
    expect(messages[0].options?.duration).toBe(8000);
  });

  it("clearChatError allows the same message to be reported again", () => {
    const messages = [];
    const { reportChatError, clearChatError } = createChatErrorReporter((value) =>
      messages.push(value)
    );

    reportChatError("Xatolik");
    clearChatError();
    reportChatError("Xatolik");

    expect(messages).toEqual(["Xatolik", "Xatolik"]);
  });

  it("ignores empty messages and clears pending state", () => {
    const messages = [];
    const { reportChatError, clearChatError } = createChatErrorReporter((value) =>
      messages.push(value)
    );

    reportChatError("Xatolik");
    clearChatError();
    reportChatError("");

    expect(messages).toEqual(["Xatolik"]);
  });
});
