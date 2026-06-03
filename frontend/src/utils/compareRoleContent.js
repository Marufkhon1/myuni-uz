/** Taqqoslash — talaba va abituriyent matnlari. */

import { OWNERSHIP_LABELS } from "./universityCatalog.js";

function formatOwnershipValue(value) {
  if (!value) {
    return "—";
  }
  return OWNERSHIP_LABELS[value] || value;
}

export function getCompareContent(isStudent) {
  if (isStudent) {
    return {
      eyebrow: "Taqqoslash",
      title: "OTMlarni solishtiring",
      subtitle:
        "Aynan 3 ta universitetni yonma-yon jadvalda ko'ring — reyting, sharhlar, chat va talaba baholari.",
      myUniversityLabel: "Mening universitetimni qo'shish",
      maxLabel: "3 ta OTM tanlang — barcha slotlar to'lganda natija chiqadi",
      pickerHint: "Ro'yxatdan tanlang — avtomatik bo'sh slotga qo'shiladi",
      quickPickLabel: "Tez tanlash (3 ta OTM)",
      emptyHint: "Taqqoslash uchun 3 ta turli universitet tanlang.",
      verdictTitle: "Umumiy natija",
      matrixHint: "Ko'rsatkichlar jadvali",
      metricsTitle: "Ko'rsatkich",
      aspectsTitle: "Mezon bo'yicha",
      detailsTitle: "Har bir OTM batafsil",
      recommendedLabel: "Tavsiya etiladi",
      winRowsLabel: "ko'rsatkichda yetakchi",
    };
  }

  return {
    eyebrow: "Tanlov uchun",
    title: "Qaysi OTM sizga mos?",
    subtitle: "3 ta universitetni bir jadvalda solishtirib, tanlovingizni osonlashtiring.",
    myUniversityLabel: "Qiziqishimni qo'shish",
    maxLabel: "3 ta OTM tanlang — barcha slotlar to'lganda natija chiqadi",
    pickerHint: "Qidiruv orqali qo'shing — bir xil OTM ikki marta qo'shilmaydi",
    quickPickLabel: "Mashhur kombinatsiyalar (3 ta)",
    emptyHint: "Taqqoslash uchun 3 ta universitet tanlang.",
    verdictTitle: "Qaysi biri yaxshiroq?",
    matrixHint: "Asosiy farqlar",
    metricsTitle: "Ko'rsatkich",
    aspectsTitle: "Talabalar baholari",
    detailsTitle: "Har bir OTM haqida",
    recommendedLabel: "Tanlov uchun tavsiya",
    winRowsLabel: "ko'rsatkichda yetakchi",
  };
}

export const COMPARE_METRIC_GROUPS = [
  {
    id: "core",
    label: "Asosiy ko'rsatkichlar",
    keys: [
      "average_rating",
      "composite_aspect_score",
      "review_count",
      "positive_review_percent",
      "total_likes",
    ],
  },
  {
    id: "community",
    label: "Jamiyat va faollik",
    keys: ["member_count", "message_count", "favorites_count"],
  },
  {
    id: "profile",
    label: "Umumiy ma'lumot",
    keys: [
      "city",
      "location",
      "institution_label",
      "ownership_label",
      "founded_year",
      "website_label",
      "faculty_count",
      "direction_count",
    ],
  },
  {
    id: "admission",
    label: "Qabul ma'lumotlari",
    keys: [
      "admission_year",
      "grant_quota_total",
      "contract_quota_total",
      "min_admission_score",
      "max_admission_score",
    ],
  },
];

export const COMPARE_METRICS = [
  {
    key: "average_rating",
    label: "Umumiy reyting",
    icon: "★",
    alwaysShow: true,
    format: (value) => (value != null ? `${value}/5` : "—"),
    bar: true,
  },
  {
    key: "composite_aspect_score",
    label: "Talaba baho o'rtachasi",
    icon: "📈",
    format: (value) => (value != null ? `${value}/5` : "—"),
    bar: true,
  },
  {
    key: "review_count",
    label: "Sharhlar soni",
    icon: "💬",
    alwaysShow: true,
    allowZero: true,
    format: (value) => `${value ?? 0}`,
    bar: true,
  },
  {
    key: "positive_review_percent",
    label: "4–5 yulduzli sharhlar",
    icon: "✨",
    format: (value) => (value != null ? `${value}%` : "—"),
    bar: true,
  },
  {
    key: "total_likes",
    label: "Foydali like'lar",
    icon: "👍",
    allowZero: true,
    format: (value) => `${value ?? 0}`,
    bar: true,
  },
  {
    key: "member_count",
    label: "Chat a'zolari",
    icon: "👥",
    alwaysShow: true,
    allowZero: true,
    format: (value) => `${value ?? 0} a'zo`,
    bar: true,
  },
  {
    key: "message_count",
    label: "Chat xabarlari",
    icon: "💭",
    allowZero: true,
    format: (value) => `${value ?? 0} ta`,
    bar: true,
  },
  {
    key: "favorites_count",
    label: "Sevimlilar",
    icon: "❤️",
    allowZero: true,
    format: (value) => `${value ?? 0} ta`,
    bar: true,
  },
  {
    key: "city",
    label: "Shahar",
    icon: "📍",
    alwaysShow: true,
    format: (value) => value || "—",
    text: true,
  },
  {
    key: "location",
    label: "Manzil / viloyat",
    icon: "🗺️",
    format: (value) => value || "—",
    text: true,
  },
  {
    key: "institution_label",
    label: "Muassasa turi",
    icon: "🏫",
    format: (value) => value || "—",
    text: true,
  },
  {
    key: "ownership_label",
    label: "Mulkchilik",
    icon: "🏛️",
    format: formatOwnershipValue,
    text: true,
  },
  {
    key: "founded_year",
    label: "Tashkil etilgan",
    icon: "📅",
    format: (value) => (value ? `${value}-yil` : "—"),
    compareWinner: false,
  },
  {
    key: "website_label",
    label: "Rasmiy sayt",
    icon: "🌐",
    format: (value) => value || "—",
    text: true,
  },
  {
    key: "faculty_count",
    label: "Fakultetlar",
    icon: "🎓",
    allowZero: true,
    format: (value) => `${value ?? 0} ta`,
    bar: true,
  },
  {
    key: "direction_count",
    label: "Yo'nalishlar",
    icon: "📚",
    allowZero: true,
    format: (value) => `${value ?? 0} ta`,
    bar: true,
  },
  {
    key: "admission_year",
    label: "Qabul yili",
    icon: "🗓️",
    format: (value) => value || "—",
    text: true,
  },
  {
    key: "grant_quota_total",
    label: "Grant kvotasi",
    icon: "🎯",
    format: (value) => (value != null ? `${value} ta` : "—"),
    bar: true,
  },
  {
    key: "contract_quota_total",
    label: "Kontrakt kvotasi",
    icon: "💳",
    format: (value) => (value != null ? `${value} ta` : "—"),
    bar: true,
  },
  {
    key: "min_admission_score",
    label: "Minimal ball",
    icon: "📊",
    format: (value) => (value != null ? String(value) : "—"),
    bar: true,
    higherIsBetter: false,
  },
  {
    key: "max_admission_score",
    label: "Maksimal ball",
    icon: "📈",
    format: (value) => (value != null ? String(value) : "—"),
    bar: true,
  },
];

export const COMPARE_ASPECTS = [
  { key: "teachers", label: "O'qituvchilar", icon: "👨‍🏫" },
  { key: "dormitory", label: "Yotoqxona", icon: "🏠" },
  { key: "infrastructure", label: "Infratuzilma", icon: "🏛️" },
];

/** «Qaysi ko'rsatkichda kim oldin?» — faqat asosiy qatorlar */
export const COMPARE_BREAKDOWN_KEYS = [
  "average_rating",
  "review_count",
  "member_count",
  "composite_aspect_score",
];

export const PUBLIC_COMPARE_CONTENT = {
  eyebrow: "MyUni.uz taqqoslash",
  title: "Universitetlar taqqoslashi",
  subtitle: "Faqat ko'rish uchun — 2 kun ichida amal qiladi.",
  verdictTitle: "Umumiy natija",
  metricsTitle: "Ko'rsatkich",
  aspectsTitle: "Talabalar baholari",
  detailsTitle: "Har bir OTM batafsil",
  recommendedLabel: "Tavsiya",
  winRowsLabel: "ko'rsatkichda yetakchi",
};
