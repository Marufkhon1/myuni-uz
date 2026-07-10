export default function ChatReplyQuote({ author, text, tone = "other" }) {
  if (!author && !text) {
    return null;
  }

  const isMine = tone === "mine";

  return (
    <div
      className={`mb-2 rounded-xl border-l-[3px] px-2.5 py-1.5 ${
        isMine
          ? "border-white/80 bg-white/15"
          : "border-primary bg-primary/10 dark:bg-primary/15"
      }`}
      data-testid="chat-reply-quote"
    >
      <p
        className={`truncate text-[11px] font-black ${
          isMine ? "text-white" : "text-primary"
        }`}
      >
        {author || "Foydalanuvchi"}
      </p>
      {text ? (
        <p
          className={`mt-0.5 line-clamp-2 text-xs font-semibold leading-snug ${
            isMine ? "text-white/85" : "text-slate-600 dark:text-slate-300"
          }`}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}
