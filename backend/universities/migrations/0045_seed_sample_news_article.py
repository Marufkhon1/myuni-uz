from django.db import migrations
from django.utils import timezone


def seed_sample_news(apps, schema_editor):
    Article = apps.get_model("universities", "Article")
    if Article.objects.filter(slug="myuni-soft-reyting-ishga-tushdi").exists():
        return
    Article.objects.create(
        title="MyUni soft reytingi ochildi",
        slug="myuni-soft-reyting-ishga-tushdi",
        excerpt="Talabalar sharhlariga asoslangan Bayesian soft reyting /reyting da.",
        body=(
            "MyUni.uz soft reytingi endi ochiq sahifa sifatida mavjud. "
            "Bu vazirlik yoki QS reytingi emas — tasdiqlangan talabalar sharhlari "
            "va Bayesian ishonch og'irligi asosida.\n\n"
            "Batafsil: /reyting va /metodologiya."
        ),
        kind="news",
        status="published",
        published_at=timezone.now(),
    )


def unseed_sample_news(apps, schema_editor):
    Article = apps.get_model("universities", "Article")
    Article.objects.filter(slug="myuni-soft-reyting-ishga-tushdi").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0044_article_kind"),
    ]

    operations = [
        migrations.RunPython(seed_sample_news, unseed_sample_news),
    ]
