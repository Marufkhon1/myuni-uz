from django.db import migrations, models
from django.utils import timezone


SEED_ARTICLE = {
    "title": "Universitet tanlashda MyUni.uz qanday yordam beradi?",
    "slug": "universitet-tanlashda-myuni-qanday-yordam-beradi",
    "excerpt": (
        "Abituriyentlar uchun sharhlarni o'qish, universitetlarni taqqoslash "
        "va chat orqali savol berish bo'yicha qisqa qo'llanma."
    ),
    "body": (
        "MyUni.uz abituriyent va talabalarni bir platformada birlashtiradi. "
        "Agar siz universitet tanlayotgan bo'lsangiz, bu maqolada platformadan "
        "qanday foydalanishni qisqa ko'rib chiqamiz.\n\n"
        "Har bir universitet uchun alohida ochiq sahifa mavjud. U yerda talabalar "
        "o'z tajribasini baholagan — o'qituvchilar, yotoqxona, infratuzilma va "
        "kundalik hayot haqida. Sharhlar moderatsiyadan o'tgach ochiq ko'rinadi.\n\n"
        "Kabinetda ikki yoki undan ortiq universitetni yonma-yon solishtirish mumkin. "
        "Reyting, sharhlar soni va qisqa tavsiflar yordamida tezroq qaror qabul qilasiz.\n\n"
        "Universitet guruh chatlariga qo'shiling. Mavjud talabalardan qabul jarayoni, "
        "fanlar yuklamasi yoki tadbirlar haqida to'g'ridan-to'g'ri javob olish mumkin.\n\n"
        "Ro'yxatdan o'ting, abituriyent yoki talaba sifatida profil yarating va "
        "platformani o'zingiz sinab ko'ring. Asosiy funksiyalar bepul."
    ),
}


def seed_platform_guide(apps, schema_editor):
    Article = apps.get_model("universities", "Article")
    if Article.objects.filter(slug=SEED_ARTICLE["slug"]).exists():
        return
    Article.objects.create(
        status="published",
        published_at=timezone.now(),
        **SEED_ARTICLE,
    )


def unseed_platform_guide(apps, schema_editor):
    Article = apps.get_model("universities", "Article")
    Article.objects.filter(slug=SEED_ARTICLE["slug"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0018_review_moderation"),
    ]

    operations = [
        migrations.CreateModel(
            name="Article",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=220)),
                ("slug", models.SlugField(max_length=220, unique=True)),
                ("excerpt", models.TextField(blank=True, max_length=500)),
                ("body", models.TextField()),
                ("cover_image", models.URLField(blank=True)),
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
            ],
            options={
                "verbose_name": "Maqola",
                "verbose_name_plural": "Maqolalar",
                "ordering": ["-published_at", "-created_at"],
            },
        ),
        migrations.RunPython(seed_platform_guide, unseed_platform_guide),
    ]
