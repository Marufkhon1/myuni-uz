import { useMemo } from "react";
import ChatUniversityRow from "../../components/ChatUniversityRow.jsx";
import UniversityAvatar from "../../components/UniversityAvatar.jsx";
import UniversityRatingStars from "../../components/dashboard/UniversityRatingStars.jsx";
import UserAvatar from "../../components/dashboard/UserAvatar.jsx";
import UnreadBadge from "../../components/UnreadBadge.jsx";
import ApplicantProgressChecklist from "../../components/dashboard/ApplicantProgressChecklist.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import {
  getCompareSuggestion,
  getRecentJoinedChats,
} from "../../utils/applicantChecklist.js";
import {
  getDashboardHomeContent,
  getDashboardHomeQuickActions,
} from "../../utils/dashboardHomeContent.js";
import { resolveMediaUrl } from "../../utils/media.js";

function WidgetCard({ eyebrow, title, actionLabel, onAction, children, className = "" }) {
  return (
    <section
      className={`rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.06] sm:p-6 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow && (
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          )}
          {title && <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">{title}</h2>}
        </div>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="shrink-0 rounded-xl px-3 py-2 text-xs font-black text-primary transition hover:bg-blue-50 dark:text-blue-200 dark:hover:bg-blue-400/10"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function QuickActionButton({ label, helper, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[5.5rem] flex-col justify-center rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-left transition hover:border-primary/30 hover:bg-blue-50/60 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-blue-400/10"
    >
      <span className="font-black text-slate-900 dark:text-white">{label}</span>
      <span className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{helper}</span>
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
      className="flex w-full items-start gap-3 rounded-2xl border border-slate-100 px-3 py-3 text-left transition hover:border-primary/20 hover:bg-blue-50/50 disabled:cursor-default disabled:opacity-70 dark:border-white/10 dark:hover:bg-blue-400/10"
    >
      <UserAvatar name={review.author} avatarUrl={avatarUrl} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate font-black text-slate-900 dark:text-white">{universityName}</span>
          <UniversityRatingStars rating={review.rating} />
        </span>
        <span className="mt-1 line-clamp-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          {review.text}
        </span>
      </span>
    </button>
  );
}

export default function DashboardHomeSection({
  displayName,
  isStudent,
  profile,
  universities,
  joinedUniversityIds,
  directThreads,
  popularReviews,
  totalJoinedUnread,
  totalPrivateUnread,
  userUniversity,
  checklistVersion,
  onOpenSection,
  onOpenUniversityChat,
  onOpenUniversityReviews,
  onOpenComparePair,
  onOpenPrivateThread,
}) {
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
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-blue-50/40 to-white p-6 shadow-soft dark:border-white/10 dark:from-white/[0.06] dark:via-blue-400/5 dark:to-white/[0.04] sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Siz uchun</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl dark:text-white">{greeting}</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600 sm:text-base dark:text-slate-300">
          {homeContent.heroSubtitle}
        </p>
        {(totalJoinedUnread > 0 || totalPrivateUnread > 0) && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200/80 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10">
            <UnreadBadge count={totalJoinedUnread + totalPrivateUnread} />
            <span>O&apos;qilmagan xabarlar bor</span>
          </p>
        )}
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="space-y-6">
          <WidgetCard
            eyebrow="Chatlar"
            title="Oxirgi suhbatlar"
            actionLabel="Barchasi"
            onAction={() => onOpenSection("chats")}
          >
            {recentChats.length > 0 ? (
              <div className="space-y-1">
                {recentChats.map((university) => (
                  <ChatUniversityRow
                    key={university.id}
                    university={university}
                    isSelected={false}
                    isJoined
                    onSelect={onOpenUniversityChat}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                variant="chat"
                title="Hali chatga qo'shilmagansiz"
                description="Universitet chatiga qo'shilib, talabalardan savol bering."
                action={{ label: "Chatlarni ko'rish", onClick: () => onOpenSection("chats") }}
              />
            )}

            {unreadPrivateThreads.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/10">
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">
                  Shaxsiy xabarlar
                </p>
                <div className="space-y-2">
                  {unreadPrivateThreads.map((thread) => (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => onOpenPrivateThread(thread.id)}
                      className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <UserAvatar
                        name={thread.other_user_name || "Foydalanuvchi"}
                        avatarUrl={resolveMediaUrl(thread.other_user_avatar_url || "")}
                        size="sm"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-bold text-slate-900 dark:text-white">
                            {thread.other_user_name}
                          </span>
                          <UnreadBadge count={thread.unread_count ?? 0} />
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-slate-500 dark:text-slate-400">
                          {thread.last_message?.text || "Yangi xabar"}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </WidgetCard>

          <WidgetCard
            eyebrow="Sharhlar"
            title={homeContent.reviewsTitle}
            actionLabel="Ko'proq"
            onAction={() => onOpenSection(homeContent.reviewsMoreSection)}
          >
            {topReviews.length > 0 ? (
              <div className="space-y-2">
                {topReviews.map((review) => (
                  <PopularReviewPreview
                    key={review.id}
                    review={review}
                    onOpen={onOpenUniversityReviews}
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
                  onClick: () => onOpenSection("reviews"),
                }}
              />
            )}
          </WidgetCard>

          {compareSuggestion && (
            <WidgetCard eyebrow="Taqqoslash" title="Siz uchun taklif">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <UniversityAvatar university={compareSuggestion.anchor} size="md" />
                  <span className="text-sm font-black text-slate-400">vs</span>
                  <UniversityAvatar university={compareSuggestion.other} size="md" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-slate-900 dark:text-white">
                    {compareSuggestion.anchor.short_name} va {compareSuggestion.other.short_name}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Reyting, sharhlar va chat faolligini yonma-yon solishtiring.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenComparePair(compareSuggestion.anchor, compareSuggestion.other)
                    }
                    className="mt-3 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
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
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {quickActions.map((action) => (
                <QuickActionButton
                  key={action.id}
                  label={action.label}
                  helper={action.helper}
                  onClick={() => onOpenSection(action.section)}
                />
              ))}
            </div>
          </WidgetCard>
        </div>

        <ApplicantProgressChecklist
          key={`${checklistVersion}-${isStudent ? "student" : "applicant"}`}
          isStudent={isStudent}
          profile={profile}
          joinedChatCount={joinedUniversityIds.size}
          universities={universities}
          onOpenSection={onOpenSection}
        />
      </div>
    </div>
  );
}
