from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class University(models.Model):
    name = models.CharField(max_length=220, unique=True)
    short_name = models.CharField(max_length=80)
    slug = models.SlugField(max_length=100, unique=True)
    location = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    founded_year = models.PositiveSmallIntegerField(null=True, blank=True)
    institution_type = models.CharField(max_length=48, blank=True)
    summary = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "universities"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            from .university_slug import unique_slug_for_university

            existing = set(
                University.objects.exclude(pk=self.pk).values_list("slug", flat=True)
            )
            self.slug = unique_slug_for_university(self.short_name, existing)
        super().save(*args, **kwargs)


class UniversityFavorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="university_favorites",
    )
    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name="favorited_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "university")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user_id} * {self.university_id}"


class Review(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Ko'rib chiqilmoqda"
        APPROVED = "approved", "Tasdiqlangan"
        REJECTED = "rejected", "Rad etilgan"

    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="university_reviews",
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    text = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.APPROVED,
    )
    moderation_note = models.CharField(max_length=500, blank=True)
    moderated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.university} - {self.rating}/5"


class ReviewLike(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="review_likes",
    )
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name="likes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "review")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user_id} -> review {self.review_id}"


class ChatMembership(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_memberships",
    )
    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name="chat_memberships",
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    last_read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "university")
        ordering = ["-joined_at"]

    def __str__(self):
        return f"{self.user_id} -> {self.university}"


class ChatMessage(models.Model):
    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name="chat_messages",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_messages",
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.university_id}: {self.text[:40]}"


class ChatMessageReaction(models.Model):
    message = models.ForeignKey(
        ChatMessage,
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_message_reactions",
    )
    emoji = models.CharField(max_length=16)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("message", "user")
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.emoji} on chat message {self.message_id}"


class PinnedUniversityMessage(models.Model):
    university = models.OneToOneField(
        University,
        on_delete=models.CASCADE,
        related_name="pinned_message",
    )
    message = models.ForeignKey(
        ChatMessage,
        on_delete=models.CASCADE,
        related_name="university_pins",
    )
    pinned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="university_pins_created",
    )
    pinned_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pin uni {self.university_id} msg {self.message_id}"


class MessageReport(models.Model):
    class Reason(models.TextChoices):
        INSULT = "insult", "Haqorat"
        ABUSE = "abuse", "Zo'ravonlik"
        OTHER = "other", "Boshqa"

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="message_reports",
    )
    chat_message = models.ForeignKey(
        ChatMessage,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="reports",
    )
    direct_message = models.ForeignKey(
        "DirectMessage",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="reports",
    )
    reason = models.CharField(max_length=20, choices=Reason.choices)
    details = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(chat_message__isnull=False, direct_message__isnull=True)
                    | models.Q(chat_message__isnull=True, direct_message__isnull=False)
                ),
                name="message_report_exactly_one_target",
            ),
        ]
        indexes = [
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        target = self.chat_message_id or self.direct_message_id
        return f"Report {self.reason} on {target}"


class DirectThread(models.Model):
    user_one = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="direct_threads_as_one",
    )
    user_two = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="direct_threads_as_two",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user_one_last_read_at = models.DateTimeField(null=True, blank=True)
    user_two_last_read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user_one", "user_two"],
                name="unique_direct_thread_pair",
            )
        ]
        ordering = ["-updated_at"]

    def __str__(self):
        return f"DM {self.user_one_id} <-> {self.user_two_id}"


class DirectMessage(models.Model):
    thread = models.ForeignKey(
        DirectThread,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="direct_messages",
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"DM {self.thread_id}: {self.text[:40]}"


class DirectMessageReaction(models.Model):
    message = models.ForeignKey(
        DirectMessage,
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="direct_message_reactions",
    )
    emoji = models.CharField(max_length=16)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("message", "user")
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.emoji} on DM {self.message_id}"


class PinnedDirectMessage(models.Model):
    thread = models.OneToOneField(
        DirectThread,
        on_delete=models.CASCADE,
        related_name="pinned_message",
    )
    message = models.ForeignKey(
        DirectMessage,
        on_delete=models.CASCADE,
        related_name="direct_pins",
    )
    pinned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="direct_pins_created",
    )
    pinned_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pin thread {self.thread_id} msg {self.message_id}"
