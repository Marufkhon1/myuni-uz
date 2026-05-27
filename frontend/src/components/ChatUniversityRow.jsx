import UniversityAvatar from "./UniversityAvatar.jsx";
import UnreadBadge from "./UnreadBadge.jsx";
import { formatUniversityPreview } from "./UniversityMetaLine.jsx";

function GroupIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-400" fill="currentColor" aria-hidden="true">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
    </svg>
  );
}

function formatListTime(value) {
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatUniversityRow({ university, isSelected, isJoined, onSelect, showUnread = true }) {
  const unreadCount = showUnread && isJoined ? university.unread_count ?? 0 : 0;
  const preview = university.last_message
    ? `${university.last_message.author}: ${university.last_message.text}`
    : formatUniversityPreview(university)?.slice(0, 80) || `${university.member_count ?? 0} a'zo`;

  return (
    <button
      type="button"
      onClick={() => onSelect(university.id)}
      className={`flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-3 text-left transition-colors ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-400/10"
          : "hover:bg-slate-100 dark:hover:bg-white/5"
      }`}
    >
      <UniversityAvatar university={university} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <GroupIcon />
          <span className="min-w-0 flex-1 truncate font-bold text-slate-900 dark:text-white">
            {university.short_name}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <UnreadBadge count={unreadCount} />
            {university.last_message?.created_at && (
              <span className="text-xs font-semibold text-slate-400">
                {formatListTime(university.last_message.created_at)}
              </span>
            )}
          </div>
        </div>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
          {preview}
        </p>
        {isJoined && (
          <span className="mt-1 inline-block text-xs font-bold text-emerald-600">Qo'shilgansiz</span>
        )}
      </div>
    </button>
  );
}
