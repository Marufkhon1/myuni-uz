import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("universities", "0015_university_slug_remove_review_study_session"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="MessageReport",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "reason",
                    models.CharField(
                        choices=[
                            ("spam", "Spam"),
                            ("abuse", "Haqorat"),
                            ("false", "Yolg'on ma'lumot"),
                            ("other", "Boshqa"),
                        ],
                        max_length=20,
                    ),
                ),
                ("details", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "chat_message",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reports",
                        to="universities.chatmessage",
                    ),
                ),
                (
                    "direct_message",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reports",
                        to="universities.directmessage",
                    ),
                ),
                (
                    "reporter",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="message_reports",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "indexes": [models.Index(fields=["-created_at"], name="universities_created_6e2a0d_idx")],
            },
        ),
        migrations.AddConstraint(
            model_name="messagereport",
            constraint=models.CheckConstraint(
                condition=models.Q(chat_message__isnull=False, direct_message__isnull=True)
                | models.Q(chat_message__isnull=True, direct_message__isnull=False),
                name="message_report_exactly_one_target",
            ),
        ),
        migrations.AddConstraint(
            model_name="messagereport",
            constraint=models.UniqueConstraint(
                condition=models.Q(("chat_message__isnull", False)),
                fields=("reporter", "chat_message"),
                name="unique_chat_message_report_per_user",
            ),
        ),
        migrations.AddConstraint(
            model_name="messagereport",
            constraint=models.UniqueConstraint(
                condition=models.Q(("direct_message__isnull", False)),
                fields=("reporter", "direct_message"),
                name="unique_direct_message_report_per_user",
            ),
        ),
    ]
