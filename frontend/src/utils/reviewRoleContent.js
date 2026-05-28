/** Sharhlar bo'limi — talaba va abituriyent matnlari. */

export function getReviewListContent(isStudent) {
  if (isStudent) {
    return {
      title: "Sharh yozish",
      subtitle: "O'qiyotgan yoki tanlangan OTM",
      searchPlaceholder: "O'qiyotgan yoki boshqa OTM qidiring...",
    };
  }

  return {
    title: "Sharhlarni ko'rish",
    subtitle: "Qiziqayotgan universitet",
    searchPlaceholder: "Tanlamoqchi universitetingizni qidiring...",
  };
}

export function getReviewPanelContent(isStudent) {
  if (isStudent) {
    return {
      bannerEyebrow: "Sharh va tajriba",
      statsTitle: "Universitet ko'rsatkichlari",
      statLabels: {
        rating: "O'rtacha baho",
        reviews: "Sharhlar",
        likes: "Like jami",
        chat: "Chat a'zolari",
      },
      distributionTitle: "Baholar taqsimoti",
      featuredLabel: "Eng ko'p yoqqan sharh",
      reviewsHeading: "Barcha sharhlar",
      reviewsSubheading: "Talabalar fikri",
      emptyTitle: "Hali sharh yo'q",
      emptyHint: "Birinchi sharhingizni qoldiring — keyin yana yozishingiz mumkin.",
      notice: null,
      defaultSort: "newest",
      quickActions: [
        { id: "chat", label: "Chatga o'tish", variant: "primary" },
        { id: "compare", label: "Boshqa OTM bilan taqqoslash", variant: "secondary" },
        { id: "popular", label: "Mashhur sharhlar", variant: "secondary" },
      ],
      likeButtonLabel: "Yoqdi",
      placeholderTitle: "Avval universitetni tanlang",
      placeholderDescription:
        "Chap ro'yxatdan universitetni tanlang — sharh yozish, statistika va talabalar fikri shu yerda.",
      formTitle: "Yangi sharh",
      formPlaceholder: "O'qish muhiti, ustozlar, yotoqxona, imkoniyatlar haqida yozing...",
    };
  }

  return {
    bannerEyebrow: "Tanlov uchun",
    statsTitle: "Tanlov bo'yicha qisqa xulosa",
    statLabels: {
      rating: "Talabalar bahosi",
      reviews: "Sharhlar soni",
      likes: "Ishonch (like)",
      chat: "Chat faolligi",
    },
    distributionTitle: "Talabalar baholari",
    featuredLabel: "Tanlov uchun — eng ishonchli sharh",
    reviewsHeading: "Talabalar tajribasi",
    reviewsSubheading: "O'qish va tanlov uchun",
    emptyTitle: "Hali sharh yo'q",
    emptyHint: "Bu universitet haqida hali talaba sharhi kelmagan. Chatda savol berishingiz mumkin.",
    notice: "Sharh yozish faqat talabalarga. Siz o'qishingiz va taqqoslashingiz mumkin.",
    defaultSort: "likes",
    quickActions: [
      { id: "compare", label: "Boshqa OTM bilan taqqoslash", variant: "primary" },
      { id: "chat", label: "Chatda savol berish", variant: "secondary" },
      { id: "popular", label: "Mashhur sharhlar", variant: "secondary" },
    ],
    likeButtonLabel: "Foydali",
    placeholderTitle: "Universitet tanlang",
    placeholderDescription:
      "Chap ro'yxatdan qiziqayotgan OTMni tanlang — reyting, taqsimot va talabalar sharhlari shu yerda.",
    formTitle: null,
    formPlaceholder: null,
  };
}

export function getReviewSortOptions(isStudent) {
  const options = [
    { id: "newest", label: "Eng yangi" },
    { id: "likes", label: "Eng ko'p like" },
    { id: "rating_high", label: "Yuqori baho" },
    { id: "oldest", label: "Eng eski" },
  ];
  if (!isStudent) {
    return [
      { id: "likes", label: "Eng ishonchli (like)" },
      { id: "rating_high", label: "Yuqori baho" },
      { id: "newest", label: "Eng yangi" },
      { id: "oldest", label: "Eng eski" },
    ];
  }
  return options;
}
