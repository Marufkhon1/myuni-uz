import { useState } from "react";
import { deleteAvatar, updateProfileSettings, uploadAvatar } from "../../services/authService.js";
import { resolveMediaUrl } from "../../utils/media.js";
import UniversitySearchSelect, { matchUniversityByText } from "./UniversitySearchSelect.jsx";
import ChatColorPicker from "./ChatColorPicker.jsx";

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
  onOpenSection,
}) {
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isAvatarDeleting, setIsAvatarDeleting] = useState(false);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [isColorSaving, setIsColorSaving] = useState(false);
  const displayAvatarUrl = resolveMediaUrl(avatarPreview || savedAvatarUrl);
  const hasAvatar = Boolean(displayAvatarUrl);

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

  const roleLabel = isStudent ? "Talaba" : "Abituriyent";
  const avatarVisibility = profile?.avatar_visibility || "everyone";
  const avatarVisibilityLabel =
    avatarVisibility === "private_only"
      ? "Faqat shaxsiy chatda yozganlarga"
      : "Hammaga ko'rinadi";

  const hasUniversity = Boolean((userUniversity || profile?.university || "").trim());
  const universityShort =
    matchUniversityByText(universities, userUniversity || profile?.university)
      ?.short_name ||
    userUniversity ||
    profile?.university ||
    "—";

  const profileChecks = isStudent
    ? [
        { label: "Ism", done: Boolean((profile?.full_name || "").trim()) },
        { label: "Universitet", done: hasUniversity },
        { label: "Rasm", done: hasAvatar },
      ]
    : [
        { label: "Ism", done: Boolean((profile?.full_name || "").trim()) },
        { label: "Universitet", done: hasUniversity },
        { label: "Tanlov", done: hasUniversity },
      ];

  const completedChecks = profileChecks.filter((item) => item.done).length;
  const profileProgress = Math.round((completedChecks / profileChecks.length) * 100);

  const panelTitle = isStudent ? "Profil" : "Abituriyent profili";
  const universityLabel = isStudent ? "Universitet" : "Qiziqilgan universitet";
  const leftHint = isStudent
    ? "Tahrirlash o'ngdagi «Profil»da. Rasm ko'rinishi pastdagi sozlamalarda."
    : "Qaysi universitet haqida o'qimoqchi bo'lsangiz, shu yerga yozing. Sharhlar va taqqoslash bo'limlaridan foydalaning.";

  const guideSteps = isStudent
    ? [
        {
          title: "Ism va universitet",
          hint: "Formani to'ldiring va «Saqlash» bosing — chatlarga qo'shilish uchun kerak.",
          done: profileChecks[0].done && profileChecks[1].done,
        },
        {
          title: "Profil rasmi",
          hint: hasAvatar
            ? `Rasm bor. Ko'rinish: ${avatarVisibilityLabel.toLowerCase()}.`
            : "Chap tomondan rasm qo'shing (ixtiyoriy).",
          done: hasAvatar,
        },
        {
          title: "Chat va sharh yozish",
          hint:
            joinedChatCount > 0
              ? `${joinedChatCount} ta chatga qo'shilgansiz. Sharh yozishingiz mumkin.`
              : "Avval chatga qo'shiling, keyin sharh qoldiring.",
          done: joinedChatCount > 0,
          actionId: joinedChatCount > 0 ? "reviews" : "chats",
          actionLabel: joinedChatCount > 0 ? "Sharh yozish" : "Chatlarga o'tish",
        },
      ]
    : [
        {
          title: "Shaxsiy ma'lumot",
          hint: "Ismingizni kiriting — abituriyent sifatida tanilasiz.",
          done: profileChecks[0].done,
        },
        {
          title: "Qiziqilgan universitet",
          hint: hasUniversity
            ? `${universityShort} tanlangan. «Saqlash» bilan yangilang.`
            : "Qaysi OTM haqida o'qimoqchi bo'lsangiz, ro'yxatdan tanlang.",
          done: hasUniversity,
        },
        {
          title: "Sharhlarni o'qish",
          hint: "Talabalar tajribasini o'qing — yozish talabalarga ochiq.",
          done: hasUniversity,
          actionId: "reviews",
          actionLabel: "Sharhlarni ko'rish",
        },
        {
          title: "Universitetlarni solishtirish",
          hint: "Ikki ta OTMni yonma-yon taqqoslab, tanlovingizni aniqlashtiring.",
          done: hasUniversity,
          actionId: "compare",
          actionLabel: "Taqqoslash",
        },
      ];

  const avatarOptions = isStudent
    ? [
        {
          value: "everyone",
          title: "Hammaga ko'rinadi",
          hint: "Sharhlar, guruh chat, profil va shaxsiy xabarda rasm ko'rinadi.",
        },
        {
          value: "private_only",
          title: "Faqat shaxsiy chatda yozganlarga",
          hint: "Guruh chat va sharhlarda rasm ko'rinmaydi. Faqat shaxsiy xabarda ko'rinadi.",
        },
      ]
    : [
        {
          value: "everyone",
          title: "Hammaga ko'rinadi",
          hint: "Profil va boshqa bo'limlarda rasmingiz ko'rinadi.",
        },
        {
          value: "private_only",
          title: "Kamroq ko'rsatish",
          hint: "Abituriyent profilida rasm ko'rinmasligi mumkin. Shaxsiy aloqada ko'rinadi.",
        },
      ];

  const profileFieldInputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-400/25";

  return (
    <section className="space-y-6">
      <div className="grid gap-6 md:items-start xl:grid-cols-[320px_minmax(0,1fr)] xl:items-stretch">
        <div className="h-fit w-full max-w-sm justify-self-center rounded-[2rem] border border-slate-200 bg-white p-5 text-center shadow-soft sm:p-6 md:max-w-none md:justify-self-start xl:h-full xl:max-w-[320px] dark:border-white/10 dark:bg-white/[0.06]">
          <div className="relative mx-auto h-36 w-36">
            <div className="grid h-full w-full place-items-center overflow-hidden rounded-[2rem] bg-blue-50 text-5xl font-black text-primary dark:bg-blue-400/10">
              {hasAvatar ? (
                <img src={displayAvatarUrl} alt="Profil rasmi" className="h-full w-full object-cover" />
              ) : (
                displayName.slice(0, 1).toUpperCase()
              )}
            </div>
            {(isAvatarUploading || isAvatarDeleting) && (
              <div className="absolute inset-0 grid place-items-center rounded-[2rem] bg-slate-950/50 text-sm font-black text-white">
                {isAvatarDeleting ? "O'chirilmoqda..." : "Yuklanmoqda..."}
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <label
              className={`inline-flex cursor-pointer rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950 ${
                isAvatarUploading || isAvatarDeleting ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {hasAvatar ? "Rasmni almashtirish" : "Rasm qo'shish"}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
            </label>
            {hasAvatar && (
              <button
                type="button"
                onClick={handleAvatarDelete}
                className="rounded-full border border-red-200 px-5 py-3 text-sm font-black text-red-600"
              >
                O'chirish
              </button>
            )}
          </div>
          {avatarError && <p className="mt-3 text-sm font-semibold text-red-600">{avatarError}</p>}

          <div className="mt-6 border-t border-slate-100 pt-6 text-left dark:border-white/10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Hisob</p>
            <dl className="mt-3 space-y-3">
              <div>
                <dt className="text-[11px] font-black uppercase tracking-wide text-slate-400">Ism</dt>
                <dd className="mt-1 font-black text-slate-950 dark:text-white">{displayName || "—"}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-black uppercase tracking-wide text-slate-400">Email</dt>
                <dd className="mt-1 break-all text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {user?.email || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-black uppercase tracking-wide text-slate-400">Rol</dt>
                <dd className="mt-1">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-primary dark:bg-blue-400/15">
                    {roleLabel}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-black uppercase tracking-wide text-slate-400">{universityLabel}</dt>
                <dd className="mt-1 text-sm font-semibold leading-snug text-slate-700 dark:text-slate-200">
                  {userUniversity || profile?.university || "Tanlanmagan"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-black uppercase tracking-wide text-slate-400">Profil rasmi</dt>
                <dd className="mt-1 text-sm font-semibold leading-snug text-slate-600 dark:text-slate-300">
                  {avatarVisibilityLabel}
                </dd>
              </div>
            </dl>
            <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-5 text-slate-500 dark:bg-white/5 dark:text-slate-400">
              {leftHint}
            </p>
          </div>
        </div>

        <div className="flex h-fit min-h-0 w-full min-w-0 flex-col rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-6 xl:h-full dark:border-white/10 dark:bg-white/[0.06]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{panelTitle}</p>
          {!isStudent && (
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Universitet tanlang, sharhlarni o&apos;qing va taqqoslang — hozir yozish shart emas.
            </p>
          )}
          <ProfileSettingsForm
            key={`${profile?.full_name ?? ""}|${profile?.university ?? ""}`}
            profile={profile}
            universities={universities}
            universityLabel={universityLabel}
            inputClassName={profileFieldInputClass}
            refreshUser={refreshUser}
          />

          <div className="mt-5 flex min-h-0 flex-1 flex-col border-t border-slate-100 pt-5 text-left dark:border-white/10">
            <div className="flex items-center gap-3 overflow-hidden">
              <p className="shrink-0 text-xs font-black uppercase tracking-[0.18em] text-primary">Holat</p>
              <div className="flex shrink-0 items-center gap-1.5">
                {profileChecks.map((item) => (
                  <span
                    key={item.label}
                    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      item.done
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                    }`}
                  >
                    {item.done ? "✓" : "·"} {item.label}
                  </span>
                ))}
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <div
                  className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
                  role="progressbar"
                  aria-valuenow={profileProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Profil tayyorligi"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-primary transition-all duration-300"
                    style={{ width: `${profileProgress}%` }}
                  />
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs font-black tabular-nums text-slate-600 dark:text-slate-300">
                  {completedChecks}/{profileChecks.length}
                </span>
              </div>
            </div>

            <div className="mt-4 flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-100 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="grid gap-3 sm:grid-cols-3">
                {isStudent ? (
                  <>
                    <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-[11px] font-black uppercase text-slate-400">Qo&apos;shilgan chat</p>
                      <p className="mt-1 text-2xl font-black text-primary">{joinedChatCount}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-[11px] font-black uppercase text-slate-400">Rasm</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {avatarVisibility === "private_only" ? "Shaxsiy" : "Hammaga"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-[11px] font-black uppercase text-slate-400">Rol</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{roleLabel}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-[11px] font-black uppercase text-slate-400">Qiziqish</p>
                      <p className="mt-1 truncate text-sm font-black text-slate-800 dark:text-white">
                        {universityShort}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-[11px] font-black uppercase text-slate-400">Vazifa</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        O&apos;qish va tanlov
                      </p>
                    </div>
                    <div className="rounded-xl border border-violet-200/80 bg-violet-50 px-4 py-3 dark:border-violet-400/20 dark:bg-violet-400/10">
                      <p className="text-[11px] font-black uppercase text-violet-600 dark:text-violet-300">Rol</p>
                      <p className="mt-1 text-sm font-black text-violet-800 dark:text-violet-200">Abituriyent</p>
                    </div>
                  </>
                )}
              </div>

              <ul className="mt-4 space-y-2">
                {guideSteps.map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 dark:border-white/10 dark:bg-white/5"
                  >
                    <span
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-black ${
                        item.done
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-400 dark:bg-white/10"
                      }`}
                    >
                      {item.done ? "✓" : "·"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-slate-800 dark:text-white">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.hint}</p>
                      {item.actionId && onOpenSection && (
                        <button
                          type="button"
                          onClick={() => onOpenSection(item.actionId)}
                          className="mt-2 text-xs font-black text-primary hover:underline"
                        >
                          {item.actionLabel} →
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-auto pt-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                {isStudent
                  ? "Email chapdagi «Hisob»da. Rasm ko'rinishini pastdagi sozlamalardan o'zgartirasiz."
                  : "Sharh yozish faqat talabalar uchun. Siz o'qish va taqqoslash rejimidasiz."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ChatColorPicker
        displayName={displayName}
        userId={user?.id}
        selectedColor={profile?.chat_color || ""}
        resolvedColor={profile?.chat_color_resolved}
        isSaving={isColorSaving}
        onSelect={handleChatColorChange}
      />

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Sozlamalar</p>
        <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Profil rasmi ko'rinishi</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {isStudent
            ? "Avval «Rasm qo'shish» orqali yuklang — keyin kimlar ko'rishini tanlang."
            : "Rasm ixtiyoriy. Ko'rinishni tanlash shaxsiy profilingiz uchun."}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {avatarOptions.map((option) => {
            const isActive = (profile?.avatar_visibility || "everyone") === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={isSettingsSaving}
                onClick={() => handleAvatarVisibilityChange(option.value)}
                className={`rounded-3xl border p-5 text-left transition hover:-translate-y-0.5 ${
                  isActive
                    ? "border-primary bg-blue-50 shadow-soft dark:border-primary/50 dark:bg-blue-400/15"
                    : "border-slate-200 bg-slate-50 hover:border-primary/40 hover:bg-slate-100 hover:shadow-sm dark:border-white/15 dark:bg-white/5 dark:hover:border-primary/40 dark:hover:bg-white/10"
                }`}
              >
                <p className="font-black text-slate-950 dark:text-white">{option.title}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{option.hint}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProfileSettingsForm({ profile, universities, universityLabel, inputClassName, refreshUser }) {
  const matchedUniversity = matchUniversityByText(universities, profile?.university);
  const [editName, setEditName] = useState(profile?.full_name || "");
  const [editUniversity, setEditUniversity] = useState(
    matchedUniversity?.name || profile?.university || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-3 xl:grid xl:grid-cols-2 xl:items-start xl:gap-x-5 xl:gap-y-3"
    >
      <div className="flex flex-col xl:col-span-1">
        <label htmlFor="profile-full-name" className="text-[11px] font-black uppercase tracking-wide text-slate-400">
          Ism
        </label>
        <input
          id="profile-full-name"
          value={editName}
          onChange={(event) => setEditName(event.target.value)}
          autoComplete="name"
          className={`mt-1.5 ${inputClassName}`}
        />
        <p className="mt-1 h-4" aria-hidden="true" />
      </div>
      <div className="flex flex-col xl:col-span-1">
        <label htmlFor="profile-university" className="text-[11px] font-black uppercase tracking-wide text-slate-400">
          {universityLabel}
        </label>
        <div className="mt-1.5">
          <UniversitySearchSelect
            universities={universities}
            value={editUniversity}
            onChange={setEditUniversity}
            disabled={isSaving || universities.length === 0}
            inputClassName={inputClassName}
            reserveHintSpace
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
      {error && <p className="text-xs font-semibold text-red-600 xl:col-span-2">{error}</p>}
      <button
        type="submit"
        disabled={isSaving || !editName.trim()}
        className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50 xl:col-span-2 dark:bg-white dark:text-slate-950"
      >
        {isSaving ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
}
