from datetime import date, datetime, timezone as dt_timezone
from decimal import Decimal

from django.db import migrations, models
from django.utils.text import slugify


CITY_COORDINATES = {
    "Toshkent": (Decimal("41.299500"), Decimal("69.240100")),
    "Samarqand": (Decimal("39.654200"), Decimal("66.959700")),
    "Buxoro": (Decimal("39.774700"), Decimal("64.428600")),
    "Andijon": (Decimal("40.782100"), Decimal("72.344200")),
    "Namangan": (Decimal("40.998300"), Decimal("71.672600")),
    "Farg'ona": (Decimal("40.384200"), Decimal("71.784300")),
    "Nukus": (Decimal("42.461100"), Decimal("59.600300")),
    "Qarshi": (Decimal("38.860600"), Decimal("65.789100")),
    "Urganch": (Decimal("41.550000"), Decimal("60.633300")),
    "Jizzax": (Decimal("40.115800"), Decimal("67.842200")),
    "Termiz": (Decimal("37.224200"), Decimal("67.278300")),
}

OWNERSHIP_FROM_INSTITUTION = {
    "Davlat universiteti": "state",
    "Institut": "state",
    "Filial": "state",
    "Xususiy universitet": "private",
    "Xalqaro universitet": "international",
}

CONTACTS = {
    "TATU": {
        "phone": "+998 71 238-74-00",
        "email": "info@tatu.uz",
        "website": "https://tatu.uz",
        "telegram_url": "https://t.me/tatu_uz",
        "instagram_url": "https://instagram.com/tatu_uz",
        "address": "Amir Temur shoh ko'chasi 108, Toshkent",
    },
    "TDIU": {
        "phone": "+998 71 239-39-01",
        "email": "info@tsue.uz",
        "website": "https://tsue.uz",
        "telegram_url": "https://t.me/tsue_uz",
        "instagram_url": "https://instagram.com/tsue_uz",
        "address": "Chilonzor tumani, Toshkent",
    },
    "O'zMU": {
        "phone": "+998 71 246-27-67",
        "email": "info@nuu.uz",
        "website": "https://nuu.uz",
        "telegram_url": "https://t.me/nuu_uz",
        "instagram_url": "https://instagram.com/nuu_uz",
        "address": "Universitet ko'chasi 4, Toshkent",
    },
}

FACULTY_SEED = {
    "TATU": [
        {
            "name": "Axborot texnologiyalari fakulteti",
            "description": "Dasturlash, sun'iy intellekt va dasturiy injiniring.",
            "directions": [
                ("Dasturiy injiniring", "bachelor", 4),
                ("Kiberxavfsizlik", "bachelor", 4),
                ("Sun'iy intellekt", "master", 2),
            ],
        },
        {
            "name": "Telekommunikatsiya fakulteti",
            "description": "Telekom, tarmoq va aloqa tizimlari.",
            "directions": [
                ("Telekommunikatsiya texnologiyalari", "bachelor", 4),
                ("Mobil tizimlar", "bachelor", 4),
            ],
        },
    ],
    "TDIU": [
        {
            "name": "Iqtisodiyot fakulteti",
            "description": "Makroiqtisodiyot, moliya va biznes tahlili.",
            "directions": [
                ("Iqtisodiyot", "bachelor", 4),
                ("Moliya va kredit", "bachelor", 4),
                ("Biznes boshqaruvi", "master", 2),
            ],
        },
        {
            "name": "Xalqaro iqtisodiyot fakulteti",
            "description": "Savdo, logistika va xalqaro biznes.",
            "directions": [
                ("Xalqaro iqtisodiyot va menejment", "bachelor", 4),
                ("Logistika", "bachelor", 4),
            ],
        },
    ],
    "O'zMU": [
        {
            "name": "Tabiiy fanlar fakulteti",
            "description": "Matematika, fizika va biologiya yo'nalishlari.",
            "directions": [
                ("Matematika", "bachelor", 4),
                ("Biologiya", "bachelor", 4),
            ],
        },
        {
            "name": "Gumanitar fanlar fakulteti",
            "description": "Tarix, filologiya va ijtimoiy fanlar.",
            "directions": [
                ("Tarix", "bachelor", 4),
                ("Filologiya", "bachelor", 4),
            ],
        },
    ],
}


def extract_city(location):
    if not location:
        return ""
    return location.split(",")[0].strip()


def ownership_from_institution(institution_type):
    if not institution_type:
        return "state"
    mapped = OWNERSHIP_FROM_INSTITUTION.get(institution_type)
    if mapped:
        return mapped
    lowered = institution_type.lower()
    if "xususiy" in lowered:
        return "private"
    if "xalqaro" in lowered:
        return "international"
    return "state"


def build_gallery(university_id):
    seed = university_id or 1
    indices = [(seed + offset) % 8 + 1 for offset in range(3)]
    return [f"/images/campuses/campus-{index:02d}.jpg" for index in indices]


def coords_for_city(city, university_id):
    base = CITY_COORDINATES.get(city)
    if not base:
        return None, None
    offset = Decimal((university_id or 0) % 20 - 10) * Decimal("0.002")
    return base[0] + offset, base[1] + offset * Decimal("0.7")


def seed_catalog(apps, schema_editor):
    University = apps.get_model("universities", "University")
    Faculty = apps.get_model("universities", "Faculty")
    StudyDirection = apps.get_model("universities", "StudyDirection")
    AdmissionCycle = apps.get_model("universities", "AdmissionCycle")
    AdmissionQuota = apps.get_model("universities", "AdmissionQuota")

    for university in University.objects.all():
        city = extract_city(university.location)
        lat, lng = coords_for_city(city, university.id)
        contacts = CONTACTS.get(university.short_name, {})
        university.city = city
        university.ownership_type = ownership_from_institution(university.institution_type)
        university.latitude = lat
        university.longitude = lng
        university.gallery_urls = build_gallery(university.id)
        university.address = contacts.get("address", university.location)
        university.phone = contacts.get("phone", "")
        university.email = contacts.get("email", "")
        university.website = contacts.get("website", "")
        university.telegram_url = contacts.get("telegram_url", "")
        university.instagram_url = contacts.get("instagram_url", "")
        university.save(
            update_fields=[
                "city",
                "ownership_type",
                "latitude",
                "longitude",
                "gallery_urls",
                "address",
                "phone",
                "email",
                "website",
                "telegram_url",
                "instagram_url",
            ]
        )

    direction_map = {}
    for short_name, faculties in FACULTY_SEED.items():
        university = University.objects.filter(short_name=short_name).first()
        if not university:
            continue
        for faculty_index, faculty_data in enumerate(faculties):
            faculty, _ = Faculty.objects.get_or_create(
                university=university,
                slug=slugify(faculty_data["name"])[:120],
                defaults={
                    "name": faculty_data["name"],
                    "description": faculty_data["description"],
                    "sort_order": faculty_index,
                },
            )
            for direction_index, (name, degree, years) in enumerate(faculty_data["directions"]):
                direction, _ = StudyDirection.objects.get_or_create(
                    faculty=faculty,
                    slug=slugify(name)[:120],
                    defaults={
                        "name": name,
                        "degree_level": degree,
                        "duration_years": Decimal(str(years)),
                        "sort_order": direction_index,
                    },
                )
                direction_map[(short_name, name)] = direction

        cycle, _ = AdmissionCycle.objects.get_or_create(
            university=university,
            academic_year="2025-2026",
            defaults={
                "application_deadline": date(2025, 8, 15),
                "exam_date": date(2025, 8, 1),
                "notes": "Ma'lumotlar rasmiy e'lonlar asosida yangilanadi.",
                "status": "published",
                "published_at": datetime(2025, 1, 10, tzinfo=dt_timezone.utc),
            },
        )

        quota_rows = {
            "TATU": [
                ("Dasturiy injiniring", 120, 180, 142.5),
                ("Kiberxavfsizlik", 60, 90, 138.0),
                ("Telekommunikatsiya texnologiyalari", 80, 120, 135.5),
            ],
            "TDIU": [
                ("Iqtisodiyot", 150, 200, 128.0),
                ("Moliya va kredit", 90, 140, 131.5),
                ("Xalqaro iqtisodiyot va menejment", 70, 110, 126.0),
            ],
            "O'zMU": [
                ("Matematika", 80, 100, 125.0),
                ("Biologiya", 60, 80, 122.5),
                ("Tarix", 50, 70, 118.0),
            ],
        }.get(short_name, [])

        for direction_name, grant, contract, min_score in quota_rows:
            direction = direction_map.get((short_name, direction_name))
            AdmissionQuota.objects.get_or_create(
                cycle=cycle,
                direction=direction,
                defaults={
                    "grant_quota": grant,
                    "contract_quota": contract,
                    "min_score": Decimal(str(min_score)),
                    "language": "uz",
                },
            )


def unseed_catalog(apps, schema_editor):
    Faculty = apps.get_model("universities", "Faculty")
    AdmissionCycle = apps.get_model("universities", "AdmissionCycle")
    Faculty.objects.all().delete()
    AdmissionCycle.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0019_article"),
    ]

    operations = [
        migrations.AddField(
            model_name="university",
            name="address",
            field=models.CharField(blank=True, max_length=220),
        ),
        migrations.AddField(
            model_name="university",
            name="city",
            field=models.CharField(blank=True, db_index=True, max_length=80),
        ),
        migrations.AddField(
            model_name="university",
            name="email",
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name="university",
            name="gallery_urls",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="university",
            name="instagram_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="university",
            name="latitude",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name="university",
            name="longitude",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name="university",
            name="ownership_type",
            field=models.CharField(
                blank=True,
                choices=[
                    ("state", "Davlat"),
                    ("private", "Xususiy"),
                    ("international", "Xalqaro"),
                ],
                db_index=True,
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="university",
            name="phone",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="university",
            name="telegram_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="university",
            name="website",
            field=models.URLField(blank=True),
        ),
        migrations.CreateModel(
            name="Faculty",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=160)),
                ("slug", models.SlugField(max_length=120)),
                ("description", models.TextField(blank=True)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                (
                    "university",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="faculties",
                        to="universities.university",
                    ),
                ),
            ],
            options={
                "verbose_name_plural": "faculties",
                "ordering": ["sort_order", "name"],
                "unique_together": {("university", "slug")},
            },
        ),
        migrations.CreateModel(
            name="StudyDirection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=160)),
                ("slug", models.SlugField(max_length=120)),
                (
                    "degree_level",
                    models.CharField(
                        choices=[
                            ("bachelor", "Bakalavr"),
                            ("master", "Magistr"),
                            ("doctorate", "Doktorantura"),
                        ],
                        default="bachelor",
                        max_length=20,
                    ),
                ),
                ("duration_years", models.DecimalField(blank=True, decimal_places=1, max_digits=3, null=True)),
                ("description", models.TextField(blank=True)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                (
                    "faculty",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="directions",
                        to="universities.faculty",
                    ),
                ),
            ],
            options={
                "ordering": ["sort_order", "name"],
                "unique_together": {("faculty", "slug")},
            },
        ),
        migrations.CreateModel(
            name="AdmissionCycle",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("academic_year", models.CharField(max_length=16)),
                ("application_deadline", models.DateField(blank=True, null=True)),
                ("exam_date", models.DateField(blank=True, null=True)),
                ("notes", models.TextField(blank=True)),
                (
                    "status",
                    models.CharField(
                        choices=[("draft", "Qoralama"), ("published", "Nashr qilingan")],
                        default="draft",
                        max_length=20,
                    ),
                ),
                ("published_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "university",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="admission_cycles",
                        to="universities.university",
                    ),
                ),
            ],
            options={
                "verbose_name": "Qabul davri",
                "ordering": ["-academic_year"],
                "unique_together": {("university", "academic_year")},
            },
        ),
        migrations.CreateModel(
            name="AdmissionQuota",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("grant_quota", models.PositiveIntegerField(blank=True, null=True)),
                ("contract_quota", models.PositiveIntegerField(blank=True, null=True)),
                ("min_score", models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ("language", models.CharField(blank=True, max_length=16)),
                (
                    "cycle",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="quotas",
                        to="universities.admissioncycle",
                    ),
                ),
                (
                    "direction",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.deletion.CASCADE,
                        related_name="admission_quotas",
                        to="universities.studydirection",
                    ),
                ),
            ],
            options={
                "verbose_name": "Qabul kvotasi",
                "verbose_name_plural": "Qabul kvotalari",
                "ordering": ["direction__sort_order", "direction__name", "id"],
            },
        ),
        migrations.RunPython(seed_catalog, unseed_catalog),
    ]
