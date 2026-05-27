from django.db import migrations

MORE_UNIVERSITIES = [
    {
        "name": "O'zbekiston milliy universiteti",
        "short_name": "O'zMU",
        "location": "Toshkent, O'zbekiston",
        "description": "O'zbekistonning yetakchi milliy universiteti.",
    },
    {
        "name": "Toshkent davlat texnika universiteti",
        "short_name": "TDTU",
        "location": "Toshkent, O'zbekiston",
        "description": "Muhandislik, texnika va qurilish yo'nalishlari.",
    },
    {
        "name": "Toshkent tibbiyot akademiyasi",
        "short_name": "TTA",
        "location": "Toshkent, O'zbekiston",
        "description": "Tibbiyot, farmatsevtika va sog'liqni saqlash.",
    },
    {
        "name": "Toshkent davlat sharqshunoslik universiteti",
        "short_name": "TDShU",
        "location": "Toshkent, O'zbekiston",
        "description": "Sharq tillari, tarix va xalqaro munosabatlar.",
    },
    {
        "name": "O'zbekiston davlat jahon tillari universiteti",
        "short_name": "O'zDJTU",
        "location": "Toshkent, O'zbekiston",
        "description": "Chet tillari, tarjima va lingvistika.",
    },
    {
        "name": "Toshkent davlat yuridik universiteti",
        "short_name": "TDYU",
        "location": "Toshkent, O'zbekiston",
        "description": "Huquq, davlat boshqaruvi va kriminologiya.",
    },
    {
        "name": "Toshkent davlat pedagogika universiteti",
        "short_name": "TDPU",
        "location": "Toshkent, O'zbekiston",
        "description": "Pedagogika, psixologiya va ta'lim.",
    },
    {
        "name": "Toshkent davlat agrar universiteti",
        "short_name": "TDAU",
        "location": "Toshkent, O'zbekiston",
        "description": "Qishloq xo'jaligi, agronomiya va veterinariya.",
    },
    {
        "name": "Toshkent kimyo-texnologiya instituti",
        "short_name": "TKTI",
        "location": "Toshkent, O'zbekiston",
        "description": "Kimyo, neft-gaz va qayta ishlash texnologiyalari.",
    },
    {
        "name": "Toshkent davlat transport universiteti",
        "short_name": "TDTU Transport",
        "location": "Toshkent, O'zbekiston",
        "description": "Transport, logistika va temir yo'l.",
    },
    {
        "name": "Toshkent davlat konservatoriyasi",
        "short_name": "TDK",
        "location": "Toshkent, O'zbekiston",
        "description": "Musiqa, san'at va ijodiy yo'nalishlar.",
    },
    {
        "name": "Toshkent davlat iqtisodiyot universiteti (Samarqand filiali)",
        "short_name": "TDIU Samarqand",
        "location": "Samarqand, O'zbekiston",
        "description": "Iqtisodiyot va biznes filiali.",
    },
    {
        "name": "Samarqand davlat universiteti",
        "short_name": "SamDU",
        "location": "Samarqand, O'zbekiston",
        "description": "Ko'p yo'nalishli davlat universiteti.",
    },
    {
        "name": "Samarqand davlat arxitektura-qurilish universiteti",
        "short_name": "Samarqand AQQU",
        "location": "Samarqand, O'zbekiston",
        "description": "Arxitektura va qurilish.",
    },
    {
        "name": "Samarqand davlat tibbiyot universiteti",
        "short_name": "SamDTU",
        "location": "Samarqand, O'zbekiston",
        "description": "Tibbiyot va farmatsevtika.",
    },
    {
        "name": "Samarqand davlat chet tillar instituti",
        "short_name": "SamDChTI",
        "location": "Samarqand, O'zbekiston",
        "description": "Chet tillari va tarjimonlik.",
    },
    {
        "name": "Buxoro davlat universiteti",
        "short_name": "BuxDU",
        "location": "Buxoro, O'zbekiston",
        "description": "Ko'p yo'nalishli davlat universiteti.",
    },
    {
        "name": "Buxoro muhandislik-texnologiya instituti",
        "short_name": "BuxMTI",
        "location": "Buxoro, O'zbekiston",
        "description": "Muhandislik va texnologiya.",
    },
    {
        "name": "Andijon davlat universiteti",
        "short_name": "AndDU",
        "location": "Andijon, O'zbekiston",
        "description": "Ko'p yo'nalishli davlat universiteti.",
    },
    {
        "name": "Farg'ona davlat universiteti",
        "short_name": "FarDU",
        "location": "Farg'ona, O'zbekiston",
        "description": "Ko'p yo'nalishli davlat universiteti.",
    },
    {
        "name": "Namangan davlat universiteti",
        "short_name": "NamDU",
        "location": "Namangan, O'zbekiston",
        "description": "Ko'p yo'nalishli davlat universiteti.",
    },
    {
        "name": "Qarshi davlat universiteti",
        "short_name": "QarDU",
        "location": "Qarshi, O'zbekiston",
        "description": "Qashqadaryo viloyati universiteti.",
    },
    {
        "name": "Nukus davlat pedagogika instituti",
        "short_name": "NDPI",
        "location": "Nukus, O'zbekiston",
        "description": "Qoraqalpog'iston pedagogika instituti.",
    },
    {
        "name": "Urgench davlat universiteti",
        "short_name": "UrDU",
        "location": "Urganch, O'zbekiston",
        "description": "Xorazm viloyati universiteti.",
    },
    {
        "name": "Jizzax politexnika instituti",
        "short_name": "JizPI",
        "location": "Jizzax, O'zbekiston",
        "description": "Texnika va muhandislik.",
    },
    {
        "name": "Navoiy davlat konchilik instituti",
        "short_name": "NDKI",
        "location": "Navoiy, O'zbekiston",
        "description": "Konchilik va metallurgiya.",
    },
    {
        "name": "Termiz davlat universiteti",
        "short_name": "TerDU",
        "location": "Termiz, O'zbekiston",
        "description": "Surxondaryo viloyati universiteti.",
    },
    {
        "name": "Westminster International University in Tashkent",
        "short_name": "WIUT",
        "location": "Toshkent, O'zbekiston",
        "description": "Xalqaro biznes va iqtisodiyot.",
    },
    {
        "name": "INHA University in Tashkent",
        "short_name": "INHA",
        "location": "Toshkent, O'zbekiston",
        "description": "IT va muhandislik (xalqaro).",
    },
    {
        "name": "Turin politexnika universiteti (Toshkent)",
        "short_name": "TTPU",
        "location": "Toshkent, O'zbekiston",
        "description": "Muhandislik va dizayn.",
    },
    {
        "name": "Management Development Institute of Singapore in Tashkent",
        "short_name": "MDIS",
        "location": "Toshkent, O'zbekiston",
        "description": "Biznes va boshqaruv.",
    },
    {
        "name": "Kimyo xalqaro universiteti",
        "short_name": "KIUT",
        "location": "Toshkent, O'zbekiston",
        "description": "Xalqaro ta'lim va biznes.",
    },
    {
        "name": "Toshkent iqtisodiyot va texnologiyalar universiteti",
        "short_name": "TIQTU",
        "location": "Toshkent, O'zbekiston",
        "description": "Iqtisodiyot va raqamli texnologiyalar.",
    },
    {
        "name": "Toshkent xalqaro moliya instituti",
        "short_name": "TXMI",
        "location": "Toshkent, O'zbekiston",
        "description": "Moliya, bank va investitsiya.",
    },
    {
        "name": "O'zbekiston jurnalistika va ommaviy kommunikatsiyalar universiteti",
        "short_name": "O'zJOKU",
        "location": "Toshkent, O'zbekiston",
        "description": "Jurnalistika va media.",
    },
    {
        "name": "Toshkent arxitektura-qurilish instituti",
        "short_name": "TAQI",
        "location": "Toshkent, O'zbekiston",
        "description": "Arxitektura va shaharsozlik.",
    },
    {
        "name": "Toshkent davlat stomatologiya instituti",
        "short_name": "TDSI",
        "location": "Toshkent, O'zbekiston",
        "description": "Stomatologiya va tish protezlari.",
    },
    {
        "name": "Toshkent farmatsevtika instituti",
        "short_name": "TFI",
        "location": "Toshkent, O'zbekiston",
        "description": "Farmatsevtika va farmakologiya.",
    },
    {
        "name": "O'zbekiston davlat san'at va madaniyat instituti",
        "short_name": "O'zDSMI",
        "location": "Toshkent, O'zbekiston",
        "description": "San'at, dizayn va madaniyat.",
    },
    {
        "name": "Toshkent davlat o'zbek tili va adabiyoti universiteti",
        "short_name": "TDO'zTUA",
        "location": "Toshkent, O'zbekiston",
        "description": "O'zbek tili, adabiyot va filologiya.",
    },
]


def seed_more_universities(apps, schema_editor):
    University = apps.get_model("universities", "University")
    for university in MORE_UNIVERSITIES:
        University.objects.get_or_create(name=university["name"], defaults=university)


def remove_more_universities(apps, schema_editor):
    University = apps.get_model("universities", "University")
    University.objects.filter(name__in=[university["name"] for university in MORE_UNIVERSITIES]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0003_chat_models"),
    ]

    operations = [
        migrations.RunPython(seed_more_universities, remove_more_universities),
    ]
