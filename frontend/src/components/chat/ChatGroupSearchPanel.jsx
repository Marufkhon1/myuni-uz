import UniversityAvatar from "../UniversityAvatar.jsx";
import UserAvatar from "../dashboard/UserAvatar.jsx";
import ChatAuthorName from "./ChatAuthorName.jsx";
import SearchMatchSnippet from "./SearchMatchSnippet.jsx";
import { formatMessageSearchDate, formatMessageSearchTime } from "@/utils/formatMessageDate.js";

export default function ChatGroupSearchPanel({
  query,
  onQueryChange,
  onClose,
  university,
  thread,
  results,
  onSelectMessage,
  isPhone = false,
  className = "",
}) {
  const trimmedQuery = query.trim();
  const contextTitle = thread
    ? thread.other_user_name || "Shaxsiy chat"
    : university?.short_name || university?.name || "Guruh";

  return (
    <aside
      className={`flex min-h-0 flex-col border-slate-200 bg-white dark:border-white/10 dark:bg-[#17212b] ${
        isPhone ? "min-h-0 flex-1 border-0" : "w-full max-w-[360px] shrink-0 border-l"
      } ${className}`}
      aria-label="Xabarlarni qidirish"
    >
      <div className="shrink-0 border-b border-slate-200 px-3 py-3 dark:border-white/10">
        {isPhone && (
          <button
            type="button"
            onClick={onClose}
            className="mb-3 flex items-center gap-2 text-sm font-black text-primary"
          >
            ← Chat
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Qidirish"
              autoFocus
              className="w-full rounded-xl border-0 bg-slate-100 py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none ring-0 focus:bg-slate-200 dark:bg-[#242f3d] dark:text-white dark:focus:bg-[#2b3949]"
            />
          </div>
          {!isPhone && (
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
              aria-label="Qidiruvni yopish"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Xabarlarni qidirish</p>
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-slate-50 px-2 py-2 dark:bg-[#242f3d]">
          {thread ? (
            <UserAvatar
              name={thread.other_user_name}
              avatarUrl={thread.other_user_avatar_url}
              size="xs"
              colorKey={thread.other_user_chat_color}
              userId={thread.other_user_id}
            />
          ) : (
            university && <UniversityAvatar university={university} size="xs" />
          )}
          <span className="min-w-0 flex-1 truncate text-sm font-black text-slate-800 dark:text-white">
            {contextTitle}
          </span>
        </div>
      </div>

      <div className="chat-messages-scroll min-h-0 flex-1 overflow-y-auto">
        {!trimmedQuery ? (
          <div className="grid h-full min-h-[16rem] place-items-center px-6 py-12 text-center">
            <div className="text-6xl opacity-40" aria-hidden="true">
              🔍
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Xabarlarni qidirish
            </p>
          </div>
        ) : results.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
            Hech narsa topilmadi
          </p>
        ) : (
          <>
            <p className="border-b border-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-500 dark:border-white/5 dark:text-slate-400">
              {results.length} ta xabar topildi
            </p>
            <ul className="divide-y divide-slate-100 dark:divide-white/5">
              {results.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectMessage(item.id)}
                    className="flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-[#202b36]"
                  >
                    <UserAvatar
                      name={item.author || item.sender_name}
                      avatarUrl={item.author_avatar_url || item.sender_avatar_url}
                      size="sm"
                      colorKey={item.author_color ?? item.sender_color}
                      userId={item.author_id ?? item.sender_id}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <ChatAuthorName
                          name={item.author || item.sender_name || "Foydalanuvchi"}
                          userId={item.author_id ?? item.sender_id}
                          colorKey={item.author_color ?? item.sender_color}
                          className="truncate text-sm font-black"
                        />
                        <time
                          dateTime={item.created_at}
                          className="shrink-0 text-right text-xs font-semibold leading-tight text-slate-400 dark:text-slate-500"
                        >
                          <span className="block">{formatMessageSearchDate(item.created_at)}</span>
                          <span className="block text-[10px] opacity-80">
                            {formatMessageSearchTime(item.created_at)}
                          </span>
                        </time>
                      </div>
                      <SearchMatchSnippet text={item.text} query={trimmedQuery || query} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}
