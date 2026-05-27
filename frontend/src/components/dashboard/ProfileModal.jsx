import UserAvatar from "./UserAvatar.jsx";

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
          <p className="font-black">Yuklanmoqda...</p>
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
            {profileUser.study_program && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{profileUser.study_program}</p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              {profileUser.id !== currentUserId && !hidePrivateMessage && (
                <button
                  type="button"
                  onClick={onPrivateMessage}
                  className="min-w-[10rem] flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950"
                >
                  Shaxsiy xabar
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className={`rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black dark:border-white/15 ${
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
