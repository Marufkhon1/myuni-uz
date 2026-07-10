import { describe, expect, it } from "vitest";
import {
  buildReplyPayload,
  getChatMessagePlainPreview,
  normalizeReplySource,
  parseReplyPayload,
} from "./chatReplyFormat.js";

describe("chatReplyFormat", () => {
  it("round-trips reply metadata and body", () => {
    const encoded = buildReplyPayload(
      { id: 7, author: "Ali", text: "Salom, kontrakt qancha?" },
      "Taxminan 20 mln"
    );
    const parsed = parseReplyPayload(encoded);
    expect(parsed.reply).toEqual({
      id: 7,
      author: "Ali",
      text: "Salom, kontrakt qancha?",
    });
    expect(parsed.body).toBe("Taxminan 20 mln");
  });

  it("returns plain body for normal messages", () => {
    expect(parseReplyPayload("Oddiy xabar")).toEqual({
      reply: null,
      body: "Oddiy xabar",
    });
  });

  it("strips nested reply markers when quoting", () => {
    const nested = buildReplyPayload({ author: "A", text: "old" }, "middle");
    const source = normalizeReplySource({ id: 1, author: "B", text: nested });
    expect(source.text).toBe("middle");
  });

  it("builds list preview from body only", () => {
    const encoded = buildReplyPayload({ author: "Ali", text: "quote" }, "Javob matni");
    expect(getChatMessagePlainPreview(encoded)).toBe("Javob matni");
  });
});
