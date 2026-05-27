from urllib.parse import quote

from django.db import migrations


def _image_url_for(university):
    seed = f"myuni-u{university.id}-{quote((university.short_name or university.name or 'uni')[:40])}"
    return f"https://picsum.photos/seed/{seed}/256/256"


def fill_university_images(apps, schema_editor):
    University = apps.get_model("universities", "University")
    for university in University.objects.all():
        if university.image_url:
            continue
        university.image_url = _image_url_for(university)
        university.save(update_fields=["image_url"])


def clear_generated_images(apps, schema_editor):
    University = apps.get_model("universities", "University")
    University.objects.filter(image_url__startswith="https://picsum.photos/seed/myuni-").update(
        image_url=""
    )


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0010_message_reactions"),
    ]

    operations = [
        migrations.RunPython(fill_university_images, clear_generated_images),
    ]
