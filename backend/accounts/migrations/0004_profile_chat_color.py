from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0003_profile_avatar_visibility"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="chat_color",
            field=models.CharField(
                blank=True,
                default="",
                help_text="Bo'sh = avtomatik rang (user id bo'yicha).",
                max_length=20,
            ),
        ),
    ]
