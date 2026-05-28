from django.db import migrations, models

from universities.university_slug import slugify_university_short_name


def populate_university_slugs(apps, schema_editor):
    University = apps.get_model("universities", "University")
    used = set()
    for university in University.objects.order_by("id"):
        base = slugify_university_short_name(university.short_name)
        candidate = base
        counter = 2
        while candidate in used:
            candidate = f"{base}-{counter}"
            counter += 1
        used.add(candidate)
        university.slug = candidate
        university.save(update_fields=["slug"])


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0014_review_study_session"),
    ]

    operations = [
        migrations.AddField(
            model_name="university",
            name="slug",
            field=models.SlugField(blank=True, default="", max_length=100),
        ),
        migrations.RunPython(populate_university_slugs, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="university",
            name="slug",
            field=models.SlugField(max_length=100, unique=True),
        ),
        migrations.RemoveField(
            model_name="review",
            name="study_session",
        ),
    ]
