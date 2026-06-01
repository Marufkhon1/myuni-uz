import UserAvatar from "./UserAvatar.jsx";
import Skeleton from "../ui/Skeleton.jsx";

export default function ProfileModal({
  profileUser,
  isProfileLoading,
  currentUserId,
  hidePrivateMessage,
  onPrivateMessage,
  onClose,
}) {
  if (!profileUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm xl:col-span-2">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-slate-900">
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
            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Profil</p>
            <div className="mt-4 flex items-center gap-4">
              <UserAvatar
                name={profileUser.display_name}
                avatarUrl={profileUser.avatar_url}
                size="lg"
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
              {profileUser.id !== currentUserId && !hidePrivateMessage && (
                <button
                  type="button"
                  onClick={onPrivateMessage}
                  className="btn-modal-dark min-w-[10rem] flex-1"
                >
                  Shaxsiy xabar
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className={`btn-modal-secondary-lg ${
                  profileUser.id === currentUserId || hidePrivateMessage ? "w-full" : ""
                }`}
              >
                Yopish
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
