import { CURRENT_RANKING_YEAR, rankingsYearPath } from "@/config/rankings.js";

export const rankingsDocument = {
  title: "MyUni soft reyting",
  description:
    "Talabalar sharhlariga asoslangan MyUni.uz soft reytingi — Bayesian ishonch og'irligi bilan. Bu vazirlik yoki QS reytingi emas.",
  hubDescription:
    "Yillar bo'yicha MyUni soft reyting indeksi. Jonli jadval — tasdiqlangan sharhlardan Bayesian tartib; muzlatilgan arxiv keyinroq. Vazirlik yoki QS emas.",
  yearDescription: (year) =>
    `${year}-yil MyUni soft reyting jadvali — kamida 3 ta tasdiqlangan sharh bo'lgan OTMlar, Bayesian soft ball va ishonch darajasi. Rasmiy vazirlik yoki QS reytingi emas.`,
  updatedAt: `${CURRENT_RANKING_YEAR}-yil`,
  honestyBanner:
    "Bu rasmiy davlat yoki xalqaro (QS / THE) reyting emas. Jadval — moderatsiyadan o'tgan talabalar sharhlarining soft (Bayesian) tartibi.",
  sources: [
    { label: "Tasdiqlangan talabalar sharhlari", href: "/sharh-qoidalari" },
    { label: "Ochiq metodologiya", href: "/metodologiya" },
    { label: "Ishonch va xavfsizlik", href: "/ishonch-xavfsizlik" },
  ],
  liveYearPath: rankingsYearPath(),
};
