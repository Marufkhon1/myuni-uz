import { CHAT_REACTIONS } from "../../constants/chatReactions.js";

export default function ChatMessageContextMenu({
  message,
  isMine,
  isReacting,
  onReact,
  onPin,
  onUnpin,
  isPinned,
  onReport,
  onEdit,
  onDelete,
  onClose,
}) {
  return (
    <div
      className="min-w-[12.5rem] overflow-hidden rounded-xl bg-[#2b3344] shadow-2xl ring-1 ring-white/10"
      role="menu"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center gap-0.5 border-b border-white/10 px-2 py-2">
        {CHAT_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            disabled={isReacting}
            onClick={() => {
              onReact(message, emoji);
              onClose();
            }}
            className={`grid h-8 w-8 place-items-center rounded-lg text-lg transition hover:bg-white/10 disabled:opacity-50 ${
              message.my_reaction === emoji ? "bg-white/15" : ""
            }`}
            aria-label={`Reaksiya ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="py-1">
        {isMine && onEdit && (
          <button
            type="button"
            onClick={() => {
              onEdit(message);
              onClose();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-white/90 transition hover:bg-white/5"
          >
            <span aria-hidden>✏️</span>
            Tahrirlash
          </button>
        )}
        {isMine && onDelete && (
          <button
            type="button"
            onClick={() => {
              onDelete(message);
              onClose();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-red-300 transition hover:bg-white/5"
          >
            <span aria-hidden>🗑️</span>
            O&apos;chirish
          </button>
        )}
        {onPin && (
          <button
            type="button"
            onClick={() => {
              if (isPinned) {
                onUnpin?.(message);
              } else {
                onPin(message);
              }
              onClose();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-white/90 transition hover:bg-white/5"
          >
            <span aria-hidden>📌</span>
            {isPinned ? "Biriktirishni olib tashlash" : "Biriktirish (pin)"}
          </button>
        )}
        {onReport && !isMine && (
          <button
            type="button"
            onClick={() => {
              onReport(message);
              onClose();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-amber-200 transition hover:bg-white/5"
          >
            <span aria-hidden>⚠️</span>
            Shikoyat qilish
          </button>
        )}
      </div>
    </div>
  );
}
