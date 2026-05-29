from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0004_profile_chat_color"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="bio",
            field=models.CharField(blank=True, default="", max_length=70),
        ),
    ]
