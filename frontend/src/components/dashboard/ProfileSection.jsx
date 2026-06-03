import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteAvatar, updateProfileSettings, uploadAvatar } from "../../services/authService.js";
import { useToast } from "../../hooks/useToast.js";
import { resolveMediaUrl } from "../../utils/media.js";
import UniversitySearchSelect from "./UniversitySearchSelect.jsx";
import { matchUniversityByText } from "../../utils/universityMatch.js";
import ChatColorPicker from "./ChatColorPicker.jsx";
import { getProfileContent, getProfileDigitalIdNarrative } from "../../utils/profileRoleContent.js";

const BIO_MIN_LENGTH = 3;
const BIO_MAX_LENGTH = 70;

const sectionLabelClass = "text-[10px] font-black uppercase tracking-[0.16em] text-primary";
const hintTextClass = "text-xs leading-relaxed text-slate-500 dark:text-slate-400";
const metaTextClass = "text-[11px] font-semibold text-slate-500 dark:text-slate-400";

const profileFieldInputClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-400/25";

function SettingsGroup({ title, children }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
      {title && (
        <div className="border-b border-slate-100 px-4 py-2.5 dark:border-white/10 sm:px-5">
          <p className={sectionLabelClass}>{title}</p>
        </div>
      )}
      <div className="divide-y divide-slate-100 dark:divide-white/10">{children}</div>
    </div>
  );
}

function SettingsRow({ label, hint, value, onClick, disabled = false, active = false, trailing }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left sm:px-5 ${
        onClick && !disabled ? "transition hover:bg-slate-50 dark:hover:bg-white/[0.04]" : ""
      } ${disabled ? "opacity-60" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-black ${active ? "text-primary" : "text-slate-900 dark:text-white"}`}>
          {label}
        </p>
        {hint && <p className={`mt-0.5 break-all ${hintTextClass}`}>{hint}</p>}
      </div>
      {value && (
        <span className="max-w-[42%] truncate text-right text-xs font-bold text-slate-600 dark:text-slate-300">
          {value}
        </span>
      )}
      {trailing}
      {onClick && !trailing && (
        <span className="shrink-0 text-lg text-slate-300 dark:text-slate-600" aria-hidden="true">
          ›
        </span>
      )}
    </Tag>
  );
}

function ProfileHeaderStat({ value, label }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="truncate text-lg font-black tabular-nums text-slate-950 dark:text-white">{value}</p>
      <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

export default function ProfileSection({
  user,
  profile,
  displayName,
  userUniversity,
  universities,
  isStudent,
  savedAvatarUrl,
  refreshUser,
  joinedChatCount = 0,
}) {
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isAvatarDeleting, setIsAvatarDeleting] = useState(false);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [isColorSaving, setIsColorSaving] = useState(false);
  const [isBioSaving, setIsBioSaving] = useState(false);

  const displayAvatarUrl = resolveMediaUrl(avatarPreview || savedAvatarUrl);
  const hasAvatar = Boolean(displayAvatarUrl);

  const profileContent = getProfileContent(isStudent);
  const roleLabel = profileContent.roleLabel;
  const avatarVisibility = profile?.avatar_visibility || "everyone";
  const universityLabel = profileContent.universityLabel;
  const hasUniversity = Boolean((userUniversity || profile?.university || "").trim());

  const matchedUniversity = useMemo(
    () => matchUniversityByText(universities, userUniversity || profile?.university),
    [universities, userUniversity, profile?.university]
  );

  const universityShort =
    matchedUniversity?.short_name || userUniversity || profile?.university || "Tanlanmagan";
  const universityFull = matchedUniversity?.name || userUniversity || profile?.university || "";
  const universityLocation = matchedUniversity?.location || "";
  const savedBio = profile?.bio || "";

  const profileChecks = [
    { label: profileContent.profileCheckLabels.name, done: Boolean((profile?.full_name || "").trim()) },
    { label: profileContent.profileCheckLabels.university, done: hasUniversity },
    { label: profileContent.profileCheckLabels.avatar, done: hasAvatar },
  ];

  const completedChecks = profileChecks.filter((item) => item.done).length;
  const profileProgress = Math.round((completedChecks / profileChecks.length) * 100);
  const isProfileComplete = profileProgress === 100;
  const showAvatarPublicly = avatarVisibility !== "private_only";

  const avatarOptions = profileContent.avatarOptions;

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Faqat rasm faylini yuklang.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Rasm hajmi 5 MB dan oshmasligi kerak.");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setAvatarError("");
    setIsAvatarUploading(true);
    try {
      await uploadAvatar(file);
      await refreshUser();
      setAvatarPreview("");
      URL.revokeObjectURL(previewUrl);
    } catch {
      setAvatarError("Rasmni yuklab bo'lmadi.");
      setAvatarPreview("");
      URL.revokeObjectURL(previewUrl);
    } finally {
      setIsAvatarUploading(false);
    }
  }

  async function handleAvatarDelete() {
    setAvatarError("");
    setIsAvatarDeleting(true);
    try {
      await deleteAvatar();
      await refreshUser();
      setAvatarPreview("");
    } catch {
      setAvatarError("Rasmni o'chirib bo'lmadi.");
    } finally {
      setIsAvatarDeleting(false);
    }
  }

  async function handleChatColorChange(colorId) {
    setAvatarError("");
    setIsColorSaving(true);
    try {
      await updateProfileSettings({ chat_color: colorId });
      await refreshUser();
    } catch {
      setAvatarError("Chat rangini saqlab bo'lmadi.");
    } finally {
      setIsColorSaving(false);
    }
  }

  async function handleAvatarVisibilityChange(value) {
    setAvatarError("");
    setIsSettingsSaving(true);
    try {
      await updateProfileSettings({ avatar_visibility: value });
      await refreshUser();
    } catch {
      setAvatarError("Sozlamani saqlab bo'lmadi.");
    } finally {
      setIsSettingsSaving(false);
    }
  }

  return (
    <section className="grid w-full min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-5 2xl:grid-cols-[minmax(0,360px)_1fr]">
      <aside className="min-w-0 w-full space-y-4">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
          <div className="relative h-28 bg-gradient-to-br from-primary via-blue-600 to-violet-600 sm:h-32">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.35) 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
            />
          </div>

          <div className="relative px-5 pb-5 pt-0">
            <div className="flex justify-center">
              <label
                className={`group relative -mt-14 mb-4 grid h-28 w-28 cursor-pointer place-items-center overflow-hidden rounded-[1.35rem] bg-blue-50 ring-4 ring-white dark:bg-blue-400/10 dark:ring-[#121826] sm:h-32 sm:w-32 ${
                  isAvatarUploading || isAvatarDeleting ? "pointer-events-none opacity-70" : ""
                }`}
                title={hasAvatar ? "Rasmni almashtirish" : "Rasm qo'shish"}
              >
              {hasAvatar ? (
                <img src={displayAvatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-primary sm:text-5xl">
                  {displayName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="absolute inset-0 grid place-items-center rounded-[1.35rem] bg-slate-950/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 group-active:opacity-100 [@media(hover:none)]:opacity-0 [@media(hover:none)]:active:opacity-100">
                <span className="text-3xl font-black leading-none text-white">+</span>
              </span>
              {(isAvatarUploading || isAvatarDeleting) && (
                <span className="absolute inset-0 z-10 grid place-items-center rounded-[1.35rem] bg-slate-950/70 px-2 text-center text-xs font-black leading-tight text-white">
                  {isAvatarDeleting ? "O'chirilmoqda" : "Yuklanmoqda"}
                </span>
              )}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
            </label>
            </div>

            <h2 className="text-center text-xl font-black leading-tight text-slate-950 dark:text-white sm:text-2xl">
              {displayName}
            </h2>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black text-primary">{roleLabel}</span>
              {hasUniversity && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  {universityShort}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  isProfileComplete
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isProfileComplete ? "bg-emerald-500" : "bg-amber-500"}`} />
                {isProfileComplete ? "Profil tayyor" : `${profileProgress}% to'ldirilgan`}
              </span>
            </div>

            {universityFull && (
              <p className={`mt-2 text-center ${metaTextClass} text-slate-600 dark:text-slate-300`}>{universityFull}</p>
            )}
            {universityLocation && (
              <p className={`mt-1 text-center ${metaTextClass}`}>{universityLocation}</p>
            )}
            {user?.email && (
              <p className={`mt-2 text-center ${metaTextClass}`}>{user.email}</p>
            )}
            {savedBio && (
              <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-xs leading-relaxed text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
                {savedBio}
              </p>
            )}

            <div className="mt-4 grid grid-cols-3 gap-2">
              <ProfileHeaderStat value={joinedChatCount} label="Chat" />
              <ProfileHeaderStat value={`${profileProgress}%`} label="Profil" />
              <ProfileHeaderStat value={hasAvatar ? "✓" : "—"} label="Rasm" />
            </div>

            {!isProfileComplete && (
              <div className="mt-4 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-3 py-3 dark:border-amber-400/20 dark:bg-amber-400/10">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-800 dark:text-amber-200">
                    Keyingi qadam
                  </p>
                  <span className="text-[10px] font-black tabular-nums text-amber-800 dark:text-amber-200">
                    {completedChecks}/{profileChecks.length}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-200/80 dark:bg-amber-400/20">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{ width: `${profileProgress}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profileChecks.map((item) => (
                    <span
                      key={item.label}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        item.done
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300"
                          : "bg-white text-amber-800 dark:bg-white/10 dark:text-amber-200"
                      }`}
                    >
                      {item.done ? "✓" : "○"} {item.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasAvatar && (
              <button
                type="button"
                onClick={handleAvatarDelete}
                disabled={isAvatarDeleting}
                className="mt-4 min-h-10 w-full rounded-xl border border-red-200 px-4 py-2 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-400/30 dark:hover:bg-red-950/30"
              >
                Rasmni o&apos;chirish
              </button>
            )}

            {avatarError && <p className="mt-3 text-xs font-semibold text-red-600 dark:text-red-400">{avatarError}</p>}
          </div>
        </div>

        <ProfileDigitalIdCard
          userId={user?.id}
          displayName={displayName}
          displayAvatarUrl={displayAvatarUrl}
          hasAvatar={hasAvatar}
          showAvatarPublicly={showAvatarPublicly}
          roleLabel={roleLabel}
          universityShort={universityShort}
          profileProgress={profileProgress}
          isProfileComplete={isProfileComplete}
          profileChecks={profileChecks}
          isStudent={isStudent}
          joinedChatCount={joinedChatCount}
        />
      </aside>

      <div className="min-w-0 w-full space-y-4 sm:space-y-5">
        <SettingsGroup title="Shaxsiy ma'lumotlar">
          <div className="px-4 py-4 sm:px-5 sm:py-5">
            <ProfileSettingsForm
              key={`${profile?.full_name ?? ""}|${profile?.university ?? ""}`}
              profile={profile}
              universities={universities}
              universityLabel={universityLabel}
              universityPlaceholder={profileContent.universityPlaceholder}
              universitySelectWarning={profileContent.universitySelectWarning}
              inputClassName={profileFieldInputClass}
              refreshUser={refreshUser}
            />
          </div>
        </SettingsGroup>

        <ProfileBioEditor
          bio={savedBio}
          bioDescription={profileContent.bioDescription}
          isSaving={isBioSaving}
          onSave={async (nextBio) => {
            setAvatarError("");
            setIsBioSaving(true);
            try {
              await updateProfileSettings({ bio: nextBio });
              await refreshUser();
            } catch {
              setAvatarError("Bioni saqlab bo'lmadi.");
              throw new Error("bio-save-failed");
            } finally {
              setIsBioSaving(false);
            }
          }}
        />

        <SettingsGroup title="Hisob">
          <SettingsRow
            label="Email"
            hint={user?.email || "—"}
            trailing={<CopyEmailButton email={user?.email} />}
          />
          <SettingsRow label={universityLabel} value={universityShort} hint={universityFull || undefined} />
          <SettingsRow
            label="Profil rasmi"
            value={avatarVisibility === "private_only" ? "Shaxsiy" : "Ommaviy"}
            hint={
              avatarVisibility === "private_only"
                ? profileContent.avatarVisibilityPrivate
                : profileContent.avatarVisibilityPublic
            }
          />
        </SettingsGroup>

        <SettingsGroup title="Maxfiylik">
          {avatarOptions.map((option) => {
            const isActive = avatarVisibility === option.value;
            return (
              <SettingsRow
                key={option.value}
                label={option.title}
                hint={option.hint}
                active={isActive}
                disabled={isSettingsSaving}
                onClick={() => handleAvatarVisibilityChange(option.value)}
                trailing={
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                      isActive ? "border-primary bg-primary" : "border-slate-300 dark:border-white/25"
                    }`}
                  >
                    {isActive && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                }
              />
            );
          })}
        </SettingsGroup>

        <ChatColorPicker
          displayName={displayName}
          userId={user?.id}
          selectedColor={profile?.chat_color || ""}
          resolvedColor={profile?.chat_color_resolved}
          isSaving={isColorSaving}
          onSelect={handleChatColorChange}
        />

        {profile?.is_moderator ? (
          <div className="overflow-hidden rounded-[1.75rem] border border-primary/20 bg-blue-50/50 p-4 shadow-soft dark:border-primary/30 dark:bg-primary/10 sm:p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Moderator</p>
            <p className={`mt-1 ${hintTextClass}`}>Shikoyatlarni ko&apos;rib chiqish va holatni yangilash.</p>
            <Link
              to="/moderator"
              className="mt-3 inline-flex rounded-xl bg-primary px-4 py-2 text-xs font-black text-white"
            >
              Moderator paneliga o&apos;tish
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProfileBioEditor({ bio, bioDescription, isSaving, onSave }) {
  const toast = useToast();
  const [draft, setDraft] = useState(bio);

  useEffect(() => {
    setDraft(bio || "");
  }, [bio]);

  const trimmedDraft = draft.trim();
  const trimmedSaved = (bio || "").trim();
  const isDirty = trimmedDraft !== trimmedSaved;
  const length = draft.length;
  const isTooShort = trimmedDraft.length > 0 && trimmedDraft.length < BIO_MIN_LENGTH;
  const isTooLong = length > BIO_MAX_LENGTH;

  async function handleSubmit(event) {
    event.preventDefault();
    if (isTooShort) {
      toast.warning(`Bio kamida ${BIO_MIN_LENGTH} belgi bo'lishi kerak.`);
      return;
    }
    if (isTooLong) {
      toast.warning(`Bio ${BIO_MAX_LENGTH} belgidan oshmasligi kerak.`);
      return;
    }

    try {
      await onSave(trimmedDraft);
    } catch {
      toast.error("Bioni saqlab bo'lmadi.");
    }
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
      <div className="border-b border-slate-100 px-4 py-2.5 dark:border-white/10 sm:px-5">
        <p className={sectionLabelClass}>Bio</p>
        <p className={`mt-1 ${hintTextClass}`}>{bioDescription}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div>
          <textarea
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value.slice(0, BIO_MAX_LENGTH));
            }}
            rows={3}
            maxLength={BIO_MAX_LENGTH}
            placeholder="O'zingiz haqingizda qisqacha yozing..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-400/25"
          />
          <div className="mt-2 flex items-center justify-between gap-2 text-xs">
            <span
              className={`font-semibold ${
                isTooShort || isTooLong ? "text-red-600" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {isTooShort
                ? `Yana ${BIO_MIN_LENGTH - trimmedDraft.length} belgi kerak`
                : trimmedDraft
                  ? "Tayyor"
                  : "Ixtiyoriy"}
            </span>
            <span className="font-bold tabular-nums text-slate-500 dark:text-slate-400">
              {length}/{BIO_MAX_LENGTH}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {isDirty && (
            <span className="mr-auto text-xs font-bold text-amber-600 dark:text-amber-300">
              Saqlanmagan o&apos;zgarishlar
            </span>
          )}
          {trimmedSaved && (
            <button
              type="button"
              disabled={isSaving}
              onClick={async () => {
                try {
                  await onSave("");
                  setDraft("");
                } catch {
                  toast.error("Bioni saqlab bo'lmadi.");
                }
              }}
              className="btn-modal-secondary min-h-9 text-xs"
            >
              O&apos;chirish
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving || !isDirty || isTooShort || isTooLong}
            className="btn-modal-dark min-h-9 px-4 text-xs disabled:opacity-50"
          >
            {isSaving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ProfileDigitalIdCard({
  userId,
  displayName,
  displayAvatarUrl,
  hasAvatar,
  showAvatarPublicly,
  roleLabel,
  universityShort,
  profileProgress,
  isProfileComplete,
  profileChecks,
  isStudent,
  joinedChatCount,
}) {
  const showPhoto = hasAvatar && showAvatarPublicly;
  const nextStep = profileChecks.find((item) => !item.done);
  const memberId = userId ? String(userId).padStart(5, "0") : "—";
  const ringRadius = 30;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (profileProgress / 100) * ringCircumference;

  const narrative = getProfileDigitalIdNarrative(isStudent, {
    isProfileComplete,
    profileProgress,
    nextStep,
    universityShort,
    joinedChatCount,
  });

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-blue-600/10 via-white to-violet-500/10 p-[1px] shadow-soft dark:border-primary/30 dark:from-blue-400/15 dark:via-white/[0.06] dark:to-violet-400/10">
      <div className="relative overflow-hidden rounded-[calc(1.75rem-1px)] bg-white dark:bg-[#121826]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.35) 1px, transparent 0)",
            backgroundSize: "14px 14px",
          }}
        />

        <div className="relative px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="rounded-lg bg-slate-950 px-2 py-0.5 text-[10px] font-black tracking-wider text-white dark:bg-white dark:text-slate-950">
                MYUNI
              </span>
              <span className={sectionLabelClass}>Raqamli ID</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
              <span
                className={`h-2 w-2 rounded-full ${isProfileComplete ? "bg-emerald-500" : "bg-amber-400"}`}
              />
              {isProfileComplete ? "Faol" : "To'ldirilmoqda"}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="relative shrink-0">
              <svg className="-rotate-90" width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
                <circle
                  cx="36"
                  cy="36"
                  r={ringRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-slate-200 dark:text-white/10"
                />
                <circle
                  cx="36"
                  cy="36"
                  r={ringRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="text-primary transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                {showPhoto ? (
                  <img src={displayAvatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-lg font-black text-white">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-black text-slate-950 dark:text-white">{displayName}</p>
              <p className="mt-0.5 truncate text-xs font-bold text-primary">{roleLabel}</p>
              <p className={`mt-0.5 truncate ${metaTextClass}`}>{universityShort}</p>
            </div>
          </div>

          <div className="mt-4 border-t border-dashed border-slate-200 pt-4 dark:border-white/10">
            <div className="flex items-center justify-between gap-2">
              <span className={sectionLabelClass}>A&apos;zo ID</span>
              <span className="text-sm font-black tabular-nums text-slate-900 dark:text-white">#{memberId}</span>
            </div>
            <p className={`mt-3 ${hintTextClass} text-slate-600 dark:text-slate-300`}>{narrative}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyEmailButton({ email }) {
  const [copied, setCopied] = useState(false);
  if (!email) return null;

  async function handleCopy(event) {
    event.stopPropagation();
    try {
      await window.navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300"
    >
      {copied ? "Nusxalandi" : "Nusxa olish"}
    </button>
  );
}

function ProfileSettingsForm({
  profile,
  universities,
  universityLabel,
  universityPlaceholder,
  universitySelectWarning,
  inputClassName,
  refreshUser,
}) {
  const toast = useToast();
  const matchedUniversity = matchUniversityByText(universities, profile?.university);
  const [editName, setEditName] = useState(profile?.full_name || "");
  const [editUniversity, setEditUniversity] = useState(
    matchedUniversity?.name || profile?.university || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const savedUniversity = matchedUniversity?.name || profile?.university || "";
  const isDirty =
    editName.trim() !== (profile?.full_name || "").trim() ||
    editUniversity.trim() !== savedUniversity.trim();

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = editName.trim();
    if (!trimmedName) {
      toast.warning("Ism bo'sh bo'lmasligi kerak.");
      return;
    }

    const matched = matchUniversityByText(universities, editUniversity);
    const universityToSave = matched?.name || editUniversity.trim();
    if (!universityToSave) {
      toast.warning(universitySelectWarning);
      return;
    }
    if (!matched) {
      toast.warning(universitySelectWarning);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfileSettings({
        full_name: trimmedName,
        university: universityToSave,
      });
      await refreshUser();
      setEditUniversity(universityToSave);
    } catch {
      toast.error("Profilni saqlab bo'lmadi.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        <div>
          <label htmlFor="profile-full-name" className={sectionLabelClass}>
            Ism
          </label>
          <input
            id="profile-full-name"
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            autoComplete="name"
            className={`mt-2 ${inputClassName}`}
          />
        </div>
        <div>
          <label htmlFor="profile-university" className={sectionLabelClass}>
            {universityLabel}
          </label>
          <div className="mt-2">
            <UniversitySearchSelect
              universities={universities}
              value={editUniversity}
              onChange={setEditUniversity}
              disabled={isSaving || universities.length === 0}
              inputClassName={inputClassName}
              placeholder={universities.length === 0 ? "Yuklanmoqda..." : universityPlaceholder}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {isDirty && (
          <span className="mr-auto text-xs font-bold text-amber-600 dark:text-amber-300">Saqlanmagan o&apos;zgarishlar</span>
        )}
        <button
          type="submit"
          disabled={isSaving || !editName.trim() || !isDirty}
          className="min-h-9 rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-primary disabled:opacity-50 dark:bg-white dark:text-slate-950"
        >
          {isSaving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </form>
  );
}
