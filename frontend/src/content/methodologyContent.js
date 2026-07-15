/** Reyting va taqqoslash metodologiyasi — ochiq hujjat. */
export const methodologyDocument = {
  slug: "metodologiya",
  title: "Reyting va taqqoslash metodologiyasi",
  description:
    "MyUni.uz da universitet reytingi, baholar va taqqoslash ballari qanday hisoblanishi — ochiq formulalar, ogohlantirishlar va cheklovlar.",
  updatedAt: "2026-yil iyul",
  sections: [
    {
      heading: "1. Bu nima — va nima emas",
      body: `MyUni.uz platformasi talabalar va abituriyentlar sharhlariga asoslangan ochiq ma'lumot manbai. Bu yerda ko'rsatilgan reytinglar:

• vazirlik yoki davlat idorasi reytingi emas;
• QS, Times Higher Education yoki boshqa xalqaro reyting emas;
• universitetning rasmiy o'zini baholashi emas.

Maqsad — real foydalanuvchi tajribasini yonma-yon ko'rsatish. Qaror qabul qilishda bir necha manbani (rasmiy sayt, ochiq kun, qabul komissiyasi) birga ko'ring.`,
    },
    {
      heading: "2. Umumiy reyting (1–5 yulduz)",
      body: `Universitet sahifasidagi «oddiy o'rtacha» — faqat moderatsiyadan o'tgan (tasdiqlangan) sharhlarning arifmetik o'rtachasi.

• Har bir sharh 1 dan 5 gacha baholanadi.
• O'rtacha arifmetik: barcha tasdiqlangan sharhlar reytingi yig'indisi / sharhlar soni.
• Moderatsiya navbatidagi yoki yashirilgan sharhlar hisobga kirmaydi.
• Schema.org AggregateRating faqat shu xom o'rtacha va sharhlar soni > 0 bo'lganda chiqariladi.`,
    },
    {
      id: "bayesian",
      heading: "2b. Soft reyting (Bayesian / display_rating)",
      body: `Katalog tartibi va /reyting jadvalidagi «Soft ball» — Bayesian (ishonch og'irlikli) ko'rsatkich:

display ≈ (n × o'rtacha + 10 × 3.8) / (n + 10)

• prior_mean = 3.8, prior_weight = 10 (kam sharhli OTMlar uchun yumshatish).
• n = tasdiqlangan sharhlar soni.
• Ishonch: 0 → yo'q; <3 → kam; <10 → o'rtacha; ≥10 → yuqori.
• /reyting jadvaliga kirish uchun kamida 3 ta tasdiqlangan sharh kerak (medium+ ishonch).

Bu soft ball QS/THE yoki vazirlik o'rnini egallamaydi. Universitet sahifasidagi AggregateRating esa xom o'rtachaga tayanadi — chalkashtirmang.
JSON-LD ItemList da faqat top-N universitet chiqadi; to'liq jadval sahifada.`,
    },
    {
      heading: "3. Mezonlar (aspektlar)",
      body: `Ba'zi sharhlarda alohida mezonlar baholanadi (masalan: o'qituvchilar, yotoqxona, infratuzilma). Har bir mezon bo'yicha alohida o'rtacha hisoblanadi.

Umumiy yulduz va mezon o'rtachasi bir xil bo'lishi shart emas — ba'zi sharhlarda faqat umumiy baho, ba'zilarida mezonlar ham bo'lishi mumkin.

«Kampus ovozi» belgisi — chat a'zoligi yoki profil OTM mosligi haqida signal; bu rasmiy universitet tasdig'i emas.`,
    },
    {
      heading: "4. Taqqoslash: 2–4 ta OTM",
      body: `Taqqoslash modulida 2 dan 4 gacha turli universitet tanlanadi. Natija jadvalida:

• reyting, sharhlar soni, chat a'zolari, mezonlar va boshqa mavjud ko'rsatkichlar yonma-yon chiqadi;
• har bir solishtiriladigan qatorda yetarli ma'lumot bo'lsa, eng yuqori (yoki metrikaning yo'nalishiga qarab eng yaxshi) qiymat «g'alaba» deb belgilanadi;
• qiymatlar teng bo'lsa — durang;
• birorta tomonda ma'lumot yetmasa — «yetarli emas».

Yetakchi (tavsiya) tanlash:
1) Ko'proq g'alaba qatoriga ega OTM yetakchi bo'ladi (agar aniq farq bo'lsa).
2) G'alabalar teng yoki yo'q bo'lsa — quyidagi umumiy (kompozit) ball ishlatiladi.`,
    },
    {
      heading: "5. Kompozit ball (0–100)",
      body: `Kompozit ball faqat taqqoslash xulosasi uchun qo'shimcha o'lchov — u «rasmiy reyting» emas.

Og'irliklar (mavjud qismlar normalizatsiya qilinadi):

• Umumiy reyting (0–5 → 0–1): 35%
• Sharhlar soni (tanlovdagi maksimalga nisbatan): 25%
• Chat a'zolari soni (tanlovdagi maksimalga nisbatan): 20%
• Mezonlar o'rtachasi (agar mavjud): 20%

Agar biror qism yo'q bo'lsa (masalan, mezonlar), qolgan og'irliklar qayta taqsimlanadi. Ball 0–100 oralig'ida yaxlitlanadi.

Durangda qo'shimcha tartib: yuqoriroq kompozit → ko'proq sharh → ko'proq chat a'zosi.`,
    },
    {
      heading: "6. Kichik namunalar va ogohlantirish",
      body: `Kam sonli sharh — yuqori yoki past reytingni «haqiqat» deb o'qimang. 2–3 ta fikr statistik jihatdan beqaror.

Shuning uchun:
• sharhlar soniga e'tibor bering;
• matnlarni o'qing, faqat o'rtacha yulduzga qaramang;
• taqqoslashda 2–4 ta OTM ni bir necha mezon bo'yicha ko'ring.

Platforma «eng yaxshi universitet» deb hukm chiqarmaydi — faqat mavjud foydalanuvchi ma'lumotlarini tartiblaydi.`,
    },
    {
      id: "kontrakt-narxlari",
      heading: "7. Kontrakt narxlari (tuition honesty)",
      body: `Universitet sahifasidagi kontrakt summalari — MyUni.uz hisob-kitobi yoki ochiq katalogdan olingan taxminiy ko'rsatkichlar.

• Bu rasmiy universitet narx-nomasi yoki to'lov shartnomasi emas.
• «Taxmin (davlat bazasi)» — davlat komissiyasining bazaviy to'lov-kontrakt tariflari va muassasa ixtisoslashuvi asosida hisoblangan.
• «Taxminiy» (xususiy / xorijiy filial) — bazaviy tarifga nisbatan koeffitsient bilan taxminiy diapazon.
• «Katalog» — 20 ta yetakchi OTM uchun MyUni.uz kuratorlari tomonidan tasdiqlangan ochiq manba (kontrakt.edu.uz yoki muassasa sayti); manba havolasi sahifada ko'rsatiladi.

Aniq summani har doim muassasa sayti, qabul komissiyasi yoki kontrakt.edu.uz dan tekshiring. Taqqoslashda «Kontrakt (taxmin)» qatori pastroq summani «qulayroq» deb belgilashi mumkin — bu faqat taxminiy solishtirish, tavsiya emas.`,
    },
    {
      heading: "8. Yangilanishlar",
      body: `Formula yoki og'irliklar o'zgarsa, ushbu sahifa yangilanadi va sana ko'rsatiladi. Texnik tafsilotlar kodda ham ochiq (frontend compare math).

Savollar: hello@myuni.uz
Yana: /ishonch-xavfsizlik — moderatsiya va «Kampus ovozi» haqida.`,
    },
  ],
};
