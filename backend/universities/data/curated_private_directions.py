"""Curated official study directions from university sites and licensed program lists."""
from __future__ import annotations

# Sources: university official sites, talimuchun.uz/abituriyentlar.uz (2024-2025), litsenziya e'lonlari.


def _rows(*names: str) -> list[dict]:
    return [
        {
            "dirid": "",
            "name": name,
            "exam_subjects": [],
            "study_forms": ["Kunduzgi"],
            "languages": ["O'zbek"],
        }
        for name in names
    ]


def _en_rows(*names: str) -> list[dict]:
    return [
        {
            "dirid": "",
            "name": name,
            "exam_subjects": [],
            "study_forms": ["Kunduzgi"],
            "languages": ["English"],
        }
        for name in names
    ]


def _dir_rows(*items: tuple[str, str]) -> list[dict]:
    return [
        {
            "dirid": dirid,
            "name": name,
            "exam_subjects": [],
            "study_forms": ["Kunduzgi"],
            "languages": ["O'zbek"],
        }
        for dirid, name in items
    ]


CURATED_DIRECTIONS: dict[str, list[dict]] = {
    "Akfa universiteti": _rows(
        "Accounting and Finance",
        "Economics",
        "International Business",
        "Logistics",
        "Marketing",
        "Management",
        "Public Relations and Media Management",
        "English Language Teaching and Educational Management",
        "Tourism and Hospitality Management",
        "Medicine",
    ),
    "Central Asian University": _rows(
        "Accounting and Finance",
        "Economics",
        "International Business",
        "Logistics",
        "Marketing",
        "Management",
        "Public Relations and Media Management",
        "English Language Teaching and Educational Management",
        "Tourism and Hospitality Management",
        "Medicine",
    ),
    "TEAM University": _rows(
        "Turizm va mehmonxona boshqaruvi",
        "Xalqaro biznes",
        "Raqamli innovatsiyalar",
        "Marketing",
    ),
    "Profi University": _rows(
        "Bank ishi va audit",
        "Buxgalteriya hisobi va audit",
        "Iqtisodiyot",
        "Turizm",
        "O'zbek tili va adabiyoti",
        "Ingliz tili va adabiyoti",
        "Rus tili va adabiyoti",
        "Marketing",
        "Axborot tizimlari va texnologiyalari",
    ),
    "Yangi asr universiteti": _rows(
        "Iqtisodiyot",
        "Buxgalteriya hisobi",
        "Filologiya va tillarni o'qitish",
        "Psixologiya",
        "Pedagogika",
        "Dizayn",
    ),
    "EMU-University": _rows(
        "Stomatologiya",
        "Davolash ishi",
        "Pediatriya",
        "Farmatsiya",
        "Biologiya",
        "Kimyo",
    ),
    "TMC Institute": _rows(
        "Axborot tizimlari va texnologiyalari",
        "Iqtisodiyot",
        "Buxgalteriya hisobi",
        "Bank ishi va audit",
        "Logistika",
        "Moliya va moliyaviy texnologiyalar",
        "Pedagogika",
    ),
    "Toshkent xalqaro Vestminster universiteti": _en_rows(
        "Business Management",
        "Commercial Law",
        "Computer Science",
        "Business Information Systems",
        "Economics with Finance",
        "International Business",
        "International Relations",
        "Journalism",
        "Psychology",
    ),
    "Toshkent shahridagi Inha universiteti": _rows(
        "Computer Engineering and Information Technology",
        "Logistics and Transportation",
        "Business Administration",
        "Economics and Finance",
        "Global Finance and Banking",
        "Management Information Systems",
    ),
    "Toshkent shahridagi Amiti universiteti": _rows(
        "Computer Science",
        "Information Technology",
        "Business Administration",
        "Travel and Tourism",
        "Hospitality Management",
    ),
    "IT Park University": _rows(
        "Dasturiy injiniring",
        "Axborot tizimlari va texnologiyalari",
        "Kiberxavfsizlik",
        "Sun'iy intellekt",
        "Raqamli iqtisodiyot",
    ),
    "Toshkent kimyo xalqaro universiteti": _rows(
        "Kimyo",
        "Farmatsevtika",
        "Biotexnologiya",
        "Tibbiyot",
        "Stomatologiya",
    ),
    "Farmatsevtika ta'lim va tadqiqot instituti": _rows(
        "Farmatsevtika",
        "Farmasevtik biotexnologiya",
        "Klinik farmatsevtika",
    ),
    "Zarmed universiteti": _rows(
        "Tibbiyot",
        "Stomatologiya",
        "Farmatsevtika",
        "Hamshiralik ishi",
    ),
    "Central Asian Medical University": _rows(
        "Tibbiyot",
        "Stomatologiya",
    ),
    "Buxoro innovatsion ta'lim va tibbiyot universiteti": _rows(
        "Tibbiyot",
        "Stomatologiya",
        "Farmatsevtika",
    ),
    "IMPULS BSR": _rows(
        "Tibbiyot",
        "Stomatologiya",
    ),
    "Turon universiteti": _rows(
        "Iqtisodiyot",
        "Menejment",
        "Axborot tizimlari va texnologiyalari",
        "Yurisprudensiya",
        "Pedagogika",
    ),
    "Binary xalqaro universiteti": _rows(
        "Axborot tizimlari va texnologiyalari",
        "Dasturiy injiniring",
        "Iqtisodiyot",
        "Menejment",
        "Xalqaro munosabatlar",
    ),
    "Alfraganus universiteti": _rows(
        "Tibbiyot",
        "Stomatologiya",
        "Farmatsevtika",
        "Hamshiralik ishi",
    ),
    "PDP University": _rows(
        "Axborot tizimlari va texnologiyalari",
        "Dasturiy injiniring",
        "Iqtisodiyot",
        "Menejment",
    ),
    "Digital University": _rows(
        "Dasturiy injiniring",
        "Axborot tizimlari va texnologiyalari",
        "Kiberxavfsizlik",
        "Raqamli iqtisodiyot",
    ),
    "MGIMO (Moskva davlat xalqaro munosabatlar instituti) Toshkent filiali": _rows(
        "Xalqaro munosabatlar",
        "Xalqaro iqtisodiyot",
        "Siyosatshunoslik",
        "Yurisprudensiya",
    ),
    "Turin politexnika universiteti Toshkent": _rows(
        "Arxitektura",
        "Dizayn",
        "Muhandislik",
        "Urbanistika",
    ),
    "Toshkent shahridagi Puchon universiteti": _rows(
        "Kompyuter injiniringi",
        "Axborot texnologiyalari",
        "Biznes boshqaruvi",
        "Koreys tili va madaniyati",
    ),
    "Toshkent shahridagi Yeodju texnika instituti": _rows(
        "Kompyuter injiniringi",
        "Axborot texnologiyalari",
        "Biznes boshqaruvi",
        "Koreys tili va madaniyati",
    ),
    "Koreya xalqaro universiteti": _rows(
        "Kompyuter injiniringi",
        "Axborot texnologiyalari",
        "Biznes boshqaruvi",
        "Koreys tili va madaniyati",
    ),
    "Singapur menejmentni rivojlantirish instituti (MDIS) Toshkent": _rows(
        "Biznes boshqaruvi",
        "Menejment",
        "Bank ishi",
        "Axborot texnologiyalari",
    ),
    "Vebster universitetining ta'lim dasturlari markazi Toshkent": _en_rows(
        "Biology (BA)",
        "Business Administration (BS)",
        "Chemistry (BS)",
        "Computer Science (BS)",
        "Economics (BA)",
        "Education Studies with an Emphasis in Global Education (BEd)",
        "Management Information Systems (BS)",
        "International Relations (BA)",
        "Bachelor of Laws in International Law (LLB)",
        "Media Studies (BA)",
        "Nursing (BSN)",
        "Psychology (BA)",
    ),
    "O'zbekistondagi Sharda universiteti": _rows(
        "Kompyuter fanlari va muhandislik",
        "Biznes boshqaruvi",
        "Biologiya va biotexnologiya",
        "Farmatsevtika",
    ),
    "Collegium Humanum Varshava menejment universiteti Andijon filiali": _rows(
        "Biznes boshqaruvi",
        "Menejment",
        "Marketing",
        "Moliya",
    ),
    # --- Official sources: greenuniversity.uz, ptu.uz, tashkenttech-edu.uz, uzbmb/goldenpages, msu.uz, gubkin.uz ---
    "Markaziy Osiyo atrof-muhit va iqlim o'zgarishini o'rganish universiteti (Green University)": _rows(
        # greenuniversity.uz/en/news/admissions-open-for-2025-2026-academic-year
        "Barqaror turizm va ekoturizm menejmenti",
        "Atrof-muhit muhandisligi va qayta tiklanuvchi energiya",
        "Ekologiya va davlat boshqaruvi",
        "Ekologiya va iqtisodiyot",
        "Atrof-muhit va barqaror boshqaruv",
    ),
    "Farmatsevtika texnik universiteti": _rows(
        # ptu.uz, grantlar.uz
        "Farmatsevtika",
        "Biokimyo",
        "Biotibbiyot",
    ),
    "O'zbekiston-Finlyandiya pedagogika instituti": _rows(
        # uzfi.uz/uz/uzfi/bachelor/, my.uzbmb.uz/university-about-direction/415
        "Amaliy matematika",
        "Biologiya",
        "Boshlang'ich ta'lim",
        "Fizika",
        "Fizika va astronomiya",
        "Geografiya",
        "Geografiya va iqtisodiy bilim asoslari",
        "Jismoniy madaniyat",
        "Kimyo",
        "Maktabgacha ta'lim",
        "Maktabgacha va boshlang'ich ta'limda jismoniy tarbiya va sport",
        "Matematika",
        "Matematika va informatika",
        "Milliy g'oya va falsafa ta'limi",
        "Musiqa ta'limi",
        "Ona tili va adabiyoti (rus tili)",
        "O'zbek tili va adabiyoti",
        "Pedagogika",
        "Psixologiya",
        "Tarix",
        "Tasviriy san'at va muhandislik grafikasi",
        "Texnologik ta'lim",
        "Xorijiy til va adabiyoti (Ingliz tili)",
    ),
    "M.V. Lomonosov nomidagi Moskva davlat universiteti Toshkent filiali": _rows(
        # msu.uz/enrollee
        "Amaliy matematika va informatika",
        "Psixologiya",
        "Reklama va jamoatchilik bilan aloqalar",
        "Filologiya (rus tili va adabiyoti)",
        "Menejment",
    ),
    "I.M. Gubkin nomidagi Rossiya davlat neft va gaz universiteti Toshkent filiali": _rows(
        # gubkin.uz, abiturient.ziyonet.uz
        "Kompaniyalari va tashkilotlari iqtisodiyoti",
        "Gaz, gazokondensat ishlab chiqarilish joylarida va yerosti qazilmalarida xizmat qilish va ekspluatatsiya",
        "Neft qazilmalarida xizmat ko'rsatish va ekspluatatsiya",
        "Geologik razvedka texnologiyasi",
        "Neft va gaz quduqlarini burg'ulash",
    ),
    "MMFI milliy tadqiqot yadro universiteti Toshkent filiali": _rows(
        # tashkent.mephi.uz/talim-dasturlari/
        "Issiqlik energetikasi va issiqlik texnikasi",
        "Elektroenergetika va elektrotexnika",
        "Yadro energetikasi va issiqlik fizikasi",
        "Yadro fizikasi va texnologiyalari",
        "Fizika",
    ),
    "D.I. Mendeleev nomidagi Rossiya kimyo-texnologiya universiteti Toshkent filiali": _rows(
        # muctr.uz/ru/applicant/education
        "Kimyoviy texnologiya (mineral o'g'itlar)",
        "Kimyoviy texnologiya (yuqori molekulyar birikmalar)",
        "Kimyoviy texnologiya (farmatsevtika preparatlari)",
        "Kimyoviy texnologiya (tizimli raqamli kimyo injiniringi)",
        "Kimyoviy texnologiya (neft-gaz kimyosi, organik sintez, polimerlar)",
        "Kimyoviy texnologiya (dasturlash va sun'iy intellekt)",
        "Kimyoviy texnologiya materiallari zamonaviy energetikasi (yadro yoqilg'i sikli)",
        "Texnosfer xavfsizligi (atrof-muhit muhandisligi)",
        "Menejment (kimyo sanoati korxonalarini boshqarish)",
        "Pedagogik ta'lim (kimyo va biologiya o'qituvchisi)",
        "Farmatsiya",
    ),
    "A.I. Gersen nomidagi Rossiya davlat pedagogika universiteti Toshkent filiali": _rows(
        # ru.hspu.org/.../tashkente/obrazovatelnye-programmy/
        "Maktabgacha ta'lim",
        "Bolalar psixologiyasi",
        "Surdopedagogika",
        "Tiflopedagogika",
        "Oligofrenopedagogika",
        "Inson psixologiyasi va ijtimoiy o'zaro ta'sir",
        "Rus tilini chet tili sifatida o'qitish nazariyasi va metodikasi",
        "Bolalarning qo'shimcha estetik ta'limi",
        "Oila va bolalar bilan ijtimoiy-pedagogik ish",
    ),
    "British Management University": _rows(
        # bmu-edu.uz/uz/page/undergraduate-programmes
        "Buxgalteriya hisobi va moliya",
        "Bank ishi va moliya",
        "Boshqaruv axborot tizimlari",
        "Loyiha boshqaruvi",
        "Logistika va ta'minot zanjiri boshqaruvi",
        "Raqamli marketing va elektron biznes",
        "Kommunikatsiya va jamoatchilik bilan aloqalar",
        "Iqtisodiyot va barqaror rivojlanish",
    ),
    "Termiz iqtisodiyot va servis universiteti": _rows(
        # tues.uz/resource/view/104
        "Iqtisodiyot",
        "Moliya va moliyaviy texnologiyalar",
        "Buxgalteriya hisobi",
        "Bank ishi",
        "Jahon iqtisodiyoti va xalqaro iqtisodiy munosabatlar",
        "Soliqlar va soliqqa tortish",
        "Xorijiy til va adabiyoti",
        "Boshlang'ich ta'lim",
        "Axborot tizimlari va texnologiyalari",
        "Turizm va mehmondo‘stlik",
        "Jismoniy madaniyat",
        "Maktabgacha ta'lim",
        "Filologiya va tillarni o'qitish (O'zbek tili)",
        "Filologiya va tillarni o'qitish (Rus tili)",
        "Filologiya va tillarni o'qitish (Ingliz tili)",
        "Matematika",
        "Texnologik ta'lim",
        "Psixologiya",
        "Tarix",
        "Biologiya",
        "Davolash ishi",
        "Stomatologiya",
        "Farmatsiya",
        "Pediatriya",
    ),
    "Angren universiteti": _rows(
        # ac.auni.uz/yonalishlar
        "Xorijiy til va adabiyoti (ingliz tili)",
        "Filologiya va tillarni o'qitish (ingliz/rus/fransuz/o'zbek tillari)",
        "Moliya va moliyaviy texnologiyalar",
        "Milliy g'oya, ma'naviyat asoslari va huquq ta'limi",
        "Axborot tizimlari va texnologiyalari",
    ),
    "Aniq va ijtimoiy fanlar universiteti": _rows(
        # aifu.uz/en/course-categories/bachelors-degree/
        "Xorijiy til va adabiyoti",
        "Filologiya va tillarni o'qitish (rus tili)",
        "Tarix",
        "Filologiya va tillarni o'qitish (o'zbek tili)",
        "Filologiya va tillarni o'qitish (xitoy tili)",
        "Filologiya va tillarni o'qitish (ingliz tili)",
        "Tarjima nazariyasi va amaliyoti (ingliz tili)",
        "Maktabgacha ta'lim",
        "Psixologiya",
        "Dizayn",
        "Sun'iy intellekt",
        "Dasturiy injiniring",
        "Matematika",
        "Amaliy matematika",
        "Menejment",
        "Turizm va mehmondo‘stlik",
        "Logistika",
        "Bank ishi",
        "Buxgalteriya hisobi",
        "Moliya va moliyaviy texnologiyalar",
        "Iqtisodiyot",
    ),
    "Turkiyaning iqtisodiyot va texnologiyalar universiteti filiali (TOBB ETU) Toshkent": _rows(
        # tobbetu.uz/app/application
        "International Business and Entrepreneurship",
        "E-commerce and Technology Management",
        "Architecture",
        "Interior Architecture and Environmental Design",
        "Industrial Engineering",
        "Iqtisodiyot",
        "Moliya",
        "Axborot texnologiyalarini boshqarish",
        "Turk tili va adabiyoti",
    ),
    "Samarqand xalqaro texnologiya universiteti": _rows(
        # siut.uz qabul e'loni
        "Axborot texnologiyalari",
        "Sun'iy intellekt",
        "Kimyo muhandisligi",
        "Neft-gaz muhandisligi",
        "Konchilik ishi",
        "Geologiya muhandisligi",
        "Xalqaro logistika",
        "Tadbirkorlik va menejment",
        "Issiqlik energetikasi",
        "Raqamli iqtisodiyot",
        "Dizayn",
        "Yashil texnologiyalar (qayta tiklanadigan energiya manbalari)",
    ),
    "MEI milliy tadqiqot universiteti Toshkent filiali": _rows(
        # mpei.ru/internationalactivities/.../uzbekistan.aspx
        "Elektroenergetika va elektrotexnika",
        "Issiqlik energetikasi va issiqlik texnikasi",
        "Yadro energetikasi va issiqlik fizikasi",
    ),
    "Toshkent gumanitar fanlar universiteti": _rows(
        # tgfu.uz, mentalaba.uz
        "Boshlang'ich ta'lim",
        "Pedagogika va psixologiya",
        "Filologiya va tillarni o'qitish",
        "Buxgalteriya hisobi va audit",
        "Turizm menejmenti",
        "Iqtisodiyotni boshqarish",
        "Jahon iqtisodiyoti va xalqaro iqtisodiy munosabatlar",
        "Moliya",
        "Axborot tizimlari va texnologiyalari",
        "Logistika",
        "Marketing",
    ),
    "Raqamli iqtisodiyot va agrotexnologiyalar universiteti": _rows(
        # udea.uz
        "Biznes boshqaruvi",
        "Moliya va bank ishi",
        "Biznes IT",
        "Marketing va PR",
        "Ingliz tili va TEFL",
        "Agrobiznes va investitsiyalar",
        "Raqamli iqtisodiyot",
        "Bank ishi",
        "Menejment",
        "Marketing",
        "Agrotexnologiyalar",
    ),
    "Millat umidi universiteti": _rows(
        # millatumidi.uz, mentalaba.uz (2024/25 rasmiy qabul)
        "Axborot texnologiyalari",
        "Ingliz tilini o'qitish",
        "Buxgalteriya va moliya",
        "Biznes boshqaruvi",
        "Biznesni boshqarish (xalqaro dastur)",
    ),
}
