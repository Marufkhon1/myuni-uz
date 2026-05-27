/** Dashboard matnlari — talaba va abituriyent uchun alohida. */

export function getDashboardMenuItems(isStudent) {
  if (isStudent) {
    return [
      { id: "chats", label: "Chatlar", helper: "Guruh va shaxsiy xabarlar" },
      { id: "popular", label: "Mashhur sharhlar", helper: "Eng ko'p yoqqanlar" },
      { id: "reviews", label: "Sharh yozish", helper: "Reyting va tajriba" },
      { id: "compare", label: "Taqqoslash", helper: "Ikki OTM yonma-yon" },
      { id: "profile", label: "Profil", helper: "Ism, universitet, rasm" },
    ];
  }

  return [
    { id: "chats", label: "Chatlar", helper: "Savol bering, talabalardan javob oling" },
    { id: "popular", label: "Mashhur sharhlar", helper: "Talabalar tajribasini o'qing" },
    { id: "reviews", label: "Sharhlarni ko'rish", helper: "Universitet baholari" },
    { id: "compare", label: "Taqqoslash", helper: "Tanlov uchun solishtiring" },
    { id: "profile", label: "Profil", helper: "Qiziqilgan universitet" },
  ];
}

export function getDashboardCabinetEyebrow(isStudent) {
  return isStudent ? "Talaba kabineti" : "Abituriyent kabineti";
}
