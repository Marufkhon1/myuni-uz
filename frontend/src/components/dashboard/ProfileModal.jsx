import Skeleton from "../ui/Skeleton.jsx";
import ModalOverlay from "../ui/ModalOverlay.jsx";
import UserAvatarWithPresence from "./UserAvatarWithPresence.jsx";

export default function ProfileModal({
  profileUser,
  isProfileLoading,
  currentUserId,
  hidePrivateMessage,
  isBlockedByMe = false,
  hasBlockRelationship = false,
  isBlockSubmitting = false,
  onPrivateMessage,
  onBlock,
  onUnblock,
  onClose,
}) {
  if (!profileUser) {
    return null;
  }

  const blockActive =
    hasBlockRelationship ||
    profileUser.has_block_relationship ||
    isBlockedByMe ||
    profileUser.blocked_by_me;
  const blockedByMe = isBlockedByMe || profileUser.blocked_by_me;
  const isOwnProfile = profileUser.id === currentUserId;

  return (
    <ModalOverlay
      onClose={onClose}
      labelledBy="profile-modal-title"
      panelClassName="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-slate-900 xl:col-span-2"
    >
      <h2
        id="profile-modal-title"
        className={`text-sm font-black uppercase tracking-[0.18em] text-primary ${
          isProfileLoading ? "sr-only" : ""
        }`}
      >
        Profil
      </h2>
      {isProfileLoading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Profil yuklanmoqda">
          <Skeleton className="h-4 w-16" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-11 w-full rounded-2xl" />
        </div>
        ) : (
          <>
            <div className="mt-4 flex items-center gap-4">
            <UserAvatarWithPresence
              name={profileUser.display_name}
              avatarUrl={profileUser.avatar_url}
              size="lg"
              colorKey={profileUser.chat_color}
              userId={profileUser.id}
              isOnline={isOwnProfile ? true : profileUser.is_online}
              lastSeenAt={profileUser.last_seen_at}
              showPresence
            />
            <div className="min-w-0">
              <h3 className="text-2xl font-black">{profileUser.display_name}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {profileUser.role_label}
              </p>
            </div>
          </div>
          <p className="mt-4 font-bold">{profileUser.university || "Universitet ko'rsatilmagan"}</p>
          {profileUser.bio && (
            <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200">
              {profileUser.bio}
            </p>
          )}
          {profileUser.study_program && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{profileUser.study_program}</p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            {profileUser.id !== currentUserId && !hidePrivateMessage && !blockActive && (
              <button
                type="button"
                onClick={onPrivateMessage}
                className="btn-modal-dark min-w-[10rem] flex-1"
              >
                Shaxsiy xabar
              </button>
            )}
            {profileUser.id !== currentUserId && !blockActive && (
              <button
                type="button"
                onClick={onBlock}
                disabled={isBlockSubmitting}
                className="btn-modal-danger-outline min-w-[10rem] flex-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBlockSubmitting ? "Kutilmoqda..." : "Blok qilish"}
              </button>
            )}
            {profileUser.id !== currentUserId && blockActive && blockedByMe && (
              <button
                type="button"
                onClick={onUnblock}
                disabled={isBlockSubmitting}
                className="btn-modal-outline min-w-[10rem] flex-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBlockSubmitting ? "Kutilmoqda..." : "Blokni ochish"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`btn-modal-secondary-lg ${
                profileUser.id === currentUserId ? "w-full" : "min-w-[10rem] flex-1"
              }`}
            >
              Yopish
            </button>
          </div>
        </>
      )}
    </ModalOverlay>
  );
}
