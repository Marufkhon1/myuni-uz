import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteAvatar, updateProfileSettings, uploadAvatar } from "../../services/authService.js";
import { useToast } from "../../hooks/useToast.js";
import { resolveMediaUrl } from "../../utils/media.js";
import UniversitySearchSelect from "./UniversitySearchSelect.jsx";
import { matchUniversityByText } from "../../utils/universityMatch.js";
import ChatColorPicker from "./ChatColorPicker.jsx";
import { getProfileContent, getProfileDigitalIdNarrative } from "../../utils/profileRoleContent.js";
import { getAuthorColorHex, getNameInitials } from "../../utils/chatAuthorColor.js";
import { buildFullName, splitFullName } from "../../utils/profileName.js";
import IconDeleteButton from "../ui/IconDeleteButton.jsx";
import ConfirmDialog from "../ConfirmDialog.jsx";

const BIO_MIN_LENGTH = 3;
const BIO_MAX_LENGTH = 70;

const sectionLabelClass = "text-[10px] font-black uppercase tracking-[0.16em] text-primary";
const hintTextClass = "text-xs leading-relaxed text-slate-500 dark:text-slate-400";
const metaTextClass = "text-[11px] font-semibold text-slate-500 dark:text-slate-400";

const profileFieldInputClass =
  "h-11 w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/15 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-primary/30";

function ProfileSettingsPanel({ title, description, icon, children }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white shadow-soft ring-1 ring-slate-200/50 dark:border-white/10 dark:bg-white/[0.06] dark:ring-white/5">
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/90 via-white to-violet-50/50 px-4 py-4 dark:border-white/10 dark:from-blue-400/10 dark:via-white/[0.04] dark:to-violet-400/5 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg ring-1 ring-primary/15 dark:bg-primary/15 dark:ring-primary/25">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black tracking-tight text-slate-950 dark:text-white">{title}</p>
            {description ? <p className={`mt-1 ${hintTextClass}`}>{description}</p> : null}
          </div>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-5 sm:py-5">{children}</div>
    </div>
  );
}

function ProfileFormField({ id, label, icon, hint, children }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/70 to-white p-4 shadow-sm dark:border-white/10 dark:from-white/[0.04] dark:to-white/[0.02]">
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300"
      >
        <span
          className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm ring-1 ring-primary/10 dark:bg-primary/15 dark:ring-primary/20"
          aria-hidden="true"
        >
          {icon}
        </span>
        {label}
      </label>
      <div className="mt-3">{children}</div>
      {hint ? <p className={`mt-2 ${hintTextClass}`}>{hint}</p> : null}
    </div>
  );
}

function ProfileAccountInfoCard({ icon, label, hint, children }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/70 to-white p-4 shadow-sm dark:border-white/10 dark:from-white/[0.04] dark:to-white/[0.02]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg ring-1 ring-primary/10 dark:bg-primary/15 dark:ring-primary/20"
            aria-hidden="true"
          >
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-950 dark:text-white">{label}</p>
            {hint ? <p className={`mt-1 break-all ${hintTextClass}`}>{hint}</p> : null}
          </div>
        </div>
        {children ? <div className="shrink-0 self-center">{children}</div> : null}
      </div>
    </div>
  );
}

function ProfilePrivacyOption({ icon, title, hint, isActive, disabled, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isActive
          ? "border-primary/40 bg-gradient-to-br from-primary/10 via-blue-50/80 to-white ring-2 ring-primary/20 dark:border-primary/35 dark:from-primary/15 dark:via-blue-400/10 dark:to-white/[0.03] dark:ring-primary/25"
          : "border-slate-200/80 bg-gradient-to-br from-slate-50/70 to-white hover:border-slate-300 hover:bg-white dark:border-white/10 dark:from-white/[0.04] dark:to-white/[0.02] dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ring-1 ${
          isActive
            ? "bg-primary/15 ring-primary/20 dark:bg-primary/20 dark:ring-primary/30"
            : "bg-slate-100 ring-slate-200/80 dark:bg-white/10 dark:ring-white/10"
        }`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-black ${isActive ? "text-primary" : "text-slate-950 dark:text-white"}`}>
          {title}
        </p>
        <p className={`mt-1 ${hintTextClass}`}>{hint}</p>
      </div>
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${
          isActive ? "border-primary bg-primary" : "border-slate-300 dark:border-white/25"
        }`}
        aria-hidden="true"
      >
        {isActive ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      </span>
    </button>
  );
}

function ProfilePrivacyPanel({ options, activeValue, disabled, onChange }) {
  const icons = {
    everyone: "🌐",
    private_only: "🔒",
  };

  return (
    <ProfileSettingsPanel
      title="Maxfiylik"
      description="Profil rasmingiz qayerda ko'rinishini tanlang."
      icon="🛡️"
    >
      <div className="space-y-3" role="radiogroup" aria-label="Profil rasmi maxfiyligi">
        {options.map((option) => (
          <ProfilePrivacyOption
            key={option.value}
            icon={icons[option.value] ?? "👤"}
            title={option.title}
            hint={option.hint}
            isActive={activeValue === option.value}
            disabled={disabled}
            onSelect={() => onChange(option.value)}
          />
        ))}
      </div>
      {disabled ? (
        <p className={`mt-3 text-center ${hintTextClass}`}>Sozlama saqlanmoqda...</p>
      ) : null}
    </ProfileSettingsPanel>
  );
}

function ProfileBadge({ children, tone = "default", compact = false }) {
  const tones = {
    default: "bg-slate-100 text-slate-700 ring-slate-200/80 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10",
    primary: "bg-primary/10 text-primary ring-primary/20 dark:bg-primary/15 dark:ring-primary/25",
    success: "bg-emerald-100 text-emerald-700 ring-emerald-200/80 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/20",
    warning: "bg-amber-100 text-amber-800 ring-amber-200/80 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ring-1 ${
        compact
          ? "px-3 py-1.5 text-xs font-bold normal-case tracking-normal"
          : "px-2.5 py-1 text-[10px] font-black uppercase tracking-wide"
      } ${tones[tone] ?? tones.default}`}
    >
      {children}
    </span>
  );
}

function ProfileMetaRow({ icon, children }) {
  return (
    <p className={`flex items-center justify-center gap-2 text-center ${metaTextClass}`}>
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-slate-100 text-[11px] dark:bg-white/10" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 truncate">{children}</span>
    </p>
  );
}

function ProfileHeaderStat({ value, label, icon, accent = "slate" }) {
  const accents = {
    slate: "from-slate-50 to-white dark:from-white/[0.06] dark:to-white/[0.02]",
    blue: "from-blue-50/90 to-white dark:from-blue-400/10 dark:to-white/[0.02]",
    emerald: "from-emerald-50/90 to-white dark:from-emerald-400/10 dark:to-white/[0.02]",
  };

  return (
    <div
      className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br ${accents[accent] ?? accents.slate} p-3 shadow-sm dark:border-white/10`}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="truncate text-xl font-black tabular-nums leading-none text-slate-950 dark:text-white">{value}</p>
        {icon ? (
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white/80 text-xs shadow-sm dark:bg-white/10">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 truncate text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

function ProfileAvatarRing({ progress, children }) {
  const ringRadius = 54;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progress / 100) * ringCircumference;

  return (
    <div className="relative grid h-[7.75rem] w-[7.75rem] place-items-center sm:h-[8.25rem] sm:w-[8.25rem]">
      <svg
        className="pointer-events-none absolute inset-0 -rotate-90"
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          r={ringRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-slate-200/90 dark:text-white/10"
        />
        <circle
          cx="60"
          cy="60"
          r={ringRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={ringCircumference}
          strokeDashoffset={ringOffset}
          className="text-primary transition-all duration-700"
        />
      </svg>
      <div className="absolute -inset-1 rounded-[1.5rem] bg-gradient-to-br from-primary/20 via-blue-400/10 to-violet-500/20 blur-md" aria-hidden="true" />
      {children}
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
  const [avatarDeleteOpen, setAvatarDeleteOpen] = useState(false);
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
  const profileChatColor = profile?.chat_color_resolved || profile?.chat_color || "";
  const profileColorHex = getAuthorColorHex(user?.id, profileChatColor);
  const profileInitials = getNameInitials(displayName);

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

  async function confirmAvatarDelete() {
    setAvatarError("");
    setIsAvatarDeleting(true);
    try {
      await deleteAvatar();
      await refreshUser();
      setAvatarPreview("");
      setAvatarDeleteOpen(false);
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
    <>
    <section className="grid w-full min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-5 2xl:grid-cols-[minmax(0,360px)_1fr]">
      <aside className="min-w-0 w-full space-y-4">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-soft ring-1 ring-slate-200/50 dark:border-white/10 dark:bg-white/[0.06] dark:ring-white/5">
          <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary via-[#1d4ed8] to-violet-700 sm:h-36">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.28) 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="pointer-events-none absolute -left-8 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-6 bottom-0 h-28 w-28 rounded-full bg-violet-300/20 blur-2xl" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent dark:from-[#121826]" aria-hidden="true" />
            <div className="absolute right-4 top-4 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white ring-1 ring-white/20 backdrop-blur-sm">
              {profileProgress}% tayyor
            </div>
          </div>

          <div className="relative px-5 pb-5 pt-0">
            <div className="-mt-14 flex justify-center sm:-mt-16">
              <ProfileAvatarRing progress={profileProgress}>
                <label
                  className={`group relative z-10 grid h-28 w-28 cursor-pointer place-items-center overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-blue-50 to-slate-100 ring-4 ring-white dark:from-blue-400/10 dark:to-white/5 dark:ring-[#121826] sm:h-[7.25rem] sm:w-[7.25rem] ${
                    isAvatarUploading || isAvatarDeleting ? "pointer-events-none opacity-70" : ""
                  }`}
                  title={hasAvatar ? "Rasmni almashtirish" : "Rasm qo'shish"}
                >
                  {hasAvatar ? (
                    <img src={displayAvatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span
                      className={`grid h-full w-full place-items-center font-black text-white ${
                        profileInitials.length > 1 ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"
                      }`}
                      style={{ backgroundColor: profileColorHex }}
                    >
                      {profileInitials}
                    </span>
                  )}
                  <span className="absolute inset-0 grid place-items-center rounded-[1.35rem] bg-slate-950/55 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 group-active:opacity-100 [@media(hover:none)]:opacity-0 [@media(hover:none)]:active:opacity-100">
                    <span className="flex flex-col items-center gap-0.5 text-white">
                      <span className="text-2xl leading-none">📷</span>
                      <span className="text-[10px] font-black uppercase tracking-wide">
                        {hasAvatar ? "Almashtirish" : "Qo'shish"}
                      </span>
                    </span>
                  </span>
                  {(isAvatarUploading || isAvatarDeleting) && (
                    <span className="absolute inset-0 z-10 grid place-items-center rounded-[1.35rem] bg-slate-950/75 px-2 text-center text-xs font-black leading-tight text-white">
                      {isAvatarDeleting ? "O'chirilmoqda" : "Yuklanmoqda"}
                    </span>
                  )}
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                </label>
                {hasAvatar ? (
                  <IconDeleteButton
                    onClick={() => setAvatarDeleteOpen(true)}
                    disabled={isAvatarDeleting}
                    className="absolute -bottom-1 -right-1 z-20 border-2 border-white dark:border-[#121826]"
                    ariaLabel="Rasmni o'chirish"
                    title="Rasmni o'chirish"
                  />
                ) : null}
              </ProfileAvatarRing>
            </div>

            <div className="-mt-1 text-center">
              <h2 className="text-xl font-black leading-tight tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                {displayName}
              </h2>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                <ProfileBadge tone="primary">{roleLabel}</ProfileBadge>
                {hasUniversity && <ProfileBadge>{universityShort}</ProfileBadge>}
                <ProfileBadge tone={isProfileComplete ? "success" : "warning"}>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isProfileComplete ? "bg-emerald-500" : "bg-amber-500"}`}
                  />
                  {isProfileComplete ? "Profil tayyor" : `${profileProgress}% to'ldirilgan`}
                </ProfileBadge>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {universityFull && (
                <ProfileMetaRow icon="🎓">{universityFull}</ProfileMetaRow>
              )}
              {universityLocation && <ProfileMetaRow icon="📍">{universityLocation}</ProfileMetaRow>}
              {user?.email && <ProfileMetaRow icon="✉️">{user.email}</ProfileMetaRow>}
            </div>

            {savedBio && (
              <blockquote className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/90 to-white px-4 py-3.5 dark:border-white/10 dark:from-white/[0.05] dark:to-white/[0.02]">
                <span
                  className="pointer-events-none absolute left-3 top-2 text-3xl font-serif leading-none text-primary/20"
                  aria-hidden="true"
                >
                  "
                </span>
                <p className="relative text-sm leading-relaxed text-slate-700 dark:text-slate-200">{savedBio}</p>
              </blockquote>
            )}

            <div className="mt-4 grid grid-cols-3 gap-2">
              <ProfileHeaderStat value={joinedChatCount} label="Chat" icon="💬" accent="blue" />
              <ProfileHeaderStat value={`${profileProgress}%`} label="Profil" icon="◎" accent="slate" />
              <ProfileHeaderStat
                value={hasAvatar ? "✓" : "—"}
                label="Rasm"
                icon={hasAvatar ? "🖼️" : "○"}
                accent={hasAvatar ? "emerald" : "slate"}
              />
            </div>

            {!isProfileComplete && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-amber-50/40 dark:border-amber-400/20 dark:from-amber-400/10 dark:via-white/[0.03] dark:to-amber-400/5">
                <div className="px-3.5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-800 dark:text-amber-200">
                      Keyingi qadam
                    </p>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black tabular-nums text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
                      {completedChecks}/{profileChecks.length}
                    </span>
                  </div>
                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-amber-200/70 dark:bg-amber-400/15">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                      style={{ width: `${profileProgress}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {profileChecks.map((item) => (
                      <span
                        key={item.label}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${
                          item.done
                            ? "bg-emerald-100 text-emerald-700 ring-emerald-200/80 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/20"
                            : "bg-white text-amber-800 ring-amber-200/70 dark:bg-white/10 dark:text-amber-200 dark:ring-amber-400/20"
                        }`}
                      >
                        {item.done ? "✓" : "○"} {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {avatarError && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:border-red-400/30 dark:bg-red-950/30 dark:text-red-400">
                {avatarError}
              </p>
            )}
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
          chatColorKey={profileChatColor}
        />
      </aside>

      <div className="min-w-0 w-full space-y-4 sm:space-y-5">
        <ProfileSettingsPanel
          title="Shaxsiy ma'lumotlar"
          description="Ism va universitingiz chat, profil va taqqoslash bo'limlarida ko'rsatiladi."
          icon="👤"
        >
          <ProfileSettingsForm
            key={`${profile?.full_name ?? ""}|${profile?.university ?? ""}`}
            profile={profile}
            universities={universities}
            universityLabel={universityLabel}
            universityPlaceholder={profileContent.universityPlaceholder}
            universitySelectWarning={profileContent.universitySelectWarning}
            firstNameLabel={profileContent.firstNameLabel}
            lastNameLabel={profileContent.lastNameLabel}
            firstNameHint={profileContent.firstNameHint}
            lastNameHint={profileContent.lastNameHint}
            inputClassName={profileFieldInputClass}
            refreshUser={refreshUser}
          />
        </ProfileSettingsPanel>

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

        <ProfileSettingsPanel
          title="Hisob"
          description="Asosiy hisob ma'lumotlaringiz va profil ko'rinishi."
          icon="🔐"
        >
          <div className="space-y-3">
            <ProfileAccountInfoCard icon="✉️" label="Email" hint={user?.email || "—"}>
              <CopyEmailButton email={user?.email} />
            </ProfileAccountInfoCard>

            <ProfileAccountInfoCard
              icon="🎓"
              label={universityLabel}
              hint={universityFull || "Universitet tanlanmagan"}
            >
              <ProfileBadge tone="primary" compact>
                {universityShort}
              </ProfileBadge>
            </ProfileAccountInfoCard>

            <ProfileAccountInfoCard
              icon="🖼️"
              label="Profil rasmi"
              hint={
                avatarVisibility === "private_only"
                  ? profileContent.avatarVisibilityPrivate
                  : profileContent.avatarVisibilityPublic
              }
            >
              <ProfileBadge tone={avatarVisibility === "private_only" ? "default" : "success"} compact>
                {avatarVisibility === "private_only" ? "🔒 Shaxsiy" : "🌐 Ommaviy"}
              </ProfileBadge>
            </ProfileAccountInfoCard>
          </div>
        </ProfileSettingsPanel>

        <ProfilePrivacyPanel
          options={avatarOptions}
          activeValue={avatarVisibility}
          disabled={isSettingsSaving}
          onChange={handleAvatarVisibilityChange}
        />

        <ChatColorPicker
          displayName={displayName}
          userId={user?.id}
          avatarUrl={hasAvatar ? displayAvatarUrl : ""}
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

    <ConfirmDialog
      open={avatarDeleteOpen}
      title="Rasmni o'chirish"
      description="Profil rasmingizni o'chirmoqchimisiz? Amalni ortga qaytarib bo'lmaydi."
      confirmLabel="Ha"
      cancelLabel="Yo'q"
      onClose={() => {
        if (!isAvatarDeleting) {
          setAvatarDeleteOpen(false);
        }
      }}
      onConfirm={confirmAvatarDelete}
      isSubmitting={isAvatarDeleting}
      tone="danger"
    />
  </>
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
  const charProgress = Math.min((length / BIO_MAX_LENGTH) * 100, 100);
  const charTone =
    isTooLong || isTooShort ? "text-red-600 dark:text-red-400" : length >= BIO_MIN_LENGTH ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400";

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

  async function handleClear() {
    try {
      await onSave("");
      setDraft("");
    } catch {
      toast.error("Bioni saqlab bo'lmadi.");
    }
  }

  return (
    <ProfileSettingsPanel title="Bio" description={bioDescription} icon="💬">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/70 to-white p-4 shadow-sm dark:border-white/10 dark:from-white/[0.04] dark:to-white/[0.02]">
          <span
            className="pointer-events-none absolute left-4 top-3 text-4xl font-serif leading-none text-primary/15"
            aria-hidden="true"
          >
            "
          </span>
          <textarea
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value.slice(0, BIO_MAX_LENGTH));
            }}
            rows={4}
            maxLength={BIO_MAX_LENGTH}
            placeholder="O'zingiz haqingizda qisqacha yozing — masalan, qaysi yo'nalishda o'qiysiz yoki qiziqishlaringiz..."
            className="relative w-full resize-none rounded-xl border border-slate-200/90 bg-white/90 px-3.5 py-3 text-sm leading-relaxed text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/15 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-primary/30"
          />

          <div className="mt-3 flex items-center gap-3">
            <div className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isTooLong || isTooShort
                    ? "bg-red-500"
                    : length >= BIO_MIN_LENGTH
                      ? "bg-emerald-500"
                      : "bg-primary"
                }`}
                style={{ width: `${charProgress}%` }}
              />
            </div>
            <span className={`shrink-0 text-xs font-black tabular-nums ${charTone}`}>
              {length}/{BIO_MAX_LENGTH}
            </span>
          </div>

          <p className={`mt-2 text-[11px] font-semibold ${charTone}`}>
            {isTooShort
              ? `Yana ${BIO_MIN_LENGTH - trimmedDraft.length} belgi kerak`
              : isTooLong
                ? `${BIO_MAX_LENGTH - length} belgi ortiqcha`
                : trimmedDraft
                  ? "✓ Bio tayyor — saqlash mumkin"
                  : "Ixtiyoriy · kamida 3 belgi"}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.04]">
          {isDirty ? (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
              Saqlanmagan o&apos;zgarishlar
            </span>
          ) : trimmedSaved ? (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="text-emerald-500" aria-hidden="true">
                ✓
              </span>
              Bio saqlangan
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Bio hali yozilmagan</span>
          )}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {trimmedSaved ? (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleClear}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:border-red-400/30 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              >
                O&apos;chirish
              </button>
            ) : null}
            <button
              type="submit"
              disabled={isSaving || !isDirty || isTooShort || isTooLong}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
            >
              {isSaving ? (
                <>
                  <span
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden="true"
                  />
                  Saqlanmoqda...
                </>
              ) : (
                <>Saqlash</>
              )}
            </button>
          </div>
        </div>
      </form>
    </ProfileSettingsPanel>
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
  chatColorKey,
}) {
  const showPhoto = hasAvatar && showAvatarPublicly;
  const nextStep = profileChecks.find((item) => !item.done);
  const memberId = userId ? String(userId).padStart(5, "0") : "—";
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (profileProgress / 100) * ringCircumference;
  const initials = getNameInitials(displayName);
  const avatarColor = getAuthorColorHex(userId, chatColorKey);

  const narrative = getProfileDigitalIdNarrative(isStudent, {
    isProfileComplete,
    profileProgress,
    nextStep,
    universityShort,
    joinedChatCount,
  });

  return (
    <div className="group relative overflow-hidden rounded-[1.85rem] bg-gradient-to-br from-primary via-blue-600 to-violet-600 p-[1.5px] shadow-[0_20px_50px_-20px_rgba(37,99,235,0.55)]">
      <div className="pointer-events-none absolute inset-0 rounded-[1.85rem] bg-gradient-to-tr from-white/25 via-transparent to-white/10 opacity-60" aria-hidden="true" />

      <div className="relative overflow-hidden rounded-[calc(1.85rem-1.5px)] bg-white dark:bg-[#0f1623]">
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-[#0f2744] to-primary px-4 py-3.5 sm:px-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.22) 1px, transparent 0)",
              backgroundSize: "16px 16px",
            }}
          />
          <div className="pointer-events-none absolute -right-6 top-0 h-20 w-20 rounded-full bg-blue-400/20 blur-2xl" aria-hidden="true" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-black tracking-[0.22em] text-white ring-1 ring-white/15 backdrop-blur-sm">
                MYUNI
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-200/90">Raqamli ID</span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ring-1 backdrop-blur-sm ${
                isProfileComplete
                  ? "bg-emerald-400/15 text-emerald-100 ring-emerald-300/30"
                  : "bg-amber-400/15 text-amber-100 ring-amber-300/30"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isProfileComplete ? "bg-emerald-400" : "bg-amber-300"}`} />
              {isProfileComplete ? "Faol" : "To'ldirilmoqda"}
            </span>
          </div>
        </div>

        <div
          className="pointer-events-none absolute right-0 top-14 h-28 w-28 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-blue-50/80 to-transparent dark:from-primary/5"
          aria-hidden="true"
        />

        <div className="relative px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/20 blur-md" aria-hidden="true" />
              <svg className="relative -rotate-90" width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
                <circle
                  cx="40"
                  cy="40"
                  r={ringRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-slate-200/90 dark:text-white/10"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={ringRadius}
                  fill="none"
                  stroke="url(#digitalIdProgress)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="digitalIdProgress" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                {showPhoto ? (
                  <img
                    src={displayAvatarUrl}
                    alt=""
                    className="h-[3.75rem] w-[3.75rem] rounded-full object-cover ring-2 ring-white dark:ring-[#0f1623]"
                  />
                ) : (
                  <div
                    className={`grid h-[3.75rem] w-[3.75rem] place-items-center rounded-full font-black text-white ring-2 ring-white dark:ring-[#0f1623] ${
                      initials.length > 1 ? "text-sm" : "text-xl"
                    }`}
                    style={{ backgroundColor: avatarColor }}
                  >
                    {initials}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-slate-950 px-2 py-0.5 text-[9px] font-black tabular-nums text-white dark:bg-white dark:text-slate-950">
                {profileProgress}%
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-black leading-tight tracking-tight text-slate-950 dark:text-white">
                {displayName}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <ProfileBadge tone="primary" compact>
                  {roleLabel}
                </ProfileBadge>
                <ProfileBadge compact>{universityShort}</ProfileBadge>
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/90 via-white to-blue-50/40 shadow-sm dark:border-white/10 dark:from-white/[0.05] dark:via-white/[0.03] dark:to-primary/5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-3.5 py-2.5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-xs ring-1 ring-primary/10 dark:bg-primary/15">
                  🪪
                </span>
                <div>
                  <p className={sectionLabelClass}>A&apos;zo ID</p>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Barcha chatlarda bir xil</p>
                </div>
              </div>
              <span className="font-mono text-base font-black tabular-nums tracking-wider text-slate-950 dark:text-white">
                #{memberId}
              </span>
            </div>

            <div className="px-3.5 py-3">
              {!isProfileComplete ? (
                <div className="mb-3">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <span>Profil to'ldirish</span>
                    <span className="tabular-nums text-primary">{profileProgress}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-700"
                      style={{ width: `${profileProgress}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <p className={`leading-relaxed ${hintTextClass} text-slate-600 dark:text-slate-300`}>{narrative}</p>

              {joinedChatCount > 0 ? (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary ring-1 ring-primary/15">
                  💬 {joinedChatCount} ta chatda faol
                </p>
              ) : null}
            </div>
          </div>

          <div
            className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-dashed border-slate-200/80 px-3 py-2 dark:border-white/10"
            aria-hidden="true"
          >
            <div className="flex gap-1">
              {[...Array(12)].map((_, index) => (
                <span
                  key={index}
                  className="block h-5 w-0.5 rounded-full bg-slate-300/80 dark:bg-white/15"
                  style={{ height: `${10 + (index % 4) * 4}px` }}
                />
              ))}
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              MyUni.uz
            </span>
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
      className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-black shadow-sm transition ${
        copied
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300"
          : "border-slate-200 bg-white text-slate-700 hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:text-primary"
      }`}
    >
      {copied ? (
        <>
          <span aria-hidden="true">✓</span>
          Nusxalandi
        </>
      ) : (
        <>
          <span aria-hidden="true">📋</span>
          Nusxa olish
        </>
      )}
    </button>
  );
}

function ProfileSettingsForm({
  profile,
  universities,
  universityLabel,
  universityPlaceholder,
  universitySelectWarning,
  firstNameLabel,
  lastNameLabel,
  firstNameHint,
  lastNameHint,
  inputClassName,
  refreshUser,
}) {
  const toast = useToast();
  const matchedUniversity = matchUniversityByText(universities, profile?.university);
  const initialNames = splitFullName(profile?.full_name || "");
  const [editFirstName, setEditFirstName] = useState(initialNames.firstName);
  const [editLastName, setEditLastName] = useState(initialNames.lastName);
  const [editUniversity, setEditUniversity] = useState(
    matchedUniversity?.name || profile?.university || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const savedUniversity = matchedUniversity?.name || profile?.university || "";
  const savedFullName = (profile?.full_name || "").trim();
  const selectedUniversity = useMemo(
    () => matchUniversityByText(universities, editUniversity),
    [universities, editUniversity]
  );
  const previewInitials = getNameInitials(editFirstName, editLastName);
  const isDirty =
    buildFullName(editFirstName, editLastName).trim() !== savedFullName ||
    editUniversity.trim() !== savedUniversity.trim();

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedFirstName = editFirstName.trim();
    if (!trimmedFirstName) {
      toast.warning("Ism bo'sh bo'lmasligi kerak.");
      return;
    }
    const fullName = buildFullName(trimmedFirstName, editLastName);

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
        full_name: fullName,
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
      <div className="grid gap-4 md:grid-cols-2">
        <ProfileFormField id="profile-first-name" label={firstNameLabel} icon="✍️" hint={firstNameHint}>
          <input
            id="profile-first-name"
            value={editFirstName}
            onChange={(event) => setEditFirstName(event.target.value)}
            autoComplete="given-name"
            placeholder="Masalan: Alisher"
            className={inputClassName}
          />
        </ProfileFormField>

        <ProfileFormField
          id="profile-last-name"
          label={`${lastNameLabel} (ixtiyoriy)`}
          icon="🪪"
          hint={
            editLastName.trim()
              ? `Avatar: ${previewInitials} — 2 harf`
              : lastNameHint
          }
        >
          <input
            id="profile-last-name"
            value={editLastName}
            onChange={(event) => setEditLastName(event.target.value)}
            autoComplete="family-name"
            placeholder="Masalan: Qodirov"
            className={inputClassName}
          />
        </ProfileFormField>
      </div>

      <ProfileFormField
        id="profile-university"
        label={universityLabel}
        icon="🎓"
        hint={
          selectedUniversity?.location
            ? selectedUniversity.location
            : "Ro'yxatdan universitetni tanlang — qidiruv orqali topish oson."
        }
      >
        <UniversitySearchSelect
          universities={universities}
          value={editUniversity}
          onChange={setEditUniversity}
          disabled={isSaving || universities.length === 0}
          inputClassName={inputClassName}
          placeholder={universities.length === 0 ? "Yuklanmoqda..." : universityPlaceholder}
        />
      </ProfileFormField>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.04]">
        {isDirty ? (
          <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
            Saqlanmagan o&apos;zgarishlar
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="text-emerald-500" aria-hidden="true">
              ✓
            </span>
            Barcha ma&apos;lumotlar saqlangan
          </span>
        )}
        <button
          type="submit"
          disabled={isSaving || !editFirstName.trim() || !isDirty}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
        >
          {isSaving ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
              Saqlanmoqda...
            </>
          ) : (
            <>Saqlash</>
          )}
        </button>
      </div>
    </form>
  );
}
