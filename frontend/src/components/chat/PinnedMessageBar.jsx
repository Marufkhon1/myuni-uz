import ChatAuthorName from "./ChatAuthorName.jsx";

export default function PinnedMessageBar({ message, formatTime, onUnpin }) {
  if (!message) {
    return null;
  }

  const authorName = message.author || message.sender_name || "Foydalanuvchi";
  const authorId = message.author_id ?? message.sender_id;
  const authorColorKey = message.author_color ?? message.sender_color;

  return (
    <div className="shrink-0 border-b border-amber-200/80 bg-amber-50/90 px-4 py-2.5 dark:border-amber-400/30 dark:bg-amber-950/40 sm:px-6">
      <div className="flex items-start gap-2">
        <span className="text-sm" aria-hidden>
          📌
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-wide text-amber-800 dark:text-amber-200">
            Biriktirilgan xabar
          </p>
          <ChatAuthorName
            as="p"
            name={authorName}
            userId={authorId}
            colorKey={authorColorKey}
            className="text-xs"
          />
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-700 dark:text-slate-200">{message.text}</p>
          <time className="mt-1 block text-[10px] font-semibold text-slate-500">{formatTime(message.created_at)}</time>
        </div>
        {onUnpin && (
          <button
            type="button"
            onClick={() => onUnpin(message)}
            className="shrink-0 rounded-lg px-2 py-1 text-[10px] font-black text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900/50"
          >
            Olib tashlash
          </button>
        )}
      </div>
    </div>
  );
}
