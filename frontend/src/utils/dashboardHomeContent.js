/** Bosh sahifa — bir xil layout, rol bo'yicha faqat funksiya farqi. */

export function getDashboardHomeContent() {
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
      icon: "✍️",
      accent: "amber",
    },
    {
      id: "chats",
      label: "Chatga kirish",
      helper: "Guruh va shaxsiy xabarlar",
      section: "chats",
      icon: "💬",
      accent: "blue",
    },
    {
      id: "compare",
      label: "Taqqoslash",
      helper: "3 ta OTM jadvali",
      section: "compare",
      icon: "⚖️",
      accent: "violet",
    },
  ];
}
