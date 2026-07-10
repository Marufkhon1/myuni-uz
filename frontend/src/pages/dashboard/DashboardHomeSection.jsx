import { useMemo } from "react";
import { useDashboard } from "@/hooks/useDashboard.js";
import ChatUniversityRow from "@/components/ChatUniversityRow.jsx";
import UniversityAvatar from "@/components/UniversityAvatar.jsx";
import UniversityRatingStars from "@/components/dashboard/UniversityRatingStars.jsx";
import UserAvatar from "@/components/dashboard/UserAvatar.jsx";
import UnreadBadge from "@/components/UnreadBadge.jsx";
import ApplicantProgressChecklist from "@/components/dashboard/ApplicantProgressChecklist.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import {
  getCompareSuggestion,
  getRecentJoinedChats,
} from "@/utils/applicantChecklist.js";
import {
  getDashboardHomeContent,
  getDashboardHomeQuickActions,
} from "@/utils/dashboardHomeContent.js";
import { resolveMediaUrl } from "@/utils/media.js";

function DashboardHomeHero({
  greeting,
  subtitle,
  totalUnread,
  joinedChatCount,
  reviewCount,
}) {
  return (
    <header className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft ring-1 ring-slate-200/50 dark:border-white/10 dark:bg-[#0b1220] dark:ring-white/5 sm:rounded-[2rem]">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/[0.08] via-blue-50/80 to-violet-50/50 px-4 py-5 dark:from-primary/15 dark:via-[#0b1220] dark:to-violet-500/10 sm:px-8 sm:py-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(37 99 235 / 0.14) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl dark:bg-blue-500/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-12 left-1/4 h-36 w-36 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-500/10"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur-sm dark:border-primary/25 dark:bg-white/10 dark:text-blue-200 sm:px-3 sm:py-1">
              <span aria-hidden="true">✨</span>
              Siz uchun
            </span>
            <h1 className="mt-2.5 text-2xl font-black tracking-tight text-slate-950 sm:mt-4 sm:text-4xl dark:text-white">
              {greeting}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7 dark:text-slate-300">
              {subtitle}
            </p>
          </div>

          <dl className="grid min-w-0 shrink-0 grid-cols-3 gap-1.5 sm:max-w-md sm:gap-2 lg:max-w-md">
            <div className="rounded-xl border border-white/70 bg-white/85 px-2.5 py-2.5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06] sm:rounded-2xl sm:px-3.5 sm:py-3">
              <dt className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400 sm:text-[10px] sm:tracking-[0.14em]">
                Chatlar
              </dt>
              <dd className="mt-0.5 text-lg font-black tabular-nums text-slate-950 sm:mt-1 sm:text-xl dark:text-white">
                {joinedChatCount}
              </dd>
            </div>
            <div className="rounded-xl border border-white/70 bg-white/85 px-2.5 py-2.5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06] sm:rounded-2xl sm:px-3.5 sm:py-3">
              <dt className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400 sm:text-[10px] sm:tracking-[0.14em]">
                Sharhlar
              </dt>
              <dd className="mt-0.5 text-lg font-black tabular-nums text-slate-950 sm:mt-1 sm:text-xl dark:text-white">
                {reviewCount}
              </dd>
            </div>
            <div className="col-span-1 rounded-xl border border-white/70 bg-white/85 px-2 py-2.5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06] sm:rounded-2xl sm:px-3.5 sm:py-3">
              <dt className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400 sm:text-[10px] sm:tracking-[0.14em]">
                Xabarlar
              </dt>
              <dd className="mt-0.5 flex items-center gap-1.5 text-lg font-black tabular-nums text-slate-950 sm:mt-1 sm:gap-2 sm:text-xl dark:text-white">
                {totalUnread > 0 ? <UnreadBadge count={totalUnread} size="sm" /> : null}
                <span>{totalUnread > 0 ? totalUnread : "—"}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {totalUnread > 0 && (
        <div className="flex items-center gap-2.5 border-t border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03] sm:gap-3 sm:px-8 sm:py-3.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm ring-1 ring-primary/15 dark:bg-primary/15 dark:ring-primary/25 sm:h-9 sm:w-9 sm:text-base">
            💬
          </span>
          <p className="min-w-0 text-xs font-bold leading-snug text-slate-700 sm:text-sm dark:text-slate-200">
            O&apos;qilmagan xabarlar bor — chat bo&apos;limidan javob bering.
          </p>
        </div>
      )}
    </header>
  );
}

function WidgetCard({
  eyebrow,
  title,
  actionLabel,
  onAction,
  children,
  className = "",
  icon,
  accent,
}) {
  const accentBar =
    accent === "chat"
      ? "from-primary via-blue-500 to-violet-500"
      : accent === "reviews"
        ? "from-amber-400 via-orange-400 to-rose-400"
        : accent === "compare"
          ? "from-violet-500 via-primary to-blue-500"
          : accent === "actions"
            ? "from-emerald-400 via-primary to-violet-500"
            : null;

  return (
    <section
      className={`relative min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06] sm:rounded-[2rem] sm:p-6 ${
        accentBar ? "p-4 pt-3.5 sm:p-6 sm:pt-5" : "p-4 sm:p-6"
      } ${className}`}
    >
      {accentBar ? (
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentBar}`}
          aria-hidden="true"
        />
      ) : null}

      <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
          {icon ? (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-base ring-1 ring-primary/15 dark:bg-primary/15 dark:ring-primary/25 sm:h-11 sm:w-11 sm:rounded-2xl sm:text-xl">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            {eyebrow && (
              <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-primary sm:tracking-[0.18em]">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-0.5 truncate text-base font-black tracking-tight text-slate-950 sm:mt-1 sm:text-lg dark:text-white">
                {title}
              </h2>
            )}
          </div>
        </div>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="shrink-0 rounded-xl border border-primary/15 bg-primary/5 px-2.5 py-1.5 text-[11px] font-black text-primary transition hover:border-primary/30 hover:bg-primary/10 dark:border-primary/25 dark:bg-primary/10 dark:text-blue-200 dark:hover:bg-primary/15 sm:px-3.5 sm:py-2 sm:text-xs"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <div className="mt-3 min-w-0 sm:mt-4">{children}</div>
    </section>
  );
}

function PrivateThreadPreview({ thread, onOpen }) {
  const timeLabel = thread.last_message?.created_at
    ? new Date(thread.last_message.created_at).toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <button
      type="button"
      onClick={() => onOpen(thread.id)}
      className="flex w-full min-w-0 items-center gap-2.5 rounded-xl border border-violet-200/70 bg-gradient-to-br from-violet-50/70 via-white to-white px-3 py-2.5 text-left shadow-sm transition-all hover:border-violet-300/80 hover:shadow-md dark:border-violet-400/20 dark:from-violet-500/10 dark:via-white/[0.03] dark:to-transparent sm:gap-3.5 sm:rounded-2xl sm:px-3.5 sm:py-3.5"
    >
      <div className="shrink-0 rounded-xl ring-2 ring-white dark:ring-slate-900 sm:rounded-2xl">
        <UserAvatar
          name={thread.other_user_name || "Foydalanuvchi"}
          avatarUrl={resolveMediaUrl(thread.other_user_avatar_url || "")}
          size="sm"
        />
      </div>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="truncate text-sm font-black text-slate-900 dark:text-white">
            {thread.other_user_name}
          </span>
          {timeLabel ? (
            <span className="shrink-0 rounded-lg bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-500 dark:bg-white/10 dark:text-slate-400 sm:px-2 sm:text-[11px]">
              {timeLabel}
            </span>
          ) : null}
        </span>
        <span className="mt-1 flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
            {thread.last_message?.text || "Yangi xabar"}
          </span>
          <UnreadBadge count={thread.unread_count ?? 0} size="sm" />
        </span>
        <span className="mt-1.5 inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-violet-700 ring-1 ring-violet-200/70 dark:text-violet-300 dark:ring-violet-400/25 sm:mt-2 sm:text-[10px]">
          Shaxsiy chat
        </span>
      </span>
    </button>
  );
}

const QUICK_ACTION_STYLES = {
  amber: {
    shell:
      "border-amber-200/70 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/30 hover:border-amber-300/80 hover:shadow-md hover:shadow-amber-500/10 dark:border-amber-400/20 dark:from-amber-500/10 dark:via-white/[0.03] dark:to-orange-500/5",
    icon: "bg-amber-500/10 text-base ring-amber-200/70 dark:bg-amber-400/12 dark:ring-amber-400/25 sm:text-xl",
    arrow: "text-amber-500 group-hover:translate-x-0.5 dark:text-amber-300",
  },
  blue: {
    shell:
      "border-blue-200/70 bg-gradient-to-br from-blue-50/90 via-white to-sky-50/30 hover:border-primary/30 hover:shadow-md hover:shadow-primary/10 dark:border-blue-400/20 dark:from-blue-500/10 dark:via-white/[0.03] dark:to-sky-500/5",
    icon: "bg-primary/10 text-base ring-primary/15 dark:bg-primary/15 dark:ring-primary/25 sm:text-xl",
    arrow: "text-primary group-hover:translate-x-0.5 dark:text-blue-300",
  },
  violet: {
    shell:
      "border-violet-200/70 bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/30 hover:border-violet-300/80 hover:shadow-md hover:shadow-violet-500/10 dark:border-violet-400/20 dark:from-violet-500/10 dark:via-white/[0.03] dark:to-fuchsia-500/5",
    icon: "bg-violet-500/10 text-base ring-violet-200/70 dark:bg-violet-400/12 dark:ring-violet-400/25 sm:text-xl",
    arrow: "text-violet-600 group-hover:translate-x-0.5 dark:text-violet-300",
  },
};

function QuickActionButton({ label, helper, icon, accent = "blue", onClick }) {
  const theme = QUICK_ACTION_STYLES[accent] || QUICK_ACTION_STYLES.blue;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left shadow-sm transition-all hover:-translate-y-0.5 active:scale-[0.99] sm:min-h-[7.5rem] sm:flex-col sm:items-stretch sm:justify-between sm:rounded-2xl sm:px-4 sm:py-4 ${theme.shell}`}
    >
      <span className="flex shrink-0 items-center justify-between gap-2 sm:w-full sm:items-start">
        <span
          className={`grid h-9 w-9 place-items-center rounded-xl ring-1 sm:h-11 sm:w-11 sm:rounded-2xl ${theme.icon}`}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span
          className={`hidden text-lg leading-none transition-transform sm:inline ${theme.arrow}`}
          aria-hidden="true"
        >
          →
        </span>
      </span>
      <span className="min-w-0 flex-1 sm:mt-4">
        <span className="block truncate text-sm font-black leading-snug text-slate-950 sm:text-base dark:text-white">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-[11px] font-semibold leading-snug text-slate-500 sm:mt-1.5 sm:text-xs sm:leading-relaxed dark:text-slate-400">
          {helper}
        </span>
      </span>
      <span
        className={`shrink-0 text-base leading-none transition-transform sm:hidden ${theme.arrow}`}
        aria-hidden="true"
      >
        →
      </span>
    </button>
  );
}

function PopularReviewPreview({ review, onOpen }) {
  const avatarUrl = resolveMediaUrl(review.author_avatar_url || "");
  const universityId = review.university?.id;
  const universityName = review.university?.short_name || review.university?.name || "Universitet";

  return (
    <button
      type="button"
      onClick={() => universityId && onOpen(universityId)}
      disabled={!universityId}
      className="flex w-full min-w-0 items-start gap-2.5 rounded-xl border border-slate-100 px-2.5 py-2.5 text-left transition hover:border-primary/20 hover:bg-blue-50/50 disabled:cursor-default disabled:opacity-70 dark:border-white/10 dark:hover:bg-blue-400/10 sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-3"
    >
      <UserAvatar name={review.author} avatarUrl={avatarUrl} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="truncate font-black text-slate-900 dark:text-white">{universityName}</span>
          <UniversityRatingStars rating={review.rating} />
        </span>
        <span className="mt-1 line-clamp-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
          {review.text}
        </span>
      </span>
    </button>
  );
}

export default function DashboardHomeSection({
  displayName,
  profile,
  universities,
  joinedUniversityIds,
  directThreads,
  popularReviews,
  totalJoinedUnread,
  totalPrivateUnread,
  userUniversity,
  checklistVersion,
  onOpenCompareSuggestion,
  onOpenPrivateThread,
  getUniversityTypingUsers,
}) {
  const { isStudent, changeSection, openUniversityChat, openUniversityReviews } = useDashboard();
  const homeContent = getDashboardHomeContent();
  const quickActions = getDashboardHomeQuickActions(isStudent);

  const recentChats = useMemo(
    () => getRecentJoinedChats(universities, joinedUniversityIds, 3),
    [universities, joinedUniversityIds]
  );

  const unreadPrivateThreads = useMemo(
    () =>
      [...directThreads]
        .filter((thread) => (thread.unread_count ?? 0) > 0)
        .sort((a, b) => (b.unread_count ?? 0) - (a.unread_count ?? 0))
        .slice(0, 2),
    [directThreads]
  );

  const topReviews = useMemo(() => (popularReviews ?? []).slice(0, 3), [popularReviews]);

  const compareSuggestion = useMemo(
    () => getCompareSuggestion(universities, userUniversity),
    [universities, userUniversity]
  );

  const greeting = displayName ? `Salom, ${displayName.split(" ")[0]}!` : "Salom!";

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden sm:space-y-6">
      <DashboardHomeHero
        greeting={greeting}
        subtitle={homeContent.heroSubtitle}
        totalUnread={totalJoinedUnread + totalPrivateUnread}
        joinedChatCount={joinedUniversityIds.size}
        reviewCount={(popularReviews ?? []).length}
      />

      <div className="grid min-w-0 items-start gap-4 sm:gap-6 md:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <WidgetCard
            eyebrow="Chatlar"
            title="Oxirgi suhbatlar"
            actionLabel="Barchasi"
            onAction={() => changeSection("chats")}
            icon="💬"
            accent="chat"
          >
            {recentChats.length > 0 ? (
              <div className="space-y-1.5 sm:space-y-2.5">
                {recentChats.map((university) => (
                  <ChatUniversityRow
                    key={university.id}
                    university={university}
                    isSelected={false}
                    isJoined
                    variant="list"
                    onSelect={openUniversityChat}
                    typingUsers={getUniversityTypingUsers?.(university.id) ?? []}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                variant="chat"
                title="Hali chatga qo'shilmagansiz"
                description="Universitet chatiga qo'shilib, talabalardan savol bering."
                action={{ label: "Chatlarni ko'rish", onClick: () => changeSection("chats") }}
              />
            )}

            {unreadPrivateThreads.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/10 sm:mt-5 sm:pt-5">
                <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300 sm:mb-3">
                  Shaxsiy xabarlar
                </p>
                <div className="space-y-1.5 sm:space-y-2.5">
                  {unreadPrivateThreads.map((thread) => (
                    <PrivateThreadPreview
                      key={thread.id}
                      thread={thread}
                      onOpen={onOpenPrivateThread}
                    />
                  ))}
                </div>
              </div>
            )}
          </WidgetCard>

          <WidgetCard
            eyebrow="Sharhlar"
            title={homeContent.reviewsTitle}
            actionLabel="Ko'proq"
            onAction={() => changeSection(homeContent.reviewsMoreSection)}
            icon="⭐"
            accent="reviews"
          >
            {topReviews.length > 0 ? (
              <div className="space-y-1.5 sm:space-y-2">
                {topReviews.map((review) => (
                  <PopularReviewPreview
                    key={review.id}
                    review={review}
                    onOpen={openUniversityReviews}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                variant="reviews"
                title="Sharhlar hali yo'q"
                description="Talabalar sharh yozganda bu yerda ko'rinadi."
                action={{
                  label: isStudent ? "Sharh yozish" : "Sharhlarni ko'rish",
                  onClick: () => changeSection("reviews"),
                }}
              />
            )}
          </WidgetCard>

          {compareSuggestion && (
            <WidgetCard eyebrow="Taqqoslash" title="Siz uchun taklif" icon="⚖️" accent="compare">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.03] sm:rounded-2xl sm:p-4">
                  {compareSuggestion.universities.map((university, index) => (
                    <span key={university.id} className="inline-flex min-w-0 max-w-full items-center gap-2">
                      {index > 0 && <span className="text-xs font-black text-slate-300">·</span>}
                      <UniversityAvatar university={university} size="sm" />
                      <span className="truncate text-sm font-bold text-slate-800 dark:text-white">
                        {university.short_name}
                      </span>
                    </span>
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-slate-900 dark:text-white">
                    {compareSuggestion.universities.map((u) => u.short_name).join(" · ")}
                  </p>
                  <p className="mt-1 text-xs font-medium leading-snug text-slate-500 sm:text-sm dark:text-slate-400">
                    2–4 ta OTM — reyting, sharhlar va chat faolligini solishtiring.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenCompareSuggestion(compareSuggestion.universities)}
                    className="mt-2.5 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 sm:mt-3 sm:w-auto sm:rounded-2xl dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                  >
                    Taqqoslashni boshlash
                  </button>
                </div>
              </div>
            </WidgetCard>
          )}

          <WidgetCard
            eyebrow={homeContent.quickActionsEyebrow}
            title={homeContent.quickActionsTitle}
            icon="⚡"
            accent="actions"
          >
            <div className="grid min-w-0 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
              {quickActions.map((action) => (
                <QuickActionButton
                  key={action.id}
                  label={action.label}
                  helper={action.helper}
                  icon={action.icon}
                  accent={action.accent}
                  onClick={() => changeSection(action.section)}
                />
              ))}
            </div>
          </WidgetCard>
        </div>

        <ApplicantProgressChecklist
          key={`${checklistVersion}-${isStudent ? "student" : "applicant"}`}
          profile={profile}
          joinedChatCount={joinedUniversityIds.size}
          universities={universities}
        />
      </div>
    </div>
  );
}
