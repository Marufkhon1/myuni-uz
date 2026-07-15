/** Biz haqimizda — ochiq tahririy sahifa. */
import { SUPPORT_EMAIL } from "@/config/siteContact.js";

export const aboutDocument = {
  slug: "haqida",
  title: "Biz haqimizda",
  description:
    "MyUni.uz nima? Missiya, qarash, hikoya, tahririy siyosat, tasdiqlash jarayoni va reyting metodologiyasi haqida.",
  updatedAt: "2026-yil iyul",
  sections: [
    {
      id: "missiya",
      heading: "Missiya",
      body: `MyUni.uz — O'zbekistondagi abituriyent va talabalar uchun universitetlarni real sharhlar, ochiq ma'lumot va yonma-yon taqqoslash orqali tanlashga yordam beradigan mustaqil platforma.

Bizning missiyamiz: har bir o'quvchi kelib chiqishi yoki mintaqasidan qat'i nazar, ishonchli ma'lumot asosida to'g'ri yo'l topa olsin.`,
    },
    {
      id: "qarash",
      heading: "Qarash (Vision)",
      body: `O'zbekiston va Markaziy Osiyodagi #1 ochiq oliy ta'lim tanlov platformasi bo'lish — shaffof reyting signallari, chuqur katalog va jamoa ishonchi bilan.

Biz QS yoki vazirlik o'rnini egallashni maqsad qilmaymiz. Maqsad — talaba ovozi va ochiq metodologiya bilan tanlovni osonlashtirish.`,
    },
    {
      id: "hikoya",
      heading: "Hikoya",
      body: `MyUni.uz TDIU Samarqand filiali muhitida — oliy ta'lim tanlovida shaffof ma'lumotga bo'lgan ehtiyojdan kelib chiqib yaratilgan.

Platforma universitet katalogi, talabalar sharhlari, taqqoslash, maqolalar va savol-javobni bir joyda birlashtiradi.`,
    },
    {
      id: "tahririyat",
      heading: "Tahririy siyosat",
      body: `• Faktlar va platforma imkoniyatlari chalkashmasligi kerak.
• Reyting yoki ball haqidagi har qanday da'vo Metodologiya sahifasiga bog'lanadi.
• Reklama matnlari «tahririy kontent» deb yozilmaydi.
• Xato topilsa — tuzatiladi va yangilanish sanasi ko'rsatiladi.
• Foydalanuvchi shikoyatlari moderatsiya qoidalari asosida ko'rib chiqiladi.`,
    },
    {
      id: "tasdiqlash",
      heading: "Tasdiqlash va moderatsiya",
      body: `Sharhlar nashr etilishidan oldin moderatsiyadan o'tadi. Yashirin, haqoratli yoki qoidalarga zid matnlar olib tashlanishi mumkin.

«Kampus ovozi» kabi belgilar — chat a'zoligi yoki profil mosligi haqidagi signal; bu rasmiy universitet tasdig'i emas. Batafsil — «Ishonch va xavfsizlik» hamda «Sharh qoidalari» sahifalarida.`,
    },
    {
      id: "metodologiya",
      heading: "Reyting qanday ishlaydi",
      body: `MyUni.uz dagi umumiy reyting — tasdiqlangan talabalar sharhlarining o'rtacha bali (va tegishli ishonch formulalari). Bu vazirlik, QS yoki Times Higher Education reytingi emas.

To'liq formulalar, cheklovlar va taqqoslash qoidalari «Metodologiya» sahifasida ochiq yozilgan. Jonli soft jadval — «Reyting» sahifasida.`,
    },
    {
      id: "jamiyat",
      heading: "Jamoa va hamkorlar",
      body: `Loyiha ta'lim jamoasi tomonidan rivojlantiriladi. Faol universitetlar va hamkorlik haqida — /hamkorlar sahifasida.

Aloqa va ofis manzili — «Aloqa» sahifasida.`,
    },
    {
      id: "media",
      heading: "Media va matbuot",
      body: `Matbuot so'rovlari, intervyu va brend materiallari uchun ${SUPPORT_EMAIL} manziliga yozing. Logotip va brend nomini o'zgartirmasdan ishlating; noto'g'ri da'volarni (masalan, «rasmiy davlat reytingi») tarqatmang.`,
    },
  ],
};
