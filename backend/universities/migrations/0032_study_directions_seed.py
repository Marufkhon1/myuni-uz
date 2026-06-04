import json
from pathlib import Path

from django.db import migrations, models
from django.utils.text import slugify

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "uz_hei_207.json"
DEFAULT_FACULTY = "Bakalavriat yo'nalishlari"


def seed_study_directions(apps, schema_editor):
    University = apps.get_model("universities", "University")
    Faculty = apps.get_model("universities", "Faculty")
    StudyDirection = apps.get_model("universities", "StudyDirection")

    entries = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    for entry in entries:
        university = University.objects.filter(name=entry["name"]).first()
        if not university:
            continue

        Faculty.objects.filter(university=university).delete()

        faculty_slug = slugify(DEFAULT_FACULTY, allow_unicode=True) or "bakalavriat"
        faculty, _ = Faculty.objects.get_or_create(
            university=university,
            slug=faculty_slug,
            defaults={
                "name": DEFAULT_FACULTY,
                "description": "2025/2026 o'quv yili bakalavriat yo'nalishlari.",
                "sort_order": 0,
            },
        )

        for index, direction in enumerate(entry.get("study_directions", [])):
            name = (direction.get("name") or "").strip()
            if not name:
                continue
            dirid = (direction.get("dirid") or "").strip()
            base_slug = slugify(name, allow_unicode=True) or f"yo-nalish-{index + 1}"
            slug = base_slug
            counter = 2
            while StudyDirection.objects.filter(faculty=faculty, slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            StudyDirection.objects.create(
                faculty=faculty,
                name=name,
                slug=slug,
                dirid=dirid,
                exam_subjects=direction.get("exam_subjects") or [],
                study_forms=direction.get("study_forms") or [],
                degree_level="bachelor",
                duration_years=4,
                sort_order=index,
            )


def reverse_seed(apps, schema_editor):
    Faculty = apps.get_model("universities", "Faculty")
    Faculty.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0031_university_contract_pricing"),
    ]

    operations = [
        migrations.AddField(
            model_name="studydirection",
            name="dirid",
            field=models.CharField(blank=True, db_index=True, max_length=16),
        ),
        migrations.AddField(
            model_name="studydirection",
            name="exam_subjects",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="studydirection",
            name="study_forms",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.RunPython(seed_study_directions, reverse_seed),
    ]
