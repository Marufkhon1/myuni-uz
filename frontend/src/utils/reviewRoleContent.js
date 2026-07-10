/** Sharhlar bo'limi — talaba yozadi, abituriyent o'qiydi. */

import { REVIEW_MODERATION_FOOTER_NOTE } from "@/content/reviewModerationCopy.js";

export function getReviewListContent(isStudent) {
  if (isStudent) {
    return {
      title: "Sharh yozish",
      subtitle: "O'qiyotgan yoki tanlangan OTM",
      searchPlaceholder: "OTM qidiring...",
    };
  }

  return {
    title: "Sharhlarni ko'rish",
    subtitle: "Qiziqayotgan universitet",
    searchPlaceholder: "Universitet qidiring...",
  };
}

export function getReviewPanelContent(isStudent) {
  if (isStudent) {
    return {
      canWriteReview: true,
      bannerEyebrow: "Sharh va tajriba",
      statsTitle: "Universitet ko'rsatkichlari",
      statLabels: {
        rating: "O'rtacha baho",
        reviews: "Sharhlar",
        likes: "Like jami",
        chat: "Chat a'zolari",
      },
      distributionTitle: "Baholar taqsimoti",
      featuredLabel: "Eng ko'p yoqqan sharh",
      reviewsHeading: "Barcha sharhlar",
      reviewsSubheading: "Talabalar fikri",
      emptyTitle: "Hali sharh yo'q",
      emptyHint: "Birinchi sharhingizni qoldiring — keyin yana yozishingiz mumkin.",
      notice: null,
      defaultSort: "newest",
      likeButtonLabel: "Foydali",
      placeholderTitle: "Avval universitetni tanlang",
      placeholderDescription:
        "Chap ro'yxatdan universitetni tanlang — sharh yozish, statistika va talabalar fikri shu yerda.",
      formTitle: "Yangi sharh",
      formSubtitle: null,
      formPlaceholder: "O'qish muhiti, ustozlar, yotoqxona, imkoniyatlar haqida yozing...",
      formOverallLabel: "Qanday baho berasiz?",
      formAspectHint: "Har bir yo'nalish alohida — aniqroq sharh beradi",
      formFooterNote: REVIEW_MODERATION_FOOTER_NOTE,
    };
  }

  return {
    canWriteReview: false,
    bannerEyebrow: "Tanlov uchun",
    statsTitle: "Tanlov bo'yicha qisqa xulosa",
    statLabels: {
      rating: "Talabalar bahosi",
      reviews: "Sharhlar soni",
      likes: "Ishonch (like)",
      chat: "Chat faolligi",
    },
    distributionTitle: "Baholar taqsimoti",
    featuredLabel: "Tanlov uchun — eng ishonchli sharh",
    reviewsHeading: "Talabalar tajribasi",
    reviewsSubheading: "O'qish va tanlov uchun",
    emptyTitle: "Hali sharh yo'q",
    emptyHint: "Bu universitet haqida hali talaba sharhi kelmagan. Chatda savol berishingiz mumkin.",
    notice: "Sharh yozish faqat talabalarga. Siz sharhlarni o'qishingiz va taqqoslashingiz mumkin.",
    defaultSort: "likes",
    likeButtonLabel: "Foydali",
    placeholderTitle: "Universitet tanlang",
    placeholderDescription:
      "Chap ro'yxatdan qiziqayotgan OTMni tanlang — reyting, taqsimot va talabalar sharhlari shu yerda.",
    formTitle: null,
    formPlaceholder: null,
  };
}

export function getReviewSortOptions(isStudent) {
  const options = [
    { id: "likes", label: "Eng ko'p like" },
    { id: "rating_high", label: "Eng yuqori baho" },
    { id: "newest", label: "Eng yangi" },
    { id: "oldest", label: "Eng eski" },
  ];
  if (!isStudent) {
    return options;
  }
  return [
    { id: "newest", label: "Eng yangi" },
    { id: "likes", label: "Eng ko'p like" },
    { id: "rating_high", label: "Eng yuqori baho" },
    { id: "oldest", label: "Eng eski" },
  ];
}
