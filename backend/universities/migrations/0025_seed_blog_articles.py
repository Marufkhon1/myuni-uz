from datetime import timedelta

from django.db import migrations
from django.utils import timezone


def _article(title, slug, excerpt, body, cover_image, days_ago):
    return {
        "title": title,
        "slug": slug,
        "excerpt": excerpt,
        "body": body,
        "cover_image": cover_image,
        "status": "published",
        "published_at": timezone.now() - timedelta(days=days_ago),
    }


SEED_ARTICLES = [
    _article(
        "2026 qabul: TDIU vs TATU — qaysi biri sizga mos?",
        "2026-qabul-tdiu-vs-tatu",
        "Toshkent iqtisodiyot va TATU ni reyting, yo'nalishlar, yotoqxona va talabalar tajribasi bo'yicha solishtiramiz.",
        (
            "2026-yil qabul mavsumi yaqinlashgan sari abituriyentlar iqtisodiyot va texnika yo'nalishlari "
            "o'rtasida tanlov qilmoqda. Toshkent davlat iqtisodiyot universiteti (TDIU) va Toshkent axborot "
            "texnologiyalari universiteti (TATU) — ikkalasi ham kuchli, lekin ta'lim muhiti farq qiladi.\n\n"
            "TDIU iqtisodiyot, moliya va biznes yo'nalishlarida chuqur ixtisoslashgan. Agar siz bank, "
            "audit yoki xalqaro savdo sohasida ishlashni rejalashtirsangiz, bu universitet mantiqiy tanlov "
            "bo'lishi mumkin. MyUni.uz dagi sharhlarda talabalar ko'pincha amaliy kurslar va "
            "staj imkoniyatlarini alohida qayd etishadi.\n\n"
            "TATU esa IT, dasturiy injiniring va telekommunikatsiya yo'nalishlarida keng tanilgan. "
            "Laboratoriyalar, hackathonlar va texnologiya hamjamiyati faol bo'lsa, bu sizning ustuvor "
            "tanlovingiz bo'lishi mumkin. Reyting va sharhlar soni MyUni.uz katalogida har bir OTM "
            "sahifasida ochiq ko'rinadi.\n\n"
            "Qanday tanlash kerak? Birinchi navbatda yo'nalishingizni aniqlang. Keyin MyUni.uz da "
            "ikkala universitetni taqqoslash bo'limida yonma-yon qo'ying — reyting, sharh matnlari va "
            "chat orqali mavjud talabalardan savol bering. Shaxsiy tajriba statistikadan qimmatroq."
        ),
        "/images/campuses/campus-02.jpg",
        2,
    ),
    _article(
        "TSU vs TDTU: tabiiy fanlar yoki transport — 2026 taqqoslash",
        "2026-qabul-tsu-vs-tdtu",
        "Toshkent davlat universiteti va transport universiteti qaysi abituriyent profiliga mos? Qisqa taqqoslash.",
        (
            "Klassik universitet tajribasi va aniq ixtisoslashgan transport yo'nalishi o'rtasida tanlov "
            "qilayotgan abituriyentlar uchun TSU va TDTU muhim variantlardir.\n\n"
            "TSU — O'zbekistonning eng qadimiy va keng profilli universitetlaridan biri. Matematika, "
            "fizika, biologiya, filologiya kabi klassik yo'nalishlar kuchli. Agar siz ilmiy yo'nalish "
            "yoki universitet hayotining xilma-xilligini xohlasangiz, TSU ni o'rganish mantiqiy.\n\n"
            "TDTU transport, logistika va muhandislik yo'nalishlarida ixtisoslashgan. Sanoat bilan "
            "bog'liq amaliy loyihalar va kasbiy yo'nalish qiziqtirsa, bu yerda ko'proq mos kelishi mumkin.\n\n"
            "MyUni.uz da har ikkala universitet sahifasida talabalar baholari — o'qituvchilar, "
            "yotoqxona, infratuzilma — alohida ko'rsatiladi. Taqqoslash vositasi orqali 2 ta OTM ni "
            "bir ekranda solishtirib, keyin chatda savol bering."
        ),
        "/images/campuses/campus-03.jpg",
        4,
    ),
    _article(
        "Davlat va xususiy universitet: qanday farq qiladi?",
        "davlat-va-xususiy-universitet-farqi",
        "To'lov, diplom, yotoqxona va amaliyot imkoniyatlari — davlat va xususiy OTM farqlari.",
        (
            "Abituriyentlar ko'pincha davlat va xususiy universitet o'rtasidagi farqni noaniq "
            "tushunishadi. Asosiy farq — moliyalashtirish modeli, qabul tartibi va ba'zan "
            "ta'lim tilida namoyon bo'ladi.\n\n"
            "Davlat universitetlari kontrakt va grant asosida qabul qiladi. To'lov odatda "
            "xususiy OTM larga nisbatan pastroq bo'lishi mumkin. Diplom davlat namunasida "
            "beriladi va OTM ro'yxatga olingan bo'lishi muhim.\n\n"
            "Xususiy universitetlar ko'pincha qo'shimcha xizmatlar, zamonaviy infratuzilma va "
            "xorijiy til dasturlarini taklif qiladi. To'lov yuqoriroq bo'lishi mumkin, lekin "
            "stipendiya va chegirmalar ham mavjud.\n\n"
            "MyUni.uz katalogida har bir universitet turi (davlat/xususiy/xalqaro) filtri bor. "
            "Sharhlarni o'qing — talabalar haqiqiy xarajatlar, yotoqxona va o'qituvchilar sifati "
            "haqida yozadi. Shaxsiy ehtiyojingizga mos turini tanlang."
        ),
        "/images/campuses/campus-04.jpg",
        6,
    ),
    _article(
        "MyUni.uz da birinchi sharhingizni qanday yozasiz?",
        "myuni-da-birinchi-sharh-yozish-qollanmasi",
        "Ishonchli va foydali sharh yozish uchun 5 ta qoida — moderatsiya va «Kampus ovozi» belgisi haqida.",
        (
            "Platformadagi sharhlar abituriyentlar uchun eng qimmatli manba. Siz ham tajribangizni "
            "ulashishingiz mumkin — bu boshqalarga universitet tanlashda yordam beradi.\n\n"
            "Birinchi qoida: aniq va halol bo'ling. «Yomon» yoki «zo'r» o'rniga nima yoqdi, "
            "nima yoqmadi — sabab bilan yozing. Ikkinchi qoida: bir nechta mezonni baholang — "
            "o'qituvchilar, yotoqxona, infratuzilma alohida.\n\n"
            "Uchinchi qoida: shaxsiy hujjumlardan qoching. Moderatorlar qoidalar bo'yicha "
            "tekshiradi; haqoratli matnlar rad etiladi. To'rtinchi qoida: talaba yoki abituriyent "
            "sifatida profil to'ldiring — «Kampus ovozi» belgisi (yumshoq kampus "
            "aloqasi) ishonchni oshiradi.\n\n"
            "Beshinchi qoda: sharh yozgandan keyin chatda savollarga javob bering. Faol hamjamiyat "
            "a'zosi bo'lish sizning tajribangizni yanada qimmatli qiladi."
        ),
        "/images/campuses/campus-05.jpg",
        8,
    ),
    _article(
        "Universitet reytingi nima degani? MyUni.uz baholash tizimi",
        "universitet-reytingi-nima-degani",
        "Yulduzcha reyting qanday hisoblanadi, nechta sharh kerak va nima uchun muhim.",
        (
            "Reyting — talabalar baholari o'rtachasi. MyUni.uz da har bir sharh 1 dan 5 gacha "
            "yulduz bilan baholanadi. Universitet sahifasidagi umumiy reyting barcha tasdiqlangan "
            "sharhlarning o'rtacha qiymatidir.\n\n"
            "Kam sharhli universitetda bitta baho reytingni kuchli siljitishi mumkin — shuning "
            "uchun sharhlar sonini ham ko'ring. Platforma katalogida minimal sharh soni bo'yicha "
            "filtrlash mumkin.\n\n"
            "Ko'p mezonli baho (o'qituvchilar, yotoqxona, infratuzilma) umumiy reytingdan "
            "mustaqil. Masalan, umumiy 4.2 bo'lsa-yu, yotoqxona 3.0 bo'lishi mumkin — bu siz "
            "uchun muhim signal.\n\n"
            "Reytingni yagona mezon sifatida emas, balki sharh matnlari va taqqoslash "
            "vositasi bilan birga o'qing. MyUni.uz aynan shu yondashuv uchun yaratilgan."
        ),
        "/images/campuses/campus-06.jpg",
        10,
    ),
    _article(
        "Toshkentdagi mashhur universitetlar — 2026 qisqa ro'yxat",
        "toshkent-universitetlari-2026-qisqa-royxat",
        "Poytaxtdagi OTM lar: iqtisodiyot, IT, tibbiyot va klassik yo'nalishlar bo'yicha tanlov.",
        (
            "Toshkent — O'zbekistonning eng ko'p universitet markazlaridan biri. Abituriyentlar "
            "uchun tanlov keng, lekin bu chalkashlikni ham keltirishi mumkin.\n\n"
            "Iqtisodiyot va biznes: TDIU, Westminster, Turin Polytechnic kabi OTM lar ko'p "
            "abituriyentlar diqqat markazida. IT va muhandislik: TATU, TSTU, Inha va boshqalar. "
            "Klassik fanlar: TSU va profil fakultetlari.\n\n"
            "MyUni.uz katalogida shahar=Toshkent filtri bilan barcha OTM larni ko'ring. "
            "Xaritada joylashuvni tekshiring — transport va yashash xarajatlari ham muhim.\n\n"
            "Ro'yxatdan o'tib, sevimli universitetlaringizni saqlang va taqqoslash bo'limida "
            "2–4 ta variantni yonma-yon solishtiring. Qabul 2026 uchun vaqtida tayyorgarlik "
            "ko'ring."
        ),
        "/images/campuses/campus-07.jpg",
        12,
    ),
    _article(
        "Talaba yotoqxonasida yashash: 7 ta amaliy maslahat",
        "talaba-yotoqxonasida-yashash-maslahatlari",
        "Yotoqxona tanlash, xavfsizlik va hamkorlar bilan yashash bo'yicha tavsiyalar.",
        (
            "Ko'p abituriyentlar dastlab yotoqxonada yashashni rejalashtiradi — bu iqtisodiy "
            "va ijtimoiy jihatdan qulay. Lekin tajriba universitetdan universitetga farq qiladi.\n\n"
            "Birinchi: MyUni.uz sharhlarida yotoqxona bo'limini alohida o'qing. Ikkinchi: "
            "joylashuv — kampus yaqinida bo'lsa, vaqt tejaladi. Uchinchi: xavfsizlik va "
            "ichki tartib-qoidalar haqida oldindan so'rang.\n\n"
            "To'rtinchi: hamkor bilan yashash madaniyatiga tayyor bo'ling. Beshinchi: "
            "asosiy narsalarni ro'yxatga oling (choyshab, adapter, shaxsiy gigiyena). "
            "Oltinchi: budjet rejasini oldindan tuzing. Yettinchi: muammo bo'lsa, "
            "dekanat yoki tutor ga murojaat qiling.\n\n"
            "Chat orqali shu universitet talabalaridan yotoqxona haqida to'g'ridan-to'g'ri "
            "savol bering — bu eng ishonchli manba."
        ),
        "/images/campuses/campus-08.jpg",
        14,
    ),
    _article(
        "MyUni.uz chatidan qanday foydalanish kerak?",
        "myuni-chatidan-qanday-foydalanish",
        "Universitet guruh chatlari, shaxsiy xabarlar va xavfsiz muloqot qoidalari.",
        (
            "MyUni.uz chat — abituriyent va talabalar o'rtasidagi jonli aloqa vositasi. "
            "Har bir universitet uchun alohida guruh mavjud.\n\n"
            "Ro'yxatdan o'tgach, kabinetda chat bo'limiga o'ting. Universitet qidiring va "
            "guruhga qo'shiling. Savollaringizni aniq yozing: qabul, fanlar, yotoqxona, "
            "to'lov — mavzuni ko'rsating.\n\n"
            "Shaxsiy xabarlar ham mavjud, lekin avvalo guruhda umumiy savol berish tavsiya "
            "etiladi — javob boshqalarga ham foydali bo'ladi. Haqorat, spam va shaxsiy "
            "ma'lumotlarni tarqatish taqiqlanadi.\n\n"
            "Moderatorlar qoidabuzarliklarni kuzatadi. Agar muammo bo'lsa, shikoyat "
            "tugmasidan foydalaning. Chat — FAQ va maqolalarni to'ldiruvchi jonli manba."
        ),
        "/images/campuses/campus-01.jpg",
        16,
    ),
    _article(
        "Qabul ballari va kvotalar haqida nimalarni bilish kerak?",
        "qabul-ballari-va-kvotalar-haqida",
        "Grant, kontrakt, minimal ball va rasmiy manbalar — abituriyent uchun qisqa yo'riqnoma.",
        (
            "Har yili qabul qoidalari yangilanadi. Minimal o'tish ballari, kvotalar va "
            "yo'nalishlar ro'yxati rasmiy manbalarda e'lon qilinadi.\n\n"
            "MyUni.uz qabul ballarining rasmiy ro'yxatini almashtirmaydi — bu ma'lumot "
            "OTM yoki vazirlik saytlarida tekshirilishi kerak. Platforma esa tanlov "
            "jarayonida yordam beradi: qaysi universitet qanday muhit, qanday sharhlar "
            "va qanday talabalar jamoasi borligini ko'rsatadi.\n\n"
            "Agar bir nechta yo'nalishni ko'rib chiqayotgan bo'lsangiz, har biri uchun "
            "alohida universitet sahifasini saqlang. Taqqoslash va chat orqali real "
            "tajriba to'plang. Qabul natijasidan oldin to'g'ri tanlov qilish — maqsad."
        ),
        "/images/campuses/campus-02.jpg",
        18,
    ),
    _article(
        "Abituriyent uchun universitet tanlash checklisti (2026)",
        "abituriyent-universitet-tanlash-checklisti-2026",
        "5 qadam: yo'nalish, byudjet, joylashuv, sharhlar va chat — tayyor checklist.",
        (
            "Universitet tanlash stressli jarayon bo'lishi mumkin. Quyidagi checklist "
            "yordam beradi.\n\n"
            "1-qadam: yo'nalish va kasb maqsadini aniqlang. 2-qadam: byudjet — grant, "
            "kontrakt, yotoqxona xarajatlari. 3-qadam: shahar va joylashuv — uydan "
            "uzoqlik yoki yangi muhit.\n\n"
            "4-qadam: MyUni.uz da kamida 3 ta OTM ni o'qing — sharhlar, reyting, "
            "ko'p mezonli baholar. 5-qadam: chatda 2–3 ta savol bering va taqqoslash "
            "vositasida final ro'yxatni qisqartiring.\n\n"
            "Checklist bajarilgach, qabul hujjatlarini rasmiy manbalardan tekshiring. "
            "MyUni.uz tanlovning «insoniy» qismini — talabalar tajribasini — ochiq "
            "qiladi."
        ),
        "/images/campuses/campus-03.jpg",
        20,
    ),
]


def seed_blog_articles(apps, schema_editor):
    Article = apps.get_model("universities", "Article")
    for data in SEED_ARTICLES:
        if Article.objects.filter(slug=data["slug"]).exists():
            continue
        Article.objects.create(**data)


def unseed_blog_articles(apps, schema_editor):
    Article = apps.get_model("universities", "Article")
    slugs = [item["slug"] for item in SEED_ARTICLES]
    Article.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0024_message_report_unique"),
    ]

    operations = [
        migrations.RunPython(seed_blog_articles, unseed_blog_articles),
    ]
