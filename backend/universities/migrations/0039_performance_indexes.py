from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0038_direction_language_refresh"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="chatmessage",
            index=models.Index(fields=["university", "-created_at"], name="chatmsg_uni_created_idx"),
        ),
        migrations.AddIndex(
            model_name="chatmessage",
            index=models.Index(fields=["university", "-id"], name="chatmsg_uni_id_idx"),
        ),
        migrations.AddIndex(
            model_name="review",
            index=models.Index(
                fields=["university", "status", "-created_at"],
                name="review_uni_status_created_idx",
            ),
        ),
    ]
