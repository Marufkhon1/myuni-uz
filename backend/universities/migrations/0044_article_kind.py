# Generated manually for Phase 3 article kind (guide vs news).

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("universities", "0043_profanity_block_daily"),
    ]

    operations = [
        migrations.AddField(
            model_name="article",
            name="kind",
            field=models.CharField(
                choices=[("guide", "Qo'llanma"), ("news", "Yangilik")],
                db_index=True,
                default="guide",
                max_length=16,
            ),
        ),
    ]
