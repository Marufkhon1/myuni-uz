from django.db import migrations

from universities.university_images import build_university_image_url, is_random_placeholder_url


def use_local_campus_paths(apps, schema_editor):
    University = apps.get_model("universities", "University")
    for university in University.objects.all():
        if is_random_placeholder_url(university.image_url):
            university.image_url = build_university_image_url(university)
            university.save(update_fields=["image_url"])


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0012_campus_university_images"),
    ]

    operations = [
        migrations.RunPython(use_local_campus_paths, migrations.RunPython.noop),
    ]
