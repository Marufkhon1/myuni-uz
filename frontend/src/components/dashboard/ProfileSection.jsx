import { useEffect, useMemo, useState } from "react";
import { deleteAvatar, updateProfileSettings, uploadAvatar } from "../../services/authService.js";
import { resolveMediaUrl } from "../../utils/media.js";
import UniversitySearchSelect, { matchUniversityByText } from "./UniversitySearchSelect.jsx";
import ChatColorPicker from "./ChatColorPicker.jsx";

const BIO_MIN_LENGTH = 3;
const BIO_MAX_LENGTH = 70;

const sectionLabelClass = "text-xs font-black uppercase tracking-[0.18em] text-primary";

const profileFieldInputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base font-semibold outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-400/25";

function SettingsGroup({ title, children }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
      {title && (
        <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10 sm:px-5">
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
      className={`flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5 ${
        onClick && !disabled ? "transition hover:bg-slate-50 dark:hover:bg-white/[0.04]" : ""
      } ${disabled ? "opacity-60" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-base font-bold ${active ? "text-primary" : "text-slate-900 dark:text-white"}`}>
          {label}
        </p>
        {hint && (
          <p className="mt-1 break-all text-sm leading-6 text-slate-500 dark:text-slate-400">{hint}</p>
        )}
      </div>
      {value && (
        <span className="max-w-[42%] truncate text-right text-sm font-bold text-slate-600 dark:text-slate-300">
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
    <div className="min-w-0 flex-1 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-3 text-center dark:border-white/10 dark:bg-white/[0.04]">
      <p className="truncate text-xl font-black tabular-nums text-slate-950 dark:text-white sm:text-2xl">{value}</p>
      <p className="mt-0.5 truncate text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
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

  const roleLabel = isStudent ? "Talaba" : "Abituriyent";
  const avatarVisibility = profile?.avatar_visibility || "everyone";
  const universityLabel = isStudent ? "Universitet" : "Qiziqilgan universitet";
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

  const profileChecks = isStudent
    ? [
        { label: "Ism", done: Boolean((profile?.full_name || "").trim()) },
        { label: "Universitet", done: hasUniversity },
        { label: "Rasm", done: hasAvatar },
      ]
    : [
        { label: "Ism", done: Boolean((profile?.full_name || "").trim()) },
        { label: "Universitet", done: hasUniversity },
      ];

  const completedChecks = profileChecks.filter((item) => item.done).length;
  const profileProgress = Math.round((completedChecks / profileChecks.length) * 100);
  const isProfileComplete = profileProgress === 100;
  const showAvatarPublicly = avatarVisibility !== "private_only";

  const avatarOptions = isStudent
    ? [
        {
          value: "everyone",
          title: "Hammaga ko'rinadi",
          hint: "Sharh, chat va profilda",
        },
        {
          value: "private_only",
          title: "Faqat shaxsiy chat",
          hint: "Guruh va sharhlarda yashirin",
        },
      ]
    : [
        {
          value: "everyone",
          title: "Hammaga ko'rinadi",
          hint: "Profil va bo'limlarda",
        },
        {
          value: "private_only",
          title: "Kamroq ko'rsatish",
          hint: "Asosan shaxsiy aloqada",
        },
      ];

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
    <section className="mx-auto w-full min-w-0 max-w-2xl space-y-4 sm:space-y-5">
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
        <div className="bg-gradient-to-b from-primary/10 via-transparent to-transparent px-4 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-8">
          <div className="flex flex-col items-center text-center">
            <label
              className={`group relative mb-4 grid h-24 w-24 cursor-pointer place-items-center overflow-hidden rounded-full bg-blue-50 ring-4 ring-white dark:bg-blue-400/10 dark:ring-slate-900 sm:h-28 sm:w-28 ${
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
              <span className="absolute inset-0 grid place-items-center rounded-full bg-slate-950/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 group-active:opacity-100 [@media(hover:none)]:opacity-0 [@media(hover:none)]:active:opacity-100">
                <span className="text-4xl font-black leading-none text-white">+</span>
              </span>
              {(isAvatarUploading || isAvatarDeleting) && (
                <span className="absolute inset-0 z-10 grid place-items-center rounded-full bg-slate-950/70 px-2 text-center text-xs font-black leading-tight text-white">
                  {isAvatarDeleting ? "O'chirilmoqda" : "Yuklanmoqda"}
                </span>
              )}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
            </label>

            <h2 className="max-w-full truncate text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
              {displayName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-black text-primary">{roleLabel}</span>
              {hasUniversity && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  {universityShort}
                </span>
              )}
            </div>
            {universityFull && universityFull !== universityShort && (
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">{universityFull}</p>
            )}
            {universityLocation && (
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{universityLocation}</p>
            )}
            {user?.email && (
              <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{user.email}</p>
            )}
            {savedBio && (
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-700 dark:text-slate-200">{savedBio}</p>
            )}
          </div>

          <div className="mt-5 flex gap-2 sm:gap-3">
            <ProfileHeaderStat value={joinedChatCount} label="Chat" />
            <ProfileHeaderStat value={`${profileProgress}%`} label="Profil" />
            <ProfileHeaderStat value={hasAvatar ? "✓" : "—"} label="Rasm" />
          </div>
        </div>

        <div className="border-t border-slate-100 px-4 py-4 dark:border-white/10 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {hasAvatar && (
              <button
                type="button"
                onClick={handleAvatarDelete}
                disabled={isAvatarDeleting}
                className="min-h-11 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-black text-red-600 disabled:opacity-50 dark:border-red-400/30"
              >
                Rasmni o&apos;chirish
              </button>
            )}
          </div>

          {!isProfileComplete && (
            <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-4 dark:bg-amber-400/10">
              <div className="flex items-center justify-between gap-2">
                <p className={sectionLabelClass}>Profil to&apos;ldirish</p>
                <span className="text-sm font-black text-amber-800 dark:text-amber-200">
                  {completedChecks}/{profileChecks.length}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-200/80 dark:bg-amber-400/20">
                <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${profileProgress}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {profileChecks.map((item) => (
                  <span
                    key={item.label}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
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

          {avatarError && <p className="mt-3 text-sm font-semibold text-red-600">{avatarError}</p>}
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

      <SettingsGroup title="Shaxsiy ma'lumotlar">
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <ProfileSettingsForm
            key={`${profile?.full_name ?? ""}|${profile?.university ?? ""}`}
            profile={profile}
            universities={universities}
            universityLabel={universityLabel}
            inputClassName={profileFieldInputClass}
            refreshUser={refreshUser}
          />
        </div>
      </SettingsGroup>

      <ProfileBioEditor
        bio={savedBio}
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
              ? "Guruh chat va sharhlarda yashirin"
              : "Barcha bo'limlarda ko'rinadi"
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
    </section>
  );
}

function ProfileBioEditor({ bio, isSaving, onSave }) {
  const [draft, setDraft] = useState(bio);
  const [error, setError] = useState("");

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
      setError(`Bio kamida ${BIO_MIN_LENGTH} belgi bo'lishi kerak.`);
      return;
    }
    if (isTooLong) {
      setError(`Bio ${BIO_MAX_LENGTH} belgidan oshmasligi kerak.`);
      return;
    }

    setError("");
    try {
      await onSave(trimmedDraft);
    } catch {
      setError("Bioni saqlab bo'lmadi.");
    }
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
      <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10 sm:px-5">
        <p className={sectionLabelClass}>Bio</p>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Boshqa foydalanuvchilar profilingizda ko&apos;radi · {BIO_MIN_LENGTH}–{BIO_MAX_LENGTH} belgi
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div>
          <textarea
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value.slice(0, BIO_MAX_LENGTH));
              setError("");
            }}
            rows={3}
            maxLength={BIO_MAX_LENGTH}
            placeholder="O'zingiz haqingizda qisqacha yozing..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-400/25"
          />
          <div className="mt-2 flex items-center justify-between gap-2 text-sm">
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

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <div className="flex flex-wrap items-center justify-end gap-3">
          {isDirty && (
            <span className="mr-auto text-sm font-bold text-amber-600 dark:text-amber-300">
              Saqlanmagan o&apos;zgarishlar
            </span>
          )}
          {trimmedSaved && (
            <button
              type="button"
              disabled={isSaving}
              onClick={async () => {
                setError("");
                try {
                  await onSave("");
                  setDraft("");
                } catch {
                  setError("Bioni saqlab bo'lmadi.");
                }
              }}
              className="min-h-11 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600 disabled:opacity-50 dark:border-white/15 dark:text-slate-300"
            >
              O&apos;chirish
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving || !isDirty || isTooShort || isTooLong}
            className="min-h-11 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-primary disabled:opacity-50 dark:bg-white dark:text-slate-950"
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

  const narrative = (() => {
    if (!isProfileComplete && nextStep) {
      return `Profil ${profileProgress}% — ${nextStep.label.toLowerCase()} qo'shing va kartani to'liq faollashtiring.`;
    }
    if (isStudent) {
      if (joinedChatCount > 0) {
        return `${universityShort} talabasi sifatida ${joinedChatCount} ta chatda muloqot qilmoqdasiz.`;
      }
      return `${universityShort} talabasisiz — chatga qo'shilish uchun profilingiz tayyor.`;
    }
    if (joinedChatCount > 0) {
      return `${universityShort} bo'yicha tanlov qilyapsiz va ${joinedChatCount} ta chatda savol beryapsiz.`;
    }
    return `${universityShort} haqida o'qiyapsiz — sharhlar va taqqoslash siz uchun ochiq.`;
  })();

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
              <span className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-black tracking-wider text-white dark:bg-white dark:text-slate-950">
                MYUNI
              </span>
              <span className={sectionLabelClass}>Raqamli ID</span>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
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
              <p className="truncate text-lg font-black text-slate-950 dark:text-white sm:text-xl">{displayName}</p>
              <p className="mt-0.5 truncate text-sm font-bold text-primary">{roleLabel}</p>
              <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{universityShort}</p>
            </div>
          </div>

          <div className="mt-4 border-t border-dashed border-slate-200 pt-4 dark:border-white/10">
            <div className="flex items-center justify-between gap-2">
              <span className={sectionLabelClass}>A&apos;zo ID</span>
              <span className="text-base font-black tabular-nums text-slate-900 dark:text-white">#{memberId}</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{narrative}</p>
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
      await navigator.clipboard.writeText(email);
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
  inputClassName,
  refreshUser,
}) {
  const matchedUniversity = matchUniversityByText(universities, profile?.university);
  const [editName, setEditName] = useState(profile?.full_name || "");
  const [editUniversity, setEditUniversity] = useState(
    matchedUniversity?.name || profile?.university || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const savedUniversity = matchedUniversity?.name || profile?.university || "";
  const isDirty =
    editName.trim() !== (profile?.full_name || "").trim() ||
    editUniversity.trim() !== savedUniversity.trim();

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setError("Ism bo'sh bo'lmasligi kerak.");
      return;
    }

    const matched = matchUniversityByText(universities, editUniversity);
    const universityToSave = matched?.name || editUniversity.trim();
    if (!universityToSave) {
      setError("Universitetni ro'yxatdan tanlang.");
      return;
    }
    if (!matched) {
      setError("Universitetni qidiruv natijasidan tanlang.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      await updateProfileSettings({
        full_name: trimmedName,
        university: universityToSave,
      });
      await refreshUser();
      setEditUniversity(universityToSave);
    } catch {
      setError("Profilni saqlab bo'lmadi.");
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
              placeholder={
                universities.length === 0
                  ? "Yuklanmoqda..."
                  : universityLabel === "Universitet"
                    ? "Universitetni qidiring..."
                    : "Qiziqilgan universitetni qidiring..."
              }
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {isDirty && (
          <span className="mr-auto text-sm font-bold text-amber-600 dark:text-amber-300">Saqlanmagan o&apos;zgarishlar</span>
        )}
        <button
          type="submit"
          disabled={isSaving || !editName.trim() || !isDirty}
          className="min-h-11 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-primary disabled:opacity-50 dark:bg-white dark:text-slate-950"
        >
          {isSaving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </form>
  );
}
