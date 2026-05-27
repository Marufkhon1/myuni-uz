from django.db import migrations, models

# short_name yoki name bo'yicha tashkil yili va tur
UNIVERSITY_META = {
    "TDIU": {"founded_year": 1931, "institution_type": "Davlat universiteti"},
    "TDIU Samarqand": {"founded_year": 1992, "institution_type": "Filial"},
    "TATU": {"founded_year": 1955, "institution_type": "Davlat universiteti"},
    "O'zMU": {"founded_year": 1991, "institution_type": "Davlat universiteti"},
    "TDTU": {"founded_year": 1933, "institution_type": "Davlat universiteti"},
    "TDTU Transport": {"founded_year": 1933, "institution_type": "Davlat universiteti"},
    "TTA": {"founded_year": 1935, "institution_type": "Davlat universiteti"},
    "TDShU": {"founded_year": 1991, "institution_type": "Davlat universiteti"},
    "O'zDJTU": {"founded_year": 1949, "institution_type": "Davlat universiteti"},
    "TDYU": {"founded_year": 1991, "institution_type": "Davlat universiteti"},
    "TDPU": {"founded_year": 1935, "institution_type": "Davlat universiteti"},
    "TDAU": {"founded_year": 1930, "institution_type": "Davlat universiteti"},
    "TKTI": {"founded_year": 1933, "institution_type": "Institut"},
    "TDK": {"founded_year": 1945, "institution_type": "Davlat universiteti"},
    "SamDU": {"founded_year": 1927, "institution_type": "Davlat universiteti"},
    "Samarqand AQQU": {"founded_year": 1932, "institution_type": "Davlat universiteti"},
    "SamDTU": {"founded_year": 1930, "institution_type": "Davlat universiteti"},
    "SamDChTI": {"founded_year": 1994, "institution_type": "Institut"},
    "BuxDU": {"founded_year": 1992, "institution_type": "Davlat universiteti"},
    "BuxMTI": {"founded_year": 1999, "institution_type": "Institut"},
    "AndDU": {"founded_year": 1930, "institution_type": "Davlat universiteti"},
    "FarDU": {"founded_year": 1930, "institution_type": "Davlat universiteti"},
    "NamDU": {"founded_year": 1963, "institution_type": "Davlat universiteti"},
    "QarDU": {"founded_year": 1992, "institution_type": "Davlat universiteti"},
    "NDPI": {"founded_year": 1975, "institution_type": "Institut"},
    "UrDU": {"founded_year": 1992, "institution_type": "Davlat universiteti"},
    "JizPI": {"founded_year": 1996, "institution_type": "Institut"},
    "NDKI": {"founded_year": 1995, "institution_type": "Institut"},
    "TerDU": {"founded_year": 1992, "institution_type": "Davlat universiteti"},
    "WIUT": {"founded_year": 2002, "institution_type": "Xalqaro universitet"},
    "INHA": {"founded_year": 2015, "institution_type": "Xalqaro universitet"},
    "TTPU": {"founded_year": 2009, "institution_type": "Xalqaro universitet"},
    "MDIS": {"founded_year": 2007, "institution_type": "Xalqaro universitet"},
    "KIUT": {"founded_year": 1992, "institution_type": "Xalqaro universitet"},
    "TIQTU": {"founded_year": 2012, "institution_type": "Davlat universiteti"},
    "TXMI": {"founded_year": 2001, "institution_type": "Institut"},
    "O'zJOKU": {"founded_year": 2019, "institution_type": "Davlat universiteti"},
    "TAQI": {"founded_year": 1930, "institution_type": "Institut"},
    "TDSI": {"founded_year": 2014, "institution_type": "Institut"},
    "TFI": {"founded_year": 1937, "institution_type": "Institut"},
    "O'zDSMI": {"founded_year": 1945, "institution_type": "Davlat universiteti"},
    "TDO'zTUA": {"founded_year": 1991, "institution_type": "Davlat universiteti"},
}


def apply_university_meta(apps, schema_editor):
    University = apps.get_model("universities", "University")
    for university in University.objects.all():
        meta = UNIVERSITY_META.get(university.short_name)
        if not meta:
            continue
        university.founded_year = meta["founded_year"]
        university.institution_type = meta["institution_type"]
        university.save(update_fields=["founded_year", "institution_type"])


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0006_chat_read_tracking"),
    ]

    operations = [
        migrations.AddField(
            model_name="university",
            name="founded_year",
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="university",
            name="institution_type",
            field=models.CharField(blank=True, max_length=48),
        ),
        migrations.RunPython(apply_university_meta, migrations.RunPython.noop),
    ]
