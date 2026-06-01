/** Bosh sahifa — bir xil layout, rol bo'yicha faqat funksiya farqi. */

export function getDashboardHomeContent(isStudent) {
  return {
    heroSubtitle:
      "Oxirgi chatlar, mashhur sharhlar va tezkor harakatlar — barchasi bir joyda.",
    reviewsTitle: "Mashhur sharhlar",
    reviewsMoreSection: "popular",
    quickActionsEyebrow: "Tezkor harakatlar",
    quickActionsTitle: "Bugun nima qilasiz?",
    checklistEyebrow: "Boshlang'ich qadamlar",
  };
}

export function getDashboardHomeQuickActions(isStudent) {
  return [
    {
      id: "reviews",
      label: isStudent ? "Sharh yozish" : "Sharhlarni ko'rish",
      helper: isStudent ? "Tajribangizni ulashing" : "Talabalar tajribasini o'qing",
      section: "reviews",
    },
    {
      id: "chats",
      label: "Chatga kirish",
      helper: "Guruh va shaxsiy xabarlar",
      section: "chats",
    },
    {
      id: "compare",
      label: "Taqqoslash",
      helper: "Ikki OTM yonma-yon",
      section: "compare",
    },
  ];
}
