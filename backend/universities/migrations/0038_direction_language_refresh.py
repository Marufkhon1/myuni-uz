import json
from pathlib import Path

from django.db import migrations

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "uz_hei_207.json"

FACULTY_LEVELS = (
    ("Bakalavriat yo'nalishlari", "study_directions", "bachelor", 4, 0),
    ("Magistratura yo'nalishlari", "study_directions_master", "master", 2, 1),
    ("Doktorantura (PhD)", "study_directions_doctorate", "doctorate", 3, 2),
)

MAX_SLUG_LEN = 120


def _unique_direction_slug(faculty, base_slug, StudyDirection):
    slug = base_slug[:MAX_SLUG_LEN]
    counter = 2
    while StudyDirection.objects.filter(faculty=faculty, slug=slug).exists():
        suffix = f"-{counter}"
        slug = f"{base_slug[: MAX_SLUG_LEN - len(suffix)]}{suffix}"
        counter += 1
    return slug


def seed_all_study_directions(apps, schema_editor):
    University = apps.get_model("universities", "University")
    Faculty = apps.get_model("universities", "Faculty")
    StudyDirection = apps.get_model("universities", "StudyDirection")
    from django.utils.text import slugify

    entries = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    for entry in entries:
        university = University.objects.filter(name=entry["name"]).first()
        if not university:
            continue

        Faculty.objects.filter(university=university).delete()

        for faculty_name, field_name, degree_level, duration, sort_order in FACULTY_LEVELS:
            directions = entry.get(field_name) or []
            if not directions:
                continue

            faculty_slug = (slugify(faculty_name, allow_unicode=True) or degree_level)[:MAX_SLUG_LEN]
            faculty, _ = Faculty.objects.get_or_create(
                university=university,
                slug=faculty_slug,
                defaults={
                    "name": faculty_name,
                    "description": f"2025/2026 o'quv yili {faculty_name.lower()}.",
                    "sort_order": sort_order,
                },
            )

            for index, direction in enumerate(directions):
                name = (direction.get("name") or "").strip()
                if not name:
                    continue
                dirid = (direction.get("dirid") or "").strip()
                base_slug = (slugify(name, allow_unicode=True) or f"{degree_level}-{index + 1}")[:MAX_SLUG_LEN]
                slug = _unique_direction_slug(faculty, base_slug, StudyDirection)

                StudyDirection.objects.create(
                    faculty=faculty,
                    name=name,
                    slug=slug,
                    dirid=dirid,
                    exam_subjects=direction.get("exam_subjects") or [],
                    study_forms=direction.get("study_forms") or [],
                    degree_level=degree_level,
                    duration_years=duration,
                    sort_order=index,
                )


def reverse_seed(apps, schema_editor):
    Faculty = apps.get_model("universities", "Faculty")
    Faculty.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0037_refresh_graduate_study_directions"),
    ]

    operations = [
        migrations.RunPython(seed_all_study_directions, reverse_seed),
    ]
