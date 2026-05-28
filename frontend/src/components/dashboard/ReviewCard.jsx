import UserAvatar from "./UserAvatar.jsx";
import { resolveMediaUrl } from "../../utils/media.js";

const STATUS_LABELS = {
  pending: "Ko'rib chiqilmoqda",
  rejected: "Rad etilgan",
};

function ReviewStatusBadge({ status }) {
  if (!status || status === "approved") {
    return null;
  }
  const isPending = status === "pending";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
        isPending
          ? "bg-amber-100 text-amber-800 dark:bg-amber-400/20 dark:text-amber-200"
          : "bg-red-100 text-red-800 dark:bg-red-400/20 dark:text-red-300"
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function ReviewCard({
  item,
  showUniversity = false,
  onLike,
  onDelete,
  elevated = false,
  likeLabel = "Yoqdi",
  showMineBadge = false,
  showStudentVoiceBadge = false,
  hideLike = false,
}) {
  const isStudentAuthor = item.author_role === "student";
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
            <h3 className="flex flex-wrap items-center gap-2 font-black text-slate-950 dark:text-white">
              <span>{item.author}</span>
              {showStudentVoiceBadge && isStudentAuthor && (
                <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase text-primary dark:bg-blue-400/20 dark:text-blue-200">
                  Talaba tajribasi
                </span>
              )}
              {showMineBadge && item.is_mine && (
                <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300">
                  Sizning sharhingiz
                </span>
              )}
              <ReviewStatusBadge status={item.status} />
            </h3>
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
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!hideLike && (
              <button
                type="button"
                onClick={() => onLike(item.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-black transition ${
                  item.liked_by_me
                    ? "border-primary/30 bg-blue-50 text-primary dark:bg-blue-400/10"
                    : "border-slate-200 bg-white text-slate-600 hover:border-primary/30 dark:border-white/10 dark:bg-transparent dark:text-slate-300"
                }`}
              >
                <span aria-hidden="true">{item.liked_by_me ? "♥" : "♡"}</span>
                {likeLabel} ({item.like_count ?? 0})
              </button>
            )}
            {item.is_mine && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-black text-red-700 transition hover:border-red-300 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-300"
              >
                O&apos;chirish
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
