from django.db import migrations, models

UNIVERSITY_SUMMARIES = {
    "TDIU": (
        "O'zbekistonning yetakchi iqtisodiyot oliygohi. Moliya, biznes, marketing va "
        "davlat boshqaruvi yo'nalishlarida kuchli amaliy ta'lim beradi."
    ),
    "TDIU Samarqand": (
        "TDIU ning Samarqand filiali. Iqtisodiyot, buxgalteriya va biznes boshqaruvi "
        "bo'yicha talabalar uchun zamonaviy o'quv dasturlari mavjud."
    ),
    "TATU": (
        "Axborot texnologiyalari va telekommunikatsiya markazi. Dasturiy injiniring, "
        "kiberxavfsizlik hamda sun'iy intellekt yo'nalishlari mashhur."
    ),
    "O'zMU": (
        "Milliy darajadagi ko'p fakultetli universitet. Aniq va ijtimoiy fanlar, "
        "xalqaro hamkorlik hamda ilmiy tadqiqotlar bilan ajralib turadi."
    ),
    "TDTU": (
        "Muhandislik va texnika sohasidagi yirik oliygoh. Energetika, mashinasozlik, "
        "qurilish va zamonaviy ishlab chiqarish texnologiyalari o'qitiladi."
    ),
    "TDTU Transport": (
        "Transport va logistika mutaxassislarini tayyorlaydi. Temir yo'l, avtomobil "
        "transporti hamda xalqaro yuk tashish tizimlari bo'yicha ta'lim beriladi."
    ),
    "TTA": (
        "Tibbiyot va farmatsevtika sohasidagi yetakchi markaz. Klinik amaliyot, "
        "tadqiqot laboratoriyalari va sog'liqni saqlash kadrlarini tayyorlaydi."
    ),
    "TDShU": (
        "Sharqshunoslik, tarix va madaniyatshunoslikka ixtisoslashgan. Xalqaro "
        "munosabatlar, filologiya hamda mintaqaviy tadqiqotlar keng yuritiladi."
    ),
    "O'zDJTU": (
        "Chet va dunyo tillarini o'qitishga qaratilgan universitet. Tarjimonlik, "
        "lingvistika, xalqaro aloqa va diplomatik muloqot yo'nalishlari keng."
    ),
    "TDYU": (
        "Yuridik ta'lim va huquqni ta'minlash markazi. Davlat boshqaruvi, kriminologiya, "
        "xalqaro huquq hamda advokatlikka tayyorgarlik dasturlari mavjud."
    ),
    "TDPU": (
        "Pedagog kadrlar va ta'lim mutaxassislarini tayyorlaydi. Boshlang'ich ta'lim, "
        "psixologiya, maxsus pedagogika hamda zamonaviy o'qitish metodikalari o'qitiladi."
    ),
    "TDAU": (
        "Qishloq xo'jaligi va agrosanoat klasteri uchun kadrlar yetishtiradi. Agronomiya, "
        "veterinariya, oziq-ovqat xavfsizligi yo'nalishlari amaliy yo'naltirilgan."
    ),
    "TKTI": (
        "Kimyo, neft-gaz va qayta ishlash sanoati uchun mutaxassislar tayyorlaydi. "
        "Laboratoriya amaliyoti va sanoat bilan hamkorlik kuchli rivojlangan."
    ),
    "TDK": (
        "Musiqa, vokal va ijodiy san'at sohasidagi nufuzli oliygoh. Konsert faoliyati, "
        "estrada va an'anaviy san'at yo'nalishlarida chuqur ta'lim beriladi."
    ),
    "SamDU": (
        "Samarqanddagi eng qadimiy va yirik universitetlardan biri. Ko'p yo'nalishli "
        "ta'lim, tarixiy kampус hamda mintaviy ilm-fan markazi sifatida tanilgan."
    ),
    "Samarqand AQQU": (
        "Arxitektura, qurilish va muhandislik dizayniga ixtisoslashgan. Shaharsozlik, "
        "loyihalashtirish va barqaror qurilish texnologiyalari o'qitiladi."
    ),
    "SamDTU": (
        "Samarqand viloyatida tibbiyot kadrlarini tayyorlaydi. Terapiya, pediatriya, "
        "stomatologiya hamda jamoat salomatligi yo'nalishlari mavjud."
    ),
    "SamDChTI": (
        "Chet tillari va tarjimonlikka qaratilgan institut. Ingliz, nemis va boshqa "
        "tillar bo'yicha amaliy muloqotga urg'u beriladi."
    ),
    "BuxDU": (
        "Buxoro viloyatining asosiy oliy o'quv markazi. Pedagogika, iqtisodiyot, "
        "tabiiy fanlar va gumanitar yo'nalishlarda keng ta'lim dasturlari bor."
    ),
    "BuxMTI": (
        "Buxoroda muhandislik va texnologiya kadrlarini tayyorlaydi. Energetika, "
        "mashinasozlik va sanoat avtomatlashtirish yo'nalishlari o'qitiladi."
    ),
    "AndDU": (
        "Andijon viloyati talabalarining asosiy universiteti. Iqtisodiyot, pedagogika, "
        "texnika va ijtimoiy fanlar bo'yicha bakalavr hamda magistr dasturlari mavjud."
    ),
    "FarDU": (
        "Farg'ona vodiysidagi yirik ko'p yo'nalishli oliygoh. Muhandislik, agrar, "
        "iqtisodiyot va gumanitar fakultetlar talabalarga tanlov beradi."
    ),
    "NamDU": (
        "Namangan viloyatida zamonaviy ta'lim va tadqiqot markazi. Texnika, "
        "iqtisodiyot, pedagogika hamda IT yo'nalishlarida o'quv dasturlari keng."
    ),
    "QarDU": (
        "Qashqadaryo viloyati uchun muhim oliy ta'lim markazi. Qishloq xo'jaligi, "
        "iqtisodiyot va muhandislik yo'nalishlarida mintaviy kadrlar tayyorlanadi."
    ),
    "NDPI": (
        "Qoraqalpog'istonda pedagog kadrlar tayyorlaydi. Boshlang'ich va o'rta maktab "
        "uchun o'qituvchilar, psixologiya hamda maxsus ta'lim yo'nalishlari mavjud."
    ),
    "UrDU": (
        "Xorazm viloyatining yetakchi universiteti. Tarix, pedagogika, iqtisodiyot "
        "va tabiiy fanlar bo'yicha talabalar uchun barqaror ta'lim muhiti."
    ),
    "JizPI": (
        "Jizzax viloyatida texnika va muhandislik mutaxassislarini tayyorlaydi. "
        "Energetika, qurilish va sanoat yo'nalishlarida amaliy ko'nikmalar beriladi."
    ),
    "NDKI": (
        "Navoiy kon-metallurgiya klasteri uchun kadrlar yetishtiradi. Konchilik, "
        "geologiya, metallurgiya va sanoat xavfsizligi yo'nalishlari o'qitiladi."
    ),
    "TerDU": (
        "Surxondaryo viloyatidagi asosiy oliygoh. Iqtisodiyot, pedagogika, agrar "
        "va gumanitar yo'nalishlarda mintaviy talabalar o'qiydi."
    ),
    "WIUT": (
        "Britaniya ta'lim tizimi asosidagi xalqaro universitet. Biznes, iqtisodiyot "
        "va qonunchilik yo'nalishlarida ingliz tilida ta'lim beriladi."
    ),
    "INHA": (
        "Koreya ta'lim modeli asosidagi texnika universiteti. Kompyuter injiniring, "
        "elektronika va zamonaviy muhandislik dasturlari bilan mashhur."
    ),
    "TTPU": (
        "Italiya Politecnico di Torino hamkorligidagi universitet. Muhandislik, arxitektura "
        "va dizayn yo'nalishlarida xalqaro standartlarga yaqin ta'lim beriladi."
    ),
    "MDIS": (
        "Singapur boshqaruv maktabi filiali. Biznes, marketing, bank ishi va "
        "loyihaviy boshqaruv bo'yicha amaliy va zamonaviy dasturlar mavjud."
    ),
    "KIUT": (
        "Xalqaro ta'lim va biznes yo'nalishlariga e'tibor qaratadi. Chet tillari, "
        "iqtisodiyot hamda zamonaviy kommunikatsiya ko'nikmalari o'qitiladi."
    ),
    "TIQTU": (
        "Iqtisodiyot va raqamli texnologiyalar universiteti. IT, moliya, logistika "
        "hamda kichik biznes boshqaruvi yo'nalishlarida ta'lim beriladi."
    ),
    "TXMI": (
        "Moliya, bank va investitsiya sohasiga ixtisoslashgan institut. Buxgalteriya, "
        "audit, moliyaviy tahlil hamda bozor iqtisodiyoti o'qitiladi."
    ),
    "O'zJOKU": (
        "Jurnalistika va ommaviy kommunikatsiyalar universiteti. Matbuot, PR, "
        "televideniye va raqamli media yo'nalishlarida amaliy ta'lim beriladi."
    ),
    "TAQI": (
        "Arxitektura va shaharsozlik kadrlarini tayyorlaydi. Qurilish dizayni, "
        "loyihalashtirish va barqaror shahar muhiti masalalari o'qitiladi."
    ),
    "TDSI": (
        "Stomatologiya va tish protezlari mutaxassislarini tayyorlaydi. Klinik amaliyot, "
        "zamonaviy uskunalar va bemor bilan ishlash ko'nikmalari beriladi."
    ),
    "TFI": (
        "Farmatsevtika va farmakologiya sohasidagi qadimiy institut. Dori-darmon ishlab "
        "chiqarish, laboratoriya tahlili va klinik farmatsiya o'qitiladi."
    ),
    "O'zDSMI": (
        "San'at, dizayn va madaniyat sohasidagi yirik markaz. Musiqa, tasviriy san'at, "
        "teatr va ijodiy industriyalar uchun kadrlar tayyorlanadi."
    ),
    "TDO'zTUA": (
        "O'zbek tili, adabiyot va milliy madaniyatga ixtisoslashgan. Filologiya, "
        "jurnalistika hamda o'qituvchilik yo'nalishlarida chuqur ta'lim beriladi."
    ),
}


def apply_summaries(apps, schema_editor):
    University = apps.get_model("universities", "University")
    for university in University.objects.all():
        summary = UNIVERSITY_SUMMARIES.get(university.short_name)
        if summary:
            university.summary = summary
            university.save(update_fields=["summary"])


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0007_university_founded_year"),
    ]

    operations = [
        migrations.AddField(
            model_name="university",
            name="summary",
            field=models.TextField(blank=True),
        ),
        migrations.RunPython(apply_summaries, migrations.RunPython.noop),
    ]
