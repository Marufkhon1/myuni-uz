import json
from pathlib import Path

from django.db import migrations

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "uz_hei_207.json"


def apply_summaries(apps, schema_editor):
    University = apps.get_model("universities", "University")
    entries = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    summary_by_name = {
        entry["name"]: entry.get("summary", "")
        for entry in entries
        if entry.get("summary")
    }
    for university in University.objects.all():
        summary = summary_by_name.get(university.name)
        if not summary:
            continue
        university.summary = summary
        university.save(update_fields=["summary"])


def reverse_apply(apps, schema_editor):
    University = apps.get_model("universities", "University")
    University.objects.all().update(summary="")


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0029_university_short_names"),
    ]

    operations = [
        migrations.RunPython(apply_summaries, reverse_apply),
    ]
