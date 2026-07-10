const REPLY_START = "⟦myuni-reply⟧";
const REPLY_END = "⟦/myuni-reply⟧";

function truncate(value, max) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function normalizeReplySource(message) {
  if (!message) {
    return null;
  }
  const author =
    message.author ||
    message.sender_name ||
    message.other_user_name ||
    "Foydalanuvchi";
  const { body } = parseReplyPayload(message.text || "");
  return {
    id: message.id ?? null,
    author: truncate(author, 80),
    text: truncate(body || message.text || "", 160),
  };
}

export function buildReplyPayload(replySource, body) {
  const source = normalizeReplySource(replySource) || replySource;
  const meta = JSON.stringify({
    id: source?.id ?? null,
    author: truncate(source?.author || "Foydalanuvchi", 80),
    text: truncate(source?.text || "", 160),
  });
  const trimmedBody = String(body || "").trim();
  return `${REPLY_START}${meta}${REPLY_END}\n${trimmedBody}`;
}

export function parseReplyPayload(raw) {
  const text = String(raw ?? "");
  if (!text.startsWith(REPLY_START)) {
    return { reply: null, body: text };
  }
  const end = text.indexOf(REPLY_END);
  if (end < 0) {
    return { reply: null, body: text };
  }
  try {
    const reply = JSON.parse(text.slice(REPLY_START.length, end));
    const body = text.slice(end + REPLY_END.length).replace(/^\n/, "");
    return {
      reply: {
        id: reply?.id ?? null,
        author: String(reply?.author || "Foydalanuvchi"),
        text: String(reply?.text || ""),
      },
      body,
    };
  } catch {
    return { reply: null, body: text };
  }
}

export function getChatMessagePlainPreview(raw, max = 120) {
  const { body } = parseReplyPayload(raw);
  return truncate(body || raw || "", max);
}
