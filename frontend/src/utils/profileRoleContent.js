/** Profil bo'limi — bir xil layout, rol bo'yicha faqat matnlar. */

export function getProfileContent(isStudent) {
  return {
    roleLabel: isStudent ? "Talaba" : "Abituriyent",
    universityLabel: isStudent ? "Ta'lim olayotgan universitet" : "Qiziqadigan universitet",
    universityShortLabel: isStudent ? "Universitet" : "Qiziqilgan OTM",
    universityPlaceholder: isStudent
      ? "Ta'lim olayotgan universitetni qidiring..."
      : "Qiziqadigan universitetni qidiring...",
    universitySelectWarning: isStudent
      ? "Ta'lim olayotgan universitetni ro'yxatdan tanlang."
      : "Qiziqadigan universitetni ro'yxatdan tanlang.",
    profileCheckLabels: {
      name: "Ism",
      university: isStudent ? "Universitet" : "Qiziqilgan OTM",
      avatar: "Rasm",
    },
    firstNameLabel: "Ism",
    lastNameLabel: "Familiya",
    firstNameHint: "Chatda ko'rinadigan ismingiz.",
    lastNameHint: "Ixtiyoriy — yozsangiz avatar 2 harf (masalan AN).",
    avatarOptions: [
      {
        value: "everyone",
        title: "Hammaga ko'rinadi",
        hint: isStudent ? "Sharh, chat va profilda" : "Profil va bo'limlarda",
      },
      {
        value: "private_only",
        title: isStudent ? "Faqat shaxsiy chat" : "Kamroq ko'rsatish",
        hint: isStudent ? "Guruh va sharhlarda yashirin" : "Asosan shaxsiy aloqada",
      },
    ],
    avatarVisibilityPublic: isStudent ? "Barcha bo'limlarda ko'rinadi" : "Profil va chatda ko'rinadi",
    avatarVisibilityPrivate: isStudent
      ? "Guruh chat va sharhlarda yashirin"
      : "Guruh chatda kamroq ko'rinadi",
    bioDescription: isStudent
      ? "Boshqa foydalanuvchilar profilingizda ko'radi · 3–70 belgi"
      : "Talabalar va chat a'zolari ko'radi · 3–70 belgi",
  };
}

export function getProfileDigitalIdNarrative(isStudent, context) {
  const {
    isProfileComplete,
    profileProgress,
    nextStep,
    universityShort,
    joinedChatCount,
  } = context;

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
}
