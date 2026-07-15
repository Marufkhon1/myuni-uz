/** Phase 5 — Qabul qo'llanmasi (editorial guide hub). */
export const admissionGuideDocument = {
  slug: "qabul-qollanmasi",
  title: "Qabul qo'llanmasi",
  description:
    "Abituriyentlar uchun O'zbekiston OTMlariga qabul: muddatlar, hujjatlar, grant/kontrakt va MyUni da qayerdan tekshirish.",
  updatedAt: "2026-yil iyul",
  disclaimer:
    "Rasmiy murjatnomalar har yil yangilanadi. Bu sahifa umumiy navigatsiya — yakuniy manba qabul komissiyasi.",
  steps: [
    {
      title: "1. Maqsadni aniqlang",
      body: "Shahar, yo'nalish, grant/kontrakt va soft reytingni yonma-yon ko'ring — bitta signalga tayanmang.",
      links: [
        { label: "Katalog", to: "/universitetlar" },
        { label: "Yo'nalishlar", to: "/yo-nalishlar" },
        { label: "Soft reyting", to: "/reyting" },
      ],
    },
    {
      title: "2. Qabul silolarini o'qing",
      body: "Har bir universitetning /qabul sahifasida ochiq tsikllar (agar mavjud) ko'rsatiladi.",
      links: [
        { label: "Masalan: katalogdan OTM tanlang", to: "/universitetlar" },
      ],
    },
    {
      title: "3. Sharh va taqqoslash",
      body: "Talaba tajribasi soft signal. 2–4 ta OTMni /taqqoslash da solishtiring.",
      links: [
        { label: "Taqqoslash", to: "/taqqoslash" },
        { label: "Metodologiya", to: "/metodologiya" },
      ],
    },
    {
      title: "4. Grant / kontrakt konteksti",
      body: "Kvota va ballarni stipendiyalar hubida tushuntiramiz; raqamlar rasmiy manbadan.",
      links: [{ label: "Stipendiyalar", to: "/stipendiyalar" }],
    },
  ],
  checklist: [
    "Pasport / ID va attestat nusxalari",
    "DTM yoki kirish imtihoni natijalari (yilga qarab)",
    "Tanlangan yo'nalish kodi / nomi",
    "Kontrakt shartnomasini o'qib chiqish",
    "Yotoqxona / transport rejasini oldindan bilish",
  ],
};
