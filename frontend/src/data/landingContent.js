export const landingFeatureCards = [
  {
    title: "Haqiqiy sharhlar",
    description:
      "Talabalarning o'qish jarayoni, yotoqxona, kampus hayoti va imkoniyatlar haqidagi batafsil fikrlarini o'qing.",
    metricKey: "review_count",
    label: "Sharhlar",
  },
  {
    title: "Universitet reytinglari",
    description:
      "Ta'lim sifati, sharoit, talabalar fikri va umumiy muhit bo'yicha universitetlarni solishtiring.",
    metricKey: "university_count",
    label: "Universitet",
  },
  {
    title: "Talabalar hamjamiyati",
    description:
      "Abituriyentlar savol beradigan, talabalar esa real tajribasi bilan bo'lishadigan joy.",
    metricKey: "member_count",
    label: "Ro'yxatdan o'tgan",
  },
  {
    title: "OTM guruh chatlari",
    description:
      "Qabul, grant, yo'nalishlar, yotoqxona va kundalik talabalik hayoti bo'yicha ochiq suhbatlar.",
    metricKey: "message_count",
    label: "Chat xabari",
  },
];

export const howItWorksSteps = [
  {
    step: "01",
    title: "Ro'yxatdan o'ting",
    description:
      "Talaba yoki abituriyent sifatida bepul profil yarating. Qiziqayotgan universitetni tanlang va shaxsiy kabinetga kiring.",
    cta: { label: "Ro'yxatdan o'tish", href: "/signup", isRouter: true },
  },
  {
    step: "02",
    title: "O'qing va solishtiring",
    description:
      "Universitet sharhlari, reytinglari va taqqoslash vositalaridan foydalaning. Qaroringizni real talaba tajribasi asosida qabul qiling.",
    cta: { label: "Sharhlarni ko'rish", href: "#reviews", isRouter: false },
  },
  {
    step: "03",
    title: "Chatda savol bering",
    description:
      "Universitet guruh chatlariga qo'shiling va mavjud talabalardan qabul, yotoqxona yoki o'qish hayoti haqida to'g'ridan-to'g'ri javob oling.",
    cta: { label: "Hamjamiyatga qo'shilish", href: "#community", isRouter: false },
  },
];
