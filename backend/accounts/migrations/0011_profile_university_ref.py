# Generated manually for STEP 7 — Profile.university_ref FK preparation.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0010_backfill_last_seen_at"),
        ("universities", "0039_performance_indexes"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="university_ref",
            field=models.ForeignKey(
                blank=True,
                help_text="Katalog OTM (FK). Matnli `university` bilan dual-write.",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="profiles",
                to="universities.university",
            ),
        ),
    ]
