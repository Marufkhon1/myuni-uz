/** Dashboard matnlari — talaba va abituriyent uchun alohida. */

export function getDashboardMenuItems(isStudent) {
  const homeItem = {
    id: "home",
    label: "Bosh sahifa",
    shortLabel: "Asosiy",
    helper: "Siz uchun tavsiyalar",
  };

  if (isStudent) {
    return [
      homeItem,
      { id: "chats", label: "Chatlar", shortLabel: "Chat", helper: "Guruh va shaxsiy xabarlar" },
      { id: "popular", label: "Mashhur sharhlar", shortLabel: "Mashhur", helper: "Eng ko'p yoqqanlar" },
      { id: "reviews", label: "Sharh yozish", shortLabel: "Sharh", helper: "Reyting va tajriba" },
      { id: "compare", label: "Taqqoslash", shortLabel: "Solishtirish", helper: "Ikki OTM yonma-yon" },
      { id: "profile", label: "Profil", shortLabel: "Profil", helper: "Ism, universitet, rasm" },
    ];
  }

  return [
    homeItem,
    { id: "chats", label: "Chatlar", shortLabel: "Chat", helper: "Savol bering, talabalardan javob oling" },
    { id: "popular", label: "Mashhur sharhlar", shortLabel: "Mashhur", helper: "Talabalar tajribasini o'qing" },
    { id: "reviews", label: "Sharhlarni ko'rish", shortLabel: "Sharhlar", helper: "Universitet baholari" },
    { id: "compare", label: "Taqqoslash", shortLabel: "Solishtirish", helper: "Tanlov uchun solishtiring" },
    { id: "profile", label: "Profil", shortLabel: "Profil", helper: "Qiziqilgan universitet" },
  ];
}

export function getDashboardCabinetEyebrow(isStudent) {
  return isStudent ? "Talaba kabineti" : "Abituriyent kabineti";
}
