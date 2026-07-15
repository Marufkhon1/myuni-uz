/** Phase 5 — Stipendiyalar / grantlar hub (editorial, curated). */
export const scholarshipsDocument = {
  slug: "stipendiyalar",
  title: "Stipendiyalar va grantlar",
  description:
    "O'zbekistonda bakalavriat/magistratura uchun grant, kontrakt, chegirma va stipendiyalarni tushunish — MyUni.uz ochiq qo'llanma.",
  updatedAt: "2026-yil iyul",
  disclaimer:
    "Bu sahifa rasmiy davlat stipendiyalar reyestri emas. Aniq kvota va ballarni qabul komissiyasi / rasmiy manbalardan tekshiring.",
  sections: [
    {
      heading: "Grant vs kontrakt — qisqa farq",
      body: `• Grant — davlat byudjeti hisobidan o'qish (tanlov asosida).
• Kontrakt — shartnoma asosida to'lov; muassasa tariflari yildan-yilga o'zgarishi mumkin.
• MyUni soft reytingi grant/kontrakt qarorini avtomatik qilmaydi — bu faqat talaba tajribasi signalidir.`,
    },
    {
      heading: "Qayerdan boshlash kerak?",
      body: `1. Qabul qo'llanmasi — umumiy jarayon va checklist.
2. Universitet qabul silosi — muddat va ochiq ma'lumotlar.
3. Yo'nalishlar qidiruvi — mutaxassislik bo'yicha filtrlash.
4. Rasmiy OTM qabul bo'limi — yakuniy manba.`,
    },
  ],
  items: [
    {
      id: "davlat-granti",
      title: "Davlat granti (bakalavriat)",
      summary:
        "DTM / kirish imtihonlari natijalari va kvotalar asosida. Har yil e'lon qilingan kvotalarni kuzating.",
      audience: "Abituriyent",
      links: [
        { label: "Qabul qo'llanmasi", to: "/qabul-qollanmasi" },
        { label: "Yo'nalishlar", to: "/yo-nalishlar" },
      ],
    },
    {
      id: "magistratura",
      title: "Magistratura grant / kontrakt",
      summary:
        "Bakalavrdan keyingi daraja — alohida tanlov va kvotalar. Fakultet silolarida daraja filtri bilan qidiring.",
      audience: "Bitiruvchi / magistrant",
      links: [
        { label: "Magistratura yo'nalishlari", to: "/yo-nalishlar?degree=master" },
      ],
    },
    {
      id: "muassasa-chegirma",
      title: "Muassasa chegirmalari",
      summary:
        "Ba'zi OTMlar kontraktga chegirma yoki ichki stipendiyalar e'lon qiladi. Bu MyUni katalogida to'liq emas — rasmiy saytni tekshiring.",
      audience: "Barcha",
      links: [
        { label: "Universitetlar", to: "/universitetlar" },
        { label: "Hamkorlar haqida", to: "/hamkorlar" },
      ],
    },
    {
      id: "xorij",
      title: "Xorijdagi stipendiyalar",
      summary:
        "Xorij dasturlari (DAAD, Chevening va boshqalar) uchun alohida rehberlar tayyorlanmoqda. Hozir asosiy yo'nalish — O'zbekistondagi grant, kontrakt va muassasa chegirmalarini tushunish.",
      audience: "Xorij",
      links: [{ label: "Maqolalar", to: "/maqolalar" }],
    },
  ],
};
