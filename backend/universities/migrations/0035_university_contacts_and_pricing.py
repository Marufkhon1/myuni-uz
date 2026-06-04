import json
from pathlib import Path

from django.db import migrations

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "uz_hei_207.json"


def apply_contacts(apps, schema_editor):
    University = apps.get_model("universities", "University")
    entries = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    by_name = {entry["name"]: entry for entry in entries}

    for university in University.objects.all():
        entry = by_name.get(university.name)
        if not entry:
            continue
        contact = entry.get("contact") or {}
        address = entry.get("address") or contact.get("address") or university.address
        phone = entry.get("phone") or contact.get("phone") or ""
        email = entry.get("email") or contact.get("email") or ""
        website = entry.get("website") or contact.get("website") or ""
        telegram_url = entry.get("telegram_url") or contact.get("telegram_url") or ""
        pricing = entry.get("contract_pricing") or university.contract_pricing

        university.address = address
        university.phone = phone
        university.email = email
        university.website = website
        university.telegram_url = telegram_url
        university.contract_pricing = pricing
        university.save(
            update_fields=[
                "address",
                "phone",
                "email",
                "website",
                "telegram_url",
                "contract_pricing",
            ]
        )


def reverse_apply(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0034_refresh_curated_study_directions"),
    ]

    operations = [
        migrations.RunPython(apply_contacts, reverse_apply),
    ]
