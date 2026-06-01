import UniversityCampusBanner from "../UniversityCampusBanner.jsx";
import UniversityAvatar from "../UniversityAvatar.jsx";
import UniversityMetaLine from "../UniversityMetaLine.jsx";
import UserAvatar from "./UserAvatar.jsx";
import ModalOverlay from "../ui/ModalOverlay.jsx";

export default function GroupInfoModal({
  university,
  isDetailLoading,
  members,
  memberCount,
  hasJoined,
  onJoin,
  onLeave,
  onMemberClick,
  onClose,
}) {
  if (!university) {
    return null;
  }

  const title = university.short_name || university.name || "Universitet";

  return (
    <ModalOverlay
      onClose={onClose}
      labelledBy="group-info-modal-title"
      panelClassName="flex max-h-[min(720px,90dvh)] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-slate-900"
    >
        <UniversityCampusBanner university={university} className="h-36 shrink-0" />

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-b border-slate-200 px-5 pb-5 pt-4 dark:border-white/10">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Guruh</p>
            <div className="mt-3 flex items-start gap-4">
              <UniversityAvatar university={university} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 id="group-info-modal-title" className="text-2xl font-black leading-tight">{title}</h3>
                {university.name && university.name !== title && (
                  <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {university.name}
                  </p>
                )}
                {university.location && (
                  <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {university.location}
                  </p>
                )}
              </div>
            </div>

            {isDetailLoading ? (
              <p className="mt-4 text-sm font-semibold text-slate-500">Ma&apos;lumot yuklanmoqda...</p>
            ) : (
              <UniversityMetaLine university={university} className="mt-4" />
            )}
          </div>

          <div className="px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">A&apos;zolar</p>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {memberCount}
              </span>
            </div>

            {members.length === 0 ? (
              <p className="mt-4 text-center text-sm font-semibold text-slate-500">
                Hali hech kim qo&apos;shilmagan.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 dark:divide-white/10 dark:border-white/10">
                {members.map((member) => {
                  const rowContent = (
                    <>
                      <UserAvatar
                        name={member.display_name}
                        avatarUrl={member.avatar_url}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-black">{member.display_name}</p>
                        <p className="mt-0.5 truncate text-sm text-primary">
                          {member.is_me ? "Siz" : member.role_label}
                        </p>
                        {member.university && (
                          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                            {member.university}
                          </p>
                        )}
                        {member.bio && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                            {member.bio}
                          </p>
                        )}
                        {!member.can_open_profile && !member.is_me && (
                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            Hali chatda xabar yo&apos;q
                          </p>
                        )}
                      </div>
                      {member.can_open_profile && (
                        <span className="shrink-0 text-slate-400">›</span>
                      )}
                    </>
                  );

                  return (
                    <li key={member.id}>
                      {member.can_open_profile ? (
                        <button
                          type="button"
                          onClick={() => onMemberClick(member)}
                          className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-white/5"
                        >
                          {rowContent}
                        </button>
                      ) : (
                        <div className="flex w-full items-center gap-4 px-4 py-3 text-left opacity-90">
                          {rowContent}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3 border-t border-slate-200 p-5 dark:border-white/10">
          {!hasJoined ? (
            <button
              type="button"
              onClick={onJoin}
              className="btn-modal-gradient min-w-[10rem] flex-1"
            >
              Qo&apos;shilish
            </button>
          ) : (
            <button
              type="button"
              onClick={onLeave}
              className="btn-modal-danger-outline min-w-[10rem] flex-1"
            >
              Chiqish
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn-modal-secondary-lg"
          >
            Yopish
          </button>
        </div>
    </ModalOverlay>
  );
}
