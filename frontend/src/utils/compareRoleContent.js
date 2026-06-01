/** Taqqoslash — talaba va abituriyent matnlari (Niche / US News uslubi). */

export function getCompareContent(isStudent) {
  if (isStudent) {
    return {
      eyebrow: "Taqqoslash",
      title: "OTMlarni solishtiring",
      subtitle: "Reyting, sharhlar, chat va mezonlar bo'yicha yonma-yon ko'ring.",
      myUniversityLabel: "Mening universitetimni qo'yish",
      slotA: "1-chi OTM",
      slotB: "2-chi OTM",
      quickPickLabel: "Tez tanlash",
      emptyHint: "Ikkita turli universitet tanlang — natija avtomatik chiqadi.",
      verdictTitle: "Umumiy natija",
      metricsTitle: "Ko'rsatkichlar",
      aspectsTitle: "Mezon bo'yicha",
      detailsTitle: "Batafsil",
    };
  }

  return {
    eyebrow: "Tanlov uchun",
    title: "Qaysi OTM sizga mos?",
    subtitle: "Qiziqayotgan universitetlarni solishtirib, tanlovingizni osonlashtiring.",
    myUniversityLabel: "Qiziqishimni qo'yish",
    slotA: "1-chi tanlov",
    slotB: "2-chi tanlov",
    quickPickLabel: "Mashhur juftliklar",
    emptyHint: "Ikkita universitet tanlang — qaysi biri yuqori ekanini ko'ring.",
    verdictTitle: "Qaysi biri yaxshiroq?",
    metricsTitle: "Asosiy ko'rsatkichlar",
    aspectsTitle: "Talabalar baholari",
    detailsTitle: "Har bir OTM haqida",
  };
}

export const COMPARE_METRICS = [
  {
    key: "average_rating",
    label: "Umumiy reyting",
    max: 5,
    format: (value) => (value != null ? `${value}/5` : "—"),
    bar: true,
  },
  {
    key: "review_count",
    label: "Sharhlar soni",
    format: (value) => `${value ?? 0}`,
    bar: true,
  },
  {
    key: "member_count",
    label: "Chat faolligi",
    format: (value) => `${value ?? 0} a'zo`,
    bar: true,
  },
];

export const COMPARE_ASPECTS = [
  { key: "teachers", label: "O'qituvchilar", icon: "👨‍🏫" },
  { key: "dormitory", label: "Yotoqxona", icon: "🏠" },
  { key: "infrastructure", label: "Infratuzilma", icon: "🏛️" },
];
