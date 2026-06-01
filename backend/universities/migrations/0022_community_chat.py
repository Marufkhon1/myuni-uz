from django.conf import settings
from django.db import migrations, models
from django.utils.text import slugify


FAQ_SEED = [
    (
        "MyUni.uz bepulmi?",
        "Ha. Ro'yxatdan o'tish, sharhlarni o'qish, universitetlarni taqqoslash va chatga qo'shilish bepul. Platforma abituriyent va talabalar uchun ochiq.",
    ),
    (
        "Sharh yozish kimlar uchun?",
        "Sharh yozish faqat tasdiqlangan talaba profili uchun ochiq. Abituriyentlar sharhlarni o'qishi, taqqoslashi va chatda savol berishi mumkin.",
    ),
    (
        "Sharhlar qanday tekshiriladi?",
        "Ba'zi sharhlar moderatsiyadan o'tadi. Haqorat, spam yoki qoidabuzarlik bo'lsa, sharh yashiriladi yoki rad etiladi. Sharh qoidalari sahifasida batafsil ma'lumot bor.",
    ),
    (
        "Universitet chatiga qanday qo'shilaman?",
        "Kabinetda «Chatlar» bo'limiga kiring, universitetni tanlang va «Qo'shilish» tugmasini bosing. Guruh chatida mavjud talabalar bilan muloqot qilishingiz mumkin.",
    ),
    (
        "Abituriyent va talaba farqi nima?",
        "Abituriyent — universitet tanlayotgan foydalanuvchi: sharhlarni o'qiydi, taqqoslaydi va chatda savol beradi. Talaba — o'qish tajribasini baholab sharh qoldirishi mumkin.",
    ),
    (
        "Ma'lumotlar qanchalik ishonchli?",
        "Reyting va sharhlar ro'yxatdan o'tgan foydalanuvchilardan keladi. Rasmiy qabul kvotalari yoki davlat statistikasi emas — bu real talaba tajribasi va hamjamiyat fikri.",
    ),
]


def seed_faq_items(apps, schema_editor):
    FAQItem = apps.get_model("universities", "FAQItem")
    if FAQItem.objects.exists():
        return
    used_slugs = set()
    for index, (question, answer) in enumerate(FAQ_SEED):
        base_slug = slugify(question)[:280] or f"faq-{index + 1}"
        slug = base_slug
        suffix = 2
        while slug in used_slugs:
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        used_slugs.add(slug)
        FAQItem.objects.create(
            question=question,
            answer=answer,
            slug=slug,
            sort_order=index,
            is_published=True,
        )


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0021_review_quality"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="chatmessage",
            name="tags",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.CreateModel(
            name="FAQItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("question", models.CharField(max_length=300)),
                ("answer", models.TextField()),
                ("slug", models.SlugField(max_length=320, unique=True)),
                ("category", models.CharField(blank=True, default="", max_length=80)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("is_published", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "FAQ",
                "verbose_name_plural": "FAQ",
                "ordering": ["sort_order", "id"],
            },
        ),
        migrations.CreateModel(
            name="UserBlock",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "blocked",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="blocks_received",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "blocker",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="blocks_created",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="UserMute",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "muted_user",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="mutes_received",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "muter",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="mutes_created",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "university",
                    models.ForeignKey(
                        blank=True,
                        help_text="Bo'sh = barcha chatlarda mute.",
                        null=True,
                        on_delete=models.deletion.CASCADE,
                        related_name="user_mutes",
                        to="universities.university",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="userblock",
            constraint=models.UniqueConstraint(
                fields=("blocker", "blocked"), name="unique_user_block_pair"
            ),
        ),
        migrations.AddConstraint(
            model_name="usermute",
            constraint=models.UniqueConstraint(
                fields=("muter", "muted_user", "university"), name="unique_user_mute_scope"
            ),
        ),
        migrations.RunPython(seed_faq_items, migrations.RunPython.noop),
    ]
