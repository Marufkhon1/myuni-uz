export const trustSafetyDocument = {
  slug: "ishonch-xavfsizlik",
  title: "Ishonch va xavfsizlik",
  description:
    "MyUni.uz da foydalanuvchi xavfsizligi, moderatsiya, shikoyatlar va ma'lumotlaringiz himoyasi qanday ta'minlanishi haqida.",
  updatedAt: "2026-yil",
  sections: [
    {
      heading: "1. Bizning yondashuvimiz",
      body: `MyUni.uz abituriyent va talabalar uchun ishonchli muhit yaratishga intiladi. Sharhlar, chat xabarlari va profil ma'lumotlari real foydalanuvchilar tomonidan yuboriladi — shuning uchun moderatsiya, shikoyat tizimi va texnik himoya choralarini birlashtiramiz.

Maqsad — haqorat, spam va yolg'on kontentni kamaytirish, lekin ochiq fikr almashish imkoniyatini saqlab qolish.`,
    },
    {
      heading: "2. Kirish, login va email",
      body: `Ro'yxatdan o'tishda login, email va parol kiritiladi. Hisob darhol faollashadi — emailni tasdiqlash sharh yozish yoki kirish uchun talab qilinmaydi.

Kirish uchun login yoki email + parol ishlatiladi. Parolni unutganingizda ro'yxatdan o'tgan email manzilingizga tiklash havolasi yuboriladi (bu oqim email orqali tasdiqlanadi).

Google orqali kirishda email Google hisobingizdan olinadi.`,
    },
    {
      heading: "3. Sharh belgilari",
      body: `Sharh yonidagi «Kampus ovozi» belgisi — bu universitet chatiga a'zo bo'lgan yoki profilida shu OTM ni ko'rsatgan talaba ekanligini bildiradi. Bu rasmiy universitet tasdig'i yoki hujjatli tekshiruv emas.

Boshqa belgilar («Talaba tajribasi», «Abituriyent fikri») muallifning rolini ko'rsatadi.`,
    },
    {
      heading: "4. Shikoyat qilish",
      body: `Har qanday sharh yoki chat xabarini shikoyat qilishingiz mumkin. Shikoyat yuborilgach, holati «Ko'rib chiqish kutilmoqda» yoki «Ko'rib chiqilmoqda» deb ko'rsatiladi.

Holat o'zgarganda bildirishnoma ham keladi.`,
    },
    {
      heading: "5. Moderatsiya",
      body: `Sharhlar avval avtomatik tekshiruvdan o'tadi (haqorat va so'kinish filtri, jumladan buzib yozilgan shakllar).

• Odobli sharhlar tezda tasdiqlanadi va saytda ko'rinadi.
• Haqorat/so'kinish aniqlansa, tizim darhol rad etadi: «Sizniki moderatsiyadan o'tmadi. Iltimos, odobli til bilan qayta yozing.»
• Shikoyatlar moderator tomonidan ko'rib chiqiladi; qoidabuzar kontent yashirilishi yoki foydalanuvchi cheklanishi mumkin.

Hozirgi avto-filter sharhlar va chat (guruh + DM) xabarlariga tatbiq etiladi; bir harflik xato (fuzzy) ehtiyotkor threshold bilan, toxicity signal esa faqat noaniq (fuzzy) holatlarda ishlatiladi.

Shikoyat holatlari: kutilmoqda, ko'rib chiqilmoqda, hal qilindi, rad etildi.`,
    },
    {
      heading: "6. Bloklash va cheklovlar",
      body: `Chatda foydalanuvchini bloklashingiz mumkin — ularning xabarlari sizga ko'rinmaydi. Platforma spam va suiiste'mol oldini olish uchun so'rovlar tezligini (rate limit) cheklashi mumkin.

Limitga yetganda aniq vaqt ko'rsatiladi — qancha kutish kerakligi ekranda yoziladi.`,
    },
    {
      heading: "7. Ma'lumotlaringiz himoyasi",
      body: `Shaxsiy ma'lumotlar maxfiylik siyosatiga muvofiq saqlanadi. Parollar shifrlangan holda saqlanadi. Profil rasmi ko'rinishini o'zingiz boshqarasiz.

Kirish sessiyasi httpOnly cookie orqali saqlanadi — JWT tokenlar brauzer manzil satriga (URL) yozilmaydi. Google orqali kirishda bir martalik kod ishlatiladi, keyin cookie o'rnatiladi. Kirish va ro'yxatdan o'tish so'rovlari tezligi cheklangan (brute-force himoyasi).

Savollar bo'yicha: hello@myuni.uz`,
    },
  ],
};
