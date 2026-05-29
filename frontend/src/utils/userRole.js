/** Profil roli bo'yicha talaba ekanini tekshiradi (URL emas, API profili). */
export function isStudentProfile(profile) {
  return profile?.role === "student";
}

/** Sharh yozish huquqi — faqat tasdiqlangan talaba profili. */
export function canWriteReviews(profile) {
  return isStudentProfile(profile);
}
