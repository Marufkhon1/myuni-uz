from urllib.parse import urlparse

from django.db import migrations


def normalize_cover_image(value):
    raw = (value or "").strip()
    if not raw:
        return ""
    if raw.startswith("/"):
        return raw
    parsed = urlparse(raw)
    if parsed.path.startswith("/images/"):
        return parsed.path
    return raw


def fix_article_cover_images(apps, schema_editor):
    Article = apps.get_model("universities", "Article")
    for article in Article.objects.all().iterator():
        normalized = normalize_cover_image(article.cover_image)
        if not normalized and article.slug == "universitet-tanlashda-myuni-qanday-yordam-beradi":
            normalized = "/images/campuses/campus-01.jpg"
        if normalized != article.cover_image:
            article.cover_image = normalized
            article.save(update_fields=["cover_image"])


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0025_seed_blog_articles"),
    ]

    operations = [
        migrations.RunPython(fix_article_cover_images, migrations.RunPython.noop),
    ]
