/** Sharh + chat moderatsiyasi — qoida va UX matnlari (frontend). */

export const PROFANITY_SCOPE = {
  reviews: "reviews",
  chat: "chat",
};

export const ACTIVE_PROFANITY_SCOPES = new Set([
  PROFANITY_SCOPE.reviews,
  PROFANITY_SCOPE.chat,
]);

/** API bilan bir xil rad xabari */
export const PROFANITY_REJECTION_MESSAGE =
  "Sizniki moderatsiyadan o'tmadi. Iltimos, odobli til bilan qayta yozing.";

export const REVIEW_MODERATION_FOOTER_NOTE =
  "Haqorat va so'kinish taqiqlangan — bunday matn darhol rad etiladi. Odobli sharhlar tez tasdiqlanadi. Shaxsiy ma'lumot yozmang.";

export const REVIEW_MODERATION_SHORT_RULES = [
  "Haqorat, so'kinish va kamsituvchi so'zlar taqiqlangan (buzib yozilgan shakllar ham).",
  "Shaxsiy ma'lumot (telefon, manzil) yozmang.",
  "Toza, odobli sharhlar avtomatik tasdiqlanadi va saytda ko'rinadi.",
];

export const REVIEW_GUIDELINES_HREF = "/sharh-qoidalari";

export const REVIEW_APPROVED_TOAST = "Sharhingiz tasdiqlandi va saytda ko'rinadi.";

export const REVIEW_PENDING_TOAST =
  "Sharh yuborildi. Moderator tasdiqlagach saytda ko'rinadi.";

export const REVIEW_MODERATION_SCOPE_NOTE =
  "Sharhlar va chat xabarlari bir xil filterdan o'tadi.";

/** Step 6 — forma xatosi + CTA */
export const REVIEW_REWRITE_CTA_LABEL = "Qayta yozish";

export const REVIEW_MODERATION_ERROR_HINT =
  "Matnni odobli qilib qayta yozing — toza sharhlar darhol tasdiqlanadi.";

export function isModerationRejectionMessage(message = "") {
  const value = String(message || "")
    .toLowerCase()
    .replace(/[‘’ʻʼ']/g, "'");
  return value.includes("moderatsiyadan o'tmadi");
}
