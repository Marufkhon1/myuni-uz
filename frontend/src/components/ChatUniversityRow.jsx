import UniversityAvatar from "./UniversityAvatar.jsx";
import UnreadBadge from "./UnreadBadge.jsx";
import ChatListPreviewLine from "./chat/ChatListPreviewLine.jsx";
import { formatUniversityPreview } from "../utils/universityMetaFormat.js";
import { formatChatListTime } from "@/utils/formatChatListTime.js";
import { getChatMessagePlainPreview } from "@/utils/chatReplyFormat.js";

function GroupIcon({ className = "h-3.5 w-3.5 shrink-0 text-slate-400" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
    </svg>
  );
}

export default function ChatUniversityRow({
  university,
  isSelected,
  isJoined,
  onSelect,
  onPrefetch,
  showUnread = true,
  typingUsers = [],
  variant = "list",
}) {
  const unreadCount = showUnread && isJoined ? university.unread_count ?? 0 : 0;
  const hasUnread = unreadCount > 0;
  const messagePreview = university.last_message
    ? `${university.last_message.author}: ${getChatMessagePlainPreview(university.last_message.text)}`
    : formatUniversityPreview(university)?.slice(0, 80) || `${university.member_count ?? 0} a'zo`;
  const isCard = variant === "card";
  const timeLabel = formatChatListTime(university.last_message?.created_at);

  const surfaceClass = isCard
    ? hasUnread
      ? "border-primary/25 bg-gradient-to-br from-blue-50/90 via-white to-white shadow-sm ring-1 ring-primary/15 hover:border-primary/35 hover:shadow-md dark:border-primary/30 dark:from-blue-500/10 dark:via-white/[0.04] dark:to-white/[0.02] dark:ring-primary/20"
      : "border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white to-white shadow-sm hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md dark:border-white/10 dark:from-white/[0.04] dark:via-white/[0.02] dark:to-transparent"
    : isSelected
      ? "border-transparent bg-blue-50 dark:bg-blue-400/10"
      : "border-transparent hover:bg-slate-100 dark:hover:bg-white/5";

  return (
    <button
      type="button"
      onClick={() => onSelect(university.id)}
      onMouseEnter={() => onPrefetch?.(university.id)}
      onFocus={() => onPrefetch?.(university.id)}
      className={`flex w-full items-center text-left transition-all ${
        isCard
          ? `gap-3.5 rounded-2xl border px-3.5 py-3.5 ${surfaceClass}`
          : `gap-2.5 rounded-xl px-2 py-2 ${surfaceClass}`
      }`}
      data-unread={hasUnread ? "true" : "false"}
    >
      <div className={isCard ? "shrink-0 rounded-2xl ring-2 ring-white dark:ring-slate-900" : "shrink-0"}>
        <UniversityAvatar university={university} size={isCard ? "md" : "sm"} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {isCard ? (
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/15 dark:bg-primary/15 dark:ring-primary/25">
                  <GroupIcon className="h-3.5 w-3.5 text-primary dark:text-blue-300" />
                </span>
              ) : (
                <GroupIcon />
              )}
              <span
                className={`min-w-0 flex-1 truncate leading-tight ${
                  isCard
                    ? "font-black text-slate-900 dark:text-white"
                    : hasUnread
                      ? "text-[15px] font-black text-slate-950 dark:text-white"
                      : "text-[15px] font-bold text-slate-800 dark:text-slate-100"
                }`}
              >
                {university.short_name}
              </span>
            </div>
            <ChatListPreviewLine
              typingUsers={isJoined ? typingUsers : []}
              messagePreview={messagePreview}
              className={
                isCard
                  ? "mt-1.5"
                  : hasUnread
                    ? "mt-0.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200"
                    : "mt-0.5 text-[13px]"
              }
            />
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            {timeLabel ? (
              <span
                className={`tabular-nums ${
                  isCard
                    ? "rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400"
                    : hasUnread
                      ? "text-[11px] font-bold text-primary"
                      : "text-[11px] font-bold text-slate-400 dark:text-slate-500"
                }`}
              >
                {timeLabel}
              </span>
            ) : null}
            <UnreadBadge count={unreadCount} size={isCard ? "md" : "sm"} emphasize={!isCard} />
          </div>
        </div>

        {isJoined && isCard ? (
          <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200/70 dark:text-emerald-300 dark:ring-emerald-400/25">
            <span aria-hidden="true">✓</span>
            Qo&apos;shilgansiz
          </span>
        ) : null}
        {isJoined && !isCard ? (
          <span className="mt-0.5 inline text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            Qo&apos;shilgansiz
          </span>
        ) : null}
      </div>
    </button>
  );
}
