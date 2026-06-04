import json
from pathlib import Path

from django.db import migrations, models

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "uz_hei_207.json"


def apply_contract_pricing(apps, schema_editor):
    University = apps.get_model("universities", "University")
    entries = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    pricing_by_name = {
        entry["name"]: entry.get("contract_pricing", {})
        for entry in entries
        if entry.get("contract_pricing")
    }
    for university in University.objects.all():
        pricing = pricing_by_name.get(university.name)
        if not pricing:
            continue
        university.contract_pricing = pricing
        university.save(update_fields=["contract_pricing"])


def reverse_apply(apps, schema_editor):
    University = apps.get_model("universities", "University")
    University.objects.all().update(contract_pricing={})


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0030_university_summaries"),
    ]

    operations = [
        migrations.AddField(
            model_name="university",
            name="contract_pricing",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.RunPython(apply_contract_pricing, reverse_apply),
    ]
