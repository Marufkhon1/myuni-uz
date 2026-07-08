from django.db import migrations


def apply_published_catalog(apps, schema_editor):
    University = apps.get_model("universities", "University")
    from universities.published_tuition import (
        curated_short_names,
        effective_contract_pricing,
    )

    for university in University.objects.filter(short_name__in=curated_short_names()):
        university.contract_pricing = effective_contract_pricing(university)
        university.save(update_fields=["contract_pricing"])


def reverse_published_catalog(apps, schema_editor):
    """Restore national_base / estimate sources from seed contract_pricing."""
    import json
    from pathlib import Path

    University = apps.get_model("universities", "University")
    from universities.published_tuition import curated_short_names

    data_path = Path(__file__).resolve().parent.parent / "data" / "uz_hei_207.json"
    if not data_path.is_file():
        return

    with data_path.open(encoding="utf-8") as handle:
        entries = json.load(handle)

    by_short = {}
    for entry in entries:
        short = (entry.get("short_name") or "").strip()
        pricing = entry.get("contract_pricing")
        if short and isinstance(pricing, dict):
            by_short[short] = pricing

    for university in University.objects.filter(short_name__in=curated_short_names()):
        seed_pricing = by_short.get(university.short_name)
        if seed_pricing:
            university.contract_pricing = seed_pricing
            university.save(update_fields=["contract_pricing"])


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0040_rewrite_verified_student_article_copy"),
    ]

    operations = [
        migrations.RunPython(apply_published_catalog, reverse_published_catalog),
    ]
