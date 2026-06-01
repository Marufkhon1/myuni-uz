import { useEffect, useMemo, useState } from "react";
import UniversityAvatar from "../UniversityAvatar.jsx";
import UniversitySearchSelect from "./UniversitySearchSelect.jsx";
import ModalOverlay from "../ui/ModalOverlay.jsx";
import { useToast } from "../../hooks/useToast.js";
import { updateProfileSettings } from "../../services/authService.js";
import { getApiErrorMessage } from "../../utils/apiErrors.js";
import { getInitialOnboardingStep, markOnboardingComplete } from "../../utils/onboardingStorage.js";
import { matchUniversityByText } from "../../utils/universityMatch.js";

const steps = [
  {
    title: "Profilni to'ldiring",
    subtitle: "Ismingiz va qisqa bio — chatda va sharhlarda ko'rinadi.",
  },
  {
    title: "Universitetni tanlang",
    subtitle: "Talaba yoki abituriyent sifatida qaysi OTM bilan bog'lanishni belgilang.",
  },
  {
    title: "Chatga qo'shiling",
    subtitle: "Tanlangan universitet guruhida talabalar bilan muloqot qiling.",
  },
];

export default function OnboardingWizard({
  open,
  onClose,
  profile,
  displayName,
  universities,
  isStudent,
  joinedChatCount,
  onRefreshUser,
  onJoinChat,
  onGoToChats,
}) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [universityText, setUniversityText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setStep(getInitialOnboardingStep({ profile, joinedChatCount, universities }));
    setFullName(profile?.full_name || displayName || "");
    setBio(profile?.bio || "");
    setUniversityText(profile?.university || "");
  }, [open, profile, displayName, joinedChatCount, universities]);

  const matchedUniversity = useMemo(
    () => matchUniversityByText(universities, universityText),
    [universities, universityText]
  );

  if (!open) {
    return null;
  }

  function handleSkipAll() {
    markOnboardingComplete();
    onClose();
  }

  async function saveProfileFields(fields) {
    setIsSaving(true);
    try {
      await updateProfileSettings(fields);
      await onRefreshUser?.();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Saqlab bo'lmadi. Qayta urinib ko'ring."));
      throw requestError;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleNextFromProfile() {
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      toast.warning("Ism kamida 2 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    try {
      await saveProfileFields({
        full_name: trimmedName,
        bio: bio.trim(),
      });
      setStep(1);
    } catch {
      // error set in saveProfileFields
    }
  }

  async function handleNextFromUniversity() {
    const trimmedUniversity = universityText.trim();
    if (trimmedUniversity.length < 2) {
      toast.warning("Universitet nomini kiriting yoki ro'yxatdan tanlang.");
      return;
    }
    try {
      await saveProfileFields({ university: trimmedUniversity });
      setStep(2);
    } catch {
      // error set in saveProfileFields
    }
  }

  async function handleJoinChat() {
    if (!matchedUniversity) {
      toast.warning("Avval universitetni tanlang.");
      return;
    }
    setIsJoining(true);
    try {
      await onJoinChat(matchedUniversity.id);
      markOnboardingComplete();
      onGoToChats?.();
      onClose();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Chatga qo'shilib bo'lmadi."));
    } finally {
      setIsJoining(false);
    }
  }

  function handleFinishLater() {
    markOnboardingComplete();
    onClose();
  }

  const current = steps[step];

  return (
    <ModalOverlay
      onClose={handleSkipAll}
      labelledBy="onboarding-title"
      zIndexClass="z-[70]"
      closeLabel="Yo'riqnomani yopish"
      panelClassName="mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
    >
        <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-violet-50/60 px-6 py-5 dark:border-white/10 dark:from-blue-400/10 dark:to-violet-400/10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            Boshlang&apos;ich yo&apos;riqnoma · {step + 1}/{steps.length}
          </p>
          <h2 id="onboarding-title" className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
            {current.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{current.subtitle}</p>
          <div className="mt-4 flex gap-2">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full transition ${
                  index <= step ? "bg-primary" : "bg-slate-200 dark:bg-white/15"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          {step === 0 && (
            <>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">To&apos;liq ism</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white"
                  placeholder="Masalan: Ali Valiyev"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Bio (ixtiyoriy)
                </span>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={3}
                  maxLength={70}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white"
                  placeholder="Qisqacha o'zingiz haqingizda..."
                />
              </label>
            </>
          )}

          {step === 1 && (
            <UniversitySearchSelect
              universities={universities}
              value={universityText}
              onChange={setUniversityText}
              label={isStudent ? "O'qiyotgan universitet" : "Qiziqayotgan universitet"}
              placeholder="Universitet qidiring..."
            />
          )}

          {step === 2 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
              {matchedUniversity ? (
                <div className="flex items-center gap-4">
                  <UniversityAvatar university={matchedUniversity} size="lg" />
                  <div className="min-w-0">
                    <p className="text-lg font-black text-slate-950 dark:text-white">
                      {matchedUniversity.short_name || matchedUniversity.name}
                    </p>
                    <p className="text-sm text-slate-500">{matchedUniversity.location}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-500">
                  Universitet topilmadi. Oldingi qadamda universitetni tanlang.
                </p>
              )}
              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Guruh chatida mavjud talabalardan qabul, yotoqxona va o&apos;qish hayoti haqida savol bering.
              </p>
            </div>
          )}

        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <button
            type="button"
            onClick={handleSkipAll}
            className="text-sm font-bold text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            O&apos;tib ketish
          </button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((value) => value - 1)}
                disabled={isSaving || isJoining}
                className="btn-modal-secondary"
              >
                Orqaga
              </button>
            )}
            {step === 0 && (
              <button type="button" onClick={handleNextFromProfile} disabled={isSaving} className="btn-modal-gradient rounded-full px-6 py-2.5 text-sm">
                {isSaving ? "Saqlanmoqda..." : "Keyingi"}
              </button>
            )}
            {step === 1 && (
              <button type="button" onClick={handleNextFromUniversity} disabled={isSaving} className="btn-modal-gradient rounded-full px-6 py-2.5 text-sm">
                {isSaving ? "Saqlanmoqda..." : "Keyingi"}
              </button>
            )}
            {step === 2 && (
              <>
                <button type="button" onClick={handleFinishLater} className="btn-modal-secondary">
                  Keyinroq
                </button>
                <button
                  type="button"
                  onClick={handleJoinChat}
                  disabled={isJoining || !matchedUniversity}
                  className="btn-modal-gradient rounded-full px-6 py-2.5 text-sm"
                >
                  {isJoining ? "Qo'shilmoqda..." : "Chatga qo'shilish"}
                </button>
              </>
            )}
          </div>
        </div>
    </ModalOverlay>
  );
}
