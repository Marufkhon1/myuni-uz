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
    email_verified_at = models.DateTimeField(null=True, blank=True)
    is_moderator = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()})"


class Notification(models.Model):
    class Kind(models.TextChoices):
        REVIEW_APPROVED = "review_approved", "Sharh tasdiqlandi"
        REVIEW_REJECTED = "review_rejected", "Sharh rad etildi"
        REVIEW_PENDING = "review_pending", "Sharh moderatsiyada"
        REVIEW_LIKED = "review_liked", "Sharh yoqdi"
        CHAT_UNREAD = "chat_unread", "O'qilmagan xabar"
        REPORT_RECEIVED = "report_received", "Shikoyat qabul qilindi"
        REPORT_UPDATED = "report_updated", "Shikoyat holati yangilandi"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    kind = models.CharField(max_length=32, choices=Kind.choices)
    title = models.CharField(max_length=200)
    body = models.TextField()
    link = models.CharField(max_length=255, blank=True, default="")
    is_read = models.BooleanField(default=False)
    metadata = models.JSONField(blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user_id} · {self.title}"


class PushSubscription(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="push_subscriptions",
    )
    endpoint = models.TextField()
    p256dh = models.CharField(max_length=255)
    auth = models.CharField(max_length=255)
    user_agent = models.CharField(max_length=255, blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "endpoint"],
                name="unique_push_subscription_endpoint",
            ),
        ]
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Push {self.user_id} · {self.endpoint[:48]}"
