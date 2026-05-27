from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("universities", "0005_reviewlike"),
    ]

    operations = [
        migrations.AddField(
            model_name="chatmembership",
            name="last_read_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="directthread",
            name="user_one_last_read_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="directthread",
            name="user_two_last_read_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
