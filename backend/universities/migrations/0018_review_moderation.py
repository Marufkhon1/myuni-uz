from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0017_pinned_messages_report_reasons"),
    ]

    operations = [
        migrations.AddField(
            model_name="review",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Ko'rib chiqilmoqda"),
                    ("approved", "Tasdiqlangan"),
                    ("rejected", "Rad etilgan"),
                ],
                default="approved",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="review",
            name="moderation_note",
            field=models.CharField(blank=True, max_length=500),
        ),
        migrations.AddField(
            model_name="review",
            name="moderated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
