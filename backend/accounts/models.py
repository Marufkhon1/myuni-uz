from django.conf import settings
from django.db import models


class Profile(models.Model):
    class Role(models.TextChoices):
        APPLICANT = "applicant", "Abituriyent"
        STUDENT = "student", "Talaba"

    class AvatarVisibility(models.TextChoices):
        EVERYONE = "everyone", "Hammaga ko'rinadi"
        PRIVATE_ONLY = "private_only", "Faqat shaxsiy chatda yozganlarga"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.APPLICANT,
    )
    full_name = models.CharField(max_length=160)
    university = models.CharField(max_length=180, blank=True)
    study_program = models.CharField(max_length=180, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    avatar_visibility = models.CharField(
        max_length=20,
        choices=AvatarVisibility.choices,
        default=AvatarVisibility.EVERYONE,
    )
    chat_color = models.CharField(
        max_length=20,
        blank=True,
        default="",
        help_text="Bo'sh = avtomatik rang (user id bo'yicha).",
    )
    bio = models.CharField(max_length=70, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()})"
