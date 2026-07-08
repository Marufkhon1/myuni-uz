"""Rewrite seed article trust language: verified student → Kampus ovozi."""

from django.db import migrations


ARTICLE_SLUG = "myuni-da-birinchi-sharh-yozish-qollanmasi"

OLD_EXCERPT = (
    "Ishonchli va foydali sharh yozish uchun 5 ta qoida — moderatsiya va verified student haqida."
)
NEW_EXCERPT = (
    "Ishonchli va foydali sharh yozish uchun 5 ta qoida — moderatsiya va «Kampus ovozi» belgisi haqida."
)

OLD_BODY_FRAGMENT = (
    "sifatida profil to'ldiring — verified student belgisi ishonchni oshiradi.\n\n"
)
NEW_BODY_FRAGMENT = (
    "sifatida profil to'ldiring — «Kampus ovozi» belgisi (yumshoq kampus "
    "aloqasi) ishonchni oshiradi.\n\n"
)


def forwards(apps, schema_editor):
    Article = apps.get_model("universities", "Article")
    article = Article.objects.filter(slug=ARTICLE_SLUG).first()
    if not article:
        return
    update_fields = []
    if "verified student" in (article.excerpt or ""):
        article.excerpt = (article.excerpt or "").replace(
            "verified student",
            "«Kampus ovozi»",
        )
        # Prefer exact new excerpt when matching the known seed string.
        if article.excerpt == OLD_EXCERPT.replace("verified student", "«Kampus ovozi»"):
            article.excerpt = NEW_EXCERPT
        update_fields.append("excerpt")
    if "verified student" in (article.body or ""):
        body = article.body or ""
        if OLD_BODY_FRAGMENT in body:
            article.body = body.replace(OLD_BODY_FRAGMENT, NEW_BODY_FRAGMENT)
        else:
            article.body = body.replace(
                "verified student belgisi",
                "«Kampus ovozi» belgisi (yumshoq kampus aloqasi)",
            )
            article.body = article.body.replace("verified student", "«Kampus ovozi»")
        update_fields.append("body")
    if update_fields:
        article.save(update_fields=update_fields)


def backwards(apps, schema_editor):
    Article = apps.get_model("universities", "Article")
    article = Article.objects.filter(slug=ARTICLE_SLUG).first()
    if not article:
        return
    update_fields = []
    if article.excerpt == NEW_EXCERPT or "Kampus ovozi" in (article.excerpt or ""):
        article.excerpt = OLD_EXCERPT
        update_fields.append("excerpt")
    body = article.body or ""
    if NEW_BODY_FRAGMENT in body:
        article.body = body.replace(NEW_BODY_FRAGMENT, OLD_BODY_FRAGMENT)
        update_fields.append("body")
    elif "Kampus ovozi" in body:
        article.body = body.replace(
            "«Kampus ovozi» belgisi (yumshoq kampus aloqasi)",
            "verified student belgisi",
        )
        update_fields.append("body")
    if update_fields:
        article.save(update_fields=update_fields)


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0039_performance_indexes"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
