import UserAvatar from "./UserAvatar.jsx";
import { resolveMediaUrl } from "../../utils/media.js";

export default function ReviewCard({ item, showUniversity = false, onLike, elevated = false }) {
  const dateLabel = new Date(item.created_at).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <article
      className={`rounded-2xl border p-4 sm:p-5 ${
        elevated
          ? "border-slate-200/90 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.06]"
          : "border-slate-200/80 bg-slate-50 dark:border-white/10 dark:bg-white/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <UserAvatar
          name={item.author}
          avatarUrl={resolveMediaUrl(item.author_avatar_url || "")}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="font-black text-slate-950 dark:text-white">{item.author}</h3>
            <span className="shrink-0 text-sm text-amber-400">
              {"★".repeat(item.rating)}
              <span className="ml-1 text-xs font-black text-slate-500 dark:text-slate-400">
                {item.rating}/5
              </span>
            </span>
          </div>
          {showUniversity && item.university?.name && (
            <p className="mt-1 text-sm font-bold text-primary">{item.university.name}</p>
          )}
          <p className="mt-1 text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
            {dateLabel}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">{item.text}</p>
          <button
            type="button"
            onClick={() => onLike(item.id)}
            className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-black transition ${
              item.liked_by_me
                ? "border-primary/30 bg-blue-50 text-primary dark:bg-blue-400/10"
                : "border-slate-200 bg-white text-slate-600 hover:border-primary/30 dark:border-white/10 dark:bg-transparent dark:text-slate-300"
            }`}
          >
            <span aria-hidden="true">{item.liked_by_me ? "♥" : "♡"}</span>
            Yoqdi ({item.like_count ?? 0})
          </button>
        </div>
      </div>
    </article>
  );
}
