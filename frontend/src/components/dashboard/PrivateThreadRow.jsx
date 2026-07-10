import AnimatedTypingDots from "../chat/AnimatedTypingDots.jsx";
import UnreadBadge from "../UnreadBadge.jsx";
import UserAvatarWithPresence from "./UserAvatarWithPresence.jsx";
import { formatChatListTime } from "@/utils/formatChatListTime.js";
import { getChatMessagePlainPreview } from "@/utils/chatReplyFormat.js";

export default function PrivateThreadRow({
  thread,
  isSelected,
  isTyping,
  onSelect,
}) {
  const unreadCount = thread.is_draft ? 0 : thread.unread_count ?? 0;
  const hasUnread = unreadCount > 0;
  const previewText = thread.is_draft
    ? "Yangi suhbat — xabar yozing"
    : getChatMessagePlainPreview(thread.last_message?.text || "");
  const timeLabel = formatChatListTime(thread.last_message?.created_at);

  return (
    <button
      type="button"
      onClick={() => onSelect(thread.id)}
      className={`flex w-full items-center gap-2.5 rounded-xl border border-transparent px-2 py-2 text-left transition-colors ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-400/10"
          : "hover:bg-slate-100 dark:hover:bg-white/5"
      }`}
      data-unread={hasUnread ? "true" : "false"}
    >
      <UserAvatarWithPresence
        name={thread.other_user_name}
        avatarUrl={thread.other_user_avatar_url}
        size="sm"
        colorKey={thread.other_user_chat_color}
        userId={thread.other_user_id}
        isOnline={thread.other_user_is_online}
        lastSeenAt={thread.other_user_last_seen_at}
        showPresence
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`min-w-0 flex-1 truncate text-[15px] leading-tight ${
              hasUnread ? "font-black text-slate-950 dark:text-white" : "font-bold text-slate-800 dark:text-slate-100"
            }`}
          >
            {thread.other_user_name}
          </p>
          {timeLabel ? (
            <span
              className={`shrink-0 text-[11px] font-bold tabular-nums ${
                hasUnread ? "text-primary" : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {timeLabel}
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          {isTyping ? (
            <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-primary">
              Yozmoqda
              <AnimatedTypingDots className="text-primary/85" />
            </p>
          ) : (
            <p
              className={`min-w-0 flex-1 truncate text-[13px] leading-snug ${
                hasUnread
                  ? "font-semibold text-slate-700 dark:text-slate-200"
                  : "font-medium text-slate-500 dark:text-slate-400"
              }`}
            >
              {previewText}
            </p>
          )}
          <span className="grid h-5 min-w-5 shrink-0 place-items-center">
            <UnreadBadge count={unreadCount} size="sm" emphasize />
          </span>
        </div>
      </div>
    </button>
  );
}
