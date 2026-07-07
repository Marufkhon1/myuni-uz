import AnimatedTypingDots from "../chat/AnimatedTypingDots.jsx";
import UnreadBadge from "../UnreadBadge.jsx";
import UserAvatarWithPresence from "./UserAvatarWithPresence.jsx";

export default function PrivateThreadRow({
  thread,
  isSelected,
  isTyping,
  onSelect,
}) {
  const previewText = thread.is_draft
    ? "Yangi suhbat — xabar yozing"
    : thread.last_message?.text || "";

  return (
    <button
      type="button"
      onClick={() => onSelect(thread.id)}
      className={`flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-3 text-left transition-colors ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-400/10"
          : "hover:bg-slate-100 dark:hover:bg-white/5"
      }`}
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
        <p className="truncate font-bold">{thread.other_user_name}</p>
        {isTyping ? (
          <p className="mt-0.5 flex items-center truncate text-sm font-medium text-primary">
            Yozmoqda
            <AnimatedTypingDots className="text-primary/85" />
          </p>
        ) : (
          <p className="mt-0.5 truncate text-sm text-slate-500">{previewText}</p>
        )}
      </div>
      <span className="grid h-6 min-w-6 shrink-0 place-items-center">
        {!thread.is_draft && <UnreadBadge count={thread.unread_count ?? 0} />}
      </span>
    </button>
  );
}
