from django.db import migrations

from universities.article_covers import resolve_article_cover_image


def fix_article_cover_image_paths(apps, schema_editor):
    Article = apps.get_model("universities", "Article")
    for article in Article.objects.all().iterator():
        resolved = resolve_article_cover_image(article.cover_image, article.slug)
        if article.cover_image != resolved:
            article.cover_image = resolved
            article.save(update_fields=["cover_image"])


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0041_apply_published_tuition_catalog"),
    ]

    operations = [
        migrations.RunPython(fix_article_cover_image_paths, migrations.RunPython.noop),
    ]
