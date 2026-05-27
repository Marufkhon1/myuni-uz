from django.db import migrations

from universities.university_images import build_university_image_url, is_random_placeholder_url


def replace_with_campus_images(apps, schema_editor):
    University = apps.get_model("universities", "University")
    for university in University.objects.all():
        if is_random_placeholder_url(university.image_url) or not university.image_url:
            university.image_url = build_university_image_url(university)
            university.save(update_fields=["image_url"])


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0011_university_image_urls"),
    ]

    operations = [
        migrations.RunPython(replace_with_campus_images, migrations.RunPython.noop),
    ]
