/** Taqqoslash — talaba va abituriyent matnlari. */

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
