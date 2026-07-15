import {
  SHOW_SUPPORT_PHONE,
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
} from "@/config/siteContact.js";

export function getSupportBotReply(text, { isStudent = false } = {}) {
  const query = text.trim().toLowerCase();
  if (!query) {
    return "Savolingizni yozing — yordam berishga harakat qilaman.";
  }
  if (query.includes("parol") || query.includes("kirish") || query.includes("login")) {
    return "Parolni tiklash uchun «Kirish» sahifasidagi «Parolni unutdingizmi?» havolasidan foydalaning.";
  }
  if (query.includes("sharh") || query.includes("baho")) {
    if (isStudent) {
      return "«Sharh yozish» bo'limida universitet tanlang — baho va izoh qoldirishingiz mumkin.";
    }
    return "«Sharhlarni ko'rish» bo'limida universitet tanlang — talabalar tajribasini o'qing. Sharh yozish faqat talabalarga ochiq.";
  }
  if (query.includes("abituriyent") || query.includes("talaba") || query.includes("rol")) {
    if (isStudent) {
      return "Siz talaba kabinetidasiz: sharh yozish, chat va taqqoslash mavjud.";
    }
    return "Siz abituriyent kabinetidasiz: sharhlarni o'qish, taqqoslash va chat orqali savol berish mumkin.";
  }
  if (query.includes("chat") || query.includes("qo'shil")) {
    return "Chatlar bo'limida universitet guruhiga qo'shiling. Keyin xabar yozishingiz mumkin.";
  }
  if (query.includes("taqqos") || query.includes("solishtir")) {
    return "Taqqoslash bo'limida aynan 3 ta universitetni tanlab, jadvalda solishtiring.";
  }
  if (query.includes("profil") || query.includes("rasm")) {
    return "Profil bo'limida ism, universitet va profil rasmini yangilashingiz mumkin.";
  }
  if (query.includes("email") || query.includes("pochta")) {
    return `Pochta orqali yozing: ${SUPPORT_EMAIL}`;
  }
  if (query.includes("telefon") || query.includes("qo'ng'iroq") || query.includes("nomer")) {
    if (SHOW_SUPPORT_PHONE && SUPPORT_PHONE_DISPLAY) {
      return `Qo'ng'iroq qiling: ${SUPPORT_PHONE_DISPLAY}`;
    }
    return `Telefon raqami hozircha e'lon qilinmagan. Email yozing: ${SUPPORT_EMAIL}`;
  }
  return (
    "Rahmat! Aniqroq yordam uchun email yoki telefon orqali murojaat qiling. Operator tez orada javob beradi."
  );
}

export function getSupportBotWelcome(isStudent = false) {
  return {
    id: "welcome",
    from: "bot",
    text: isStudent
      ? "Salom! Talaba kabineti yordamchisiman — sharh, chat va taqqoslash haqida yozing."
      : "Salom! Abituriyent kabineti yordamchisiman — sharhlarni o'qish va tanlov haqida yozing.",
  };
}

/** Tez savollar — bosilganda javob darhol chiqadi */
export function getSupportQuickQuestions(isStudent = false) {
  if (isStudent) {
    return [
      {
        id: "review",
        question: "Sharh qanday yoziladi?",
        answer: getSupportBotReply("sharh", { isStudent }),
      },
      {
        id: "chat",
        question: "Chatga qanday qo'shilaman?",
        answer: getSupportBotReply("chat", { isStudent }),
      },
      {
        id: "compare",
        question: "OTMlarni qanday taqqoslash?",
        answer: getSupportBotReply("taqqoslash", { isStudent }),
      },
    ];
  }

  return [
    {
      id: "reviews-read",
      question: "Sharhlarni qayerdan o'qiyman?",
      answer: getSupportBotReply("sharh", { isStudent }),
    },
    {
      id: "compare",
      question: "Taqqoslash qanday ishlaydi?",
      answer: getSupportBotReply("taqqoslash", { isStudent }),
    },
    {
      id: "password",
      question: "Parolni qanday tiklash?",
      answer: getSupportBotReply("parol", { isStudent }),
    },
  ];
}
