import json
import re
from pathlib import Path

from django.db import migrations
from django.utils.text import slugify

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "uz_hei_207.json"


def _slug_for_short_name(short_name, used):
    base = slugify(short_name, allow_unicode=False) or "universitet"
    base = re.sub(r"[^a-z0-9-]", "", base.lower())[:80] or "universitet"
    candidate = base
    counter = 2
    while candidate in used:
        candidate = f"{base}-{counter}"
        counter += 1
    used.add(candidate)
    return candidate


def apply_short_names(apps, schema_editor):
    University = apps.get_model("universities", "University")
    entries = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    short_by_name = {
        entry["name"]: entry["short_name"][:80]
        for entry in entries
        if entry.get("short_name")
    }
    used_slugs: set[str] = set()
    pending = []

    for university in University.objects.order_by("id"):
        short_name = short_by_name.get(university.name)
        if not short_name:
            continue
        slug = _slug_for_short_name(short_name, used_slugs)
        pending.append((university, short_name, slug))

    for university, short_name, slug in pending:
        university.short_name = short_name
        university.slug = slug
        university.save(update_fields=["short_name", "slug"])


def reverse_apply(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0028_seed_real_uzbekistan_universities"),
    ]

    operations = [
        migrations.RunPython(apply_short_names, reverse_apply),
    ]
