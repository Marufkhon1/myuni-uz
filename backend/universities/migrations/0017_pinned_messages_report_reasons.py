# Generated manually for pin + report reason update

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("universities", "0016_message_report"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="PinnedUniversityMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("pinned_at", models.DateTimeField(auto_now=True)),
                (
                    "message",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="university_pins",
                        to="universities.chatmessage",
                    ),
                ),
                (
                    "pinned_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="university_pins_created",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "university",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="pinned_message",
                        to="universities.university",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="PinnedDirectMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("pinned_at", models.DateTimeField(auto_now=True)),
                (
                    "message",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="direct_pins",
                        to="universities.directmessage",
                    ),
                ),
                (
                    "pinned_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="direct_pins_created",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "thread",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="pinned_message",
                        to="universities.directthread",
                    ),
                ),
            ],
        ),
        migrations.AlterField(
            model_name="messagereport",
            name="reason",
            field=models.CharField(
                choices=[
                    ("insult", "Haqorat"),
                    ("abuse", "Abuse"),
                    ("other", "Boshqa"),
                ],
                max_length=20,
            ),
        ),
    ]
