from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("universities", "0013_local_campus_images"),
    ]

    operations = [
        migrations.AddField(
            model_name="review",
            name="study_session",
            field=models.CharField(blank=True, default="", max_length=64),
        ),
    ]
