from django.db import migrations


UNIVERSITIES = [
    {
        "name": "Toshkent davlat iqtisodiyot universiteti",
        "short_name": "TDIU",
        "location": "Toshkent, O'zbekiston",
        "description": "Iqtisodiyot, moliya, biznes va boshqaruv yo'nalishlari bo'yicha universitet.",
    },
    {
        "name": "TDIU Samarqand filiali",
        "short_name": "TDIU Samarqand",
        "location": "Samarqand, O'zbekiston",
        "description": "Raqamli iqtisodiyot va amaliy biznes loyihalari bilan bog'liq filial.",
    },
    {
        "name": "Toshkent axborot texnologiyalari universiteti",
        "short_name": "TATU",
        "location": "Toshkent, O'zbekiston",
        "description": "IT, dasturlash, telekommunikatsiya va raqamli texnologiyalar yo'nalishlari.",
    },
]


def seed_universities(apps, schema_editor):
    University = apps.get_model("universities", "University")
    for university in UNIVERSITIES:
        University.objects.get_or_create(name=university["name"], defaults=university)


def remove_seeded_universities(apps, schema_editor):
    University = apps.get_model("universities", "University")
    University.objects.filter(name__in=[university["name"] for university in UNIVERSITIES]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_universities, remove_seeded_universities),
    ]
