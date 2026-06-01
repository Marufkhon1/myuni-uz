from django.contrib.auth import get_user_model
from django.db import migrations


def backfill_last_seen_from_last_login(apps, schema_editor):
    Profile = apps.get_model("accounts", "Profile")
    User = get_user_model()

    for profile in Profile.objects.filter(last_seen_at__isnull=True).iterator():
        last_login = (
            User.objects.filter(pk=profile.user_id)
            .values_list("last_login", flat=True)
            .first()
        )
        if last_login:
            Profile.objects.filter(pk=profile.pk).update(last_seen_at=last_login)


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0009_profile_last_seen_at"),
    ]

    operations = [
        migrations.RunPython(backfill_last_seen_from_last_login, migrations.RunPython.noop),
    ]
