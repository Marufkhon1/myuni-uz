from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone

from .db_constraints import check_constraint


class University(models.Model):
    class OwnershipType(models.TextChoices):
        STATE = "state", "Davlat"
        PRIVATE = "private", "Xususiy"
        INTERNATIONAL = "international", "Xalqaro"

    name = models.CharField(max_length=220, unique=True)
    short_name = models.CharField(max_length=80)
    slug = models.SlugField(max_length=100, unique=True)
    location = models.CharField(max_length=160)
    city = models.CharField(max_length=80, blank=True, db_index=True)
    description = models.TextField(blank=True)
    founded_year = models.PositiveSmallIntegerField(null=True, blank=True)
    institution_type = models.CharField(max_length=48, blank=True)
    ownership_type = models.CharField(
        max_length=20,
        choices=OwnershipType.choices,
        blank=True,
        db_index=True,
    )
    summary = models.TextField(blank=True)
    contract_pricing = models.JSONField(default=dict, blank=True)
    image_url = models.URLField(blank=True)
    gallery_urls = models.JSONField(default=list, blank=True)
    address = models.CharField(max_length=220, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    telegram_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
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


class Faculty(models.Model):
    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name="faculties",
    )
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=120)
    description = models.TextField(blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        unique_together = ("university", "slug")
        verbose_name_plural = "faculties"

    def __str__(self):
        return f"{self.university.short_name} — {self.name}"


class StudyDirection(models.Model):
    class DegreeLevel(models.TextChoices):
        BACHELOR = "bachelor", "Bakalavr"
        MASTER = "master", "Magistr"
        DOCTORATE = "doctorate", "Doktorantura"

    faculty = models.ForeignKey(
        Faculty,
        on_delete=models.CASCADE,
        related_name="directions",
    )
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=120)
    dirid = models.CharField(max_length=16, blank=True, db_index=True)
    exam_subjects = models.JSONField(default=list, blank=True)
    study_forms = models.JSONField(default=list, blank=True)
    degree_level = models.CharField(
        max_length=20,
        choices=DegreeLevel.choices,
        default=DegreeLevel.BACHELOR,
    )
    duration_years = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    description = models.TextField(blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        unique_together = ("faculty", "slug")

    def __str__(self):
        return self.name


class AdmissionCycle(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Qoralama"
        PUBLISHED = "published", "Nashr qilingan"

    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name="admission_cycles",
    )
    academic_year = models.CharField(max_length=16)
    application_deadline = models.DateField(null=True, blank=True)
    exam_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-academic_year"]
        unique_together = ("university", "academic_year")
        verbose_name = "Qabul davri"

    def __str__(self):
        return f"{self.university.short_name} {self.academic_year}"

    def save(self, *args, **kwargs):
        if self.status == self.Status.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)


class AdmissionQuota(models.Model):
    cycle = models.ForeignKey(
        AdmissionCycle,
        on_delete=models.CASCADE,
        related_name="quotas",
    )
    direction = models.ForeignKey(
        StudyDirection,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="admission_quotas",
    )
    grant_quota = models.PositiveIntegerField(null=True, blank=True)
    contract_quota = models.PositiveIntegerField(null=True, blank=True)
    min_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    language = models.CharField(max_length=16, blank=True)

    class Meta:
        ordering = ["direction__sort_order", "direction__name", "id"]
        verbose_name = "Qabul kvotasi"
        verbose_name_plural = "Qabul kvotalari"

    def __str__(self):
        label = self.direction.name if self.direction_id else "Umumiy"
        return f"{self.cycle} — {label}"


class CompareShareLink(models.Model):
    token = models.CharField(max_length=32, unique=True, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="compare_share_links",
    )
    snapshot = models.JSONField()
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"CompareShare {self.token}"

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at


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
    study_direction = models.ForeignKey(
        StudyDirection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviews",
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    rating_teachers = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
    )
    rating_dormitory = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
    )
    rating_infrastructure = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
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
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "university"],
                name="unique_review_per_user_university",
            ),
        ]

    def __str__(self):
        return f"{self.university} - {self.rating}/5"


class ReviewImage(models.Model):
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="review_images/")
    caption = models.CharField(max_length=120, blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"Review {self.review_id} image {self.id}"


class ReviewReply(models.Model):
    review = models.OneToOneField(
        Review,
        on_delete=models.CASCADE,
        related_name="official_reply",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="review_replies_authored",
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "review replies"

    def __str__(self):
        return f"Reply to review {self.review_id}"


class ReviewReport(models.Model):
    class Reason(models.TextChoices):
        SPAM = "spam", "Spam / reklama"
        FAKE = "fake", "Yolg'on yoki chalg'ituvchi"
        INSULT = "insult", "Haqorat"
        OTHER = "other", "Boshqa"

    class Status(models.TextChoices):
        PENDING = "pending", "Ko'rib chiqish kutilmoqda"
        IN_REVIEW = "in_review", "Ko'rib chiqilmoqda"
        RESOLVED = "resolved", "Hal qilindi"
        DISMISSED = "dismissed", "Rad etildi"

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="review_reports",
    )
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name="reports",
    )
    reason = models.CharField(max_length=20, choices=Reason.choices)
    details = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    moderator_notes = models.TextField(blank=True, default="")
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_review_reports",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["reporter", "review"],
                name="unique_review_report_per_user",
            ),
        ]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["status", "-created_at"]),
        ]

    def __str__(self):
        return f"Report {self.reason} on review {self.review_id}"


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
    tags = models.JSONField(default=list, blank=True)
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

    class Status(models.TextChoices):
        PENDING = "pending", "Ko'rib chiqish kutilmoqda"
        IN_REVIEW = "in_review", "Ko'rib chiqilmoqda"
        RESOLVED = "resolved", "Hal qilindi"
        DISMISSED = "dismissed", "Rad etildi"

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
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    moderator_notes = models.TextField(blank=True, default="")
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_message_reports",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            check_constraint(
                "message_report_exactly_one_target",
                models.Q(chat_message__isnull=False, direct_message__isnull=True)
                | models.Q(chat_message__isnull=True, direct_message__isnull=False),
            ),
            models.UniqueConstraint(
                fields=["reporter", "chat_message"],
                condition=models.Q(chat_message__isnull=False),
                name="unique_chat_message_report_per_user",
            ),
            models.UniqueConstraint(
                fields=["reporter", "direct_message"],
                condition=models.Q(direct_message__isnull=False),
                name="unique_direct_message_report_per_user",
            ),
        ]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["status", "-created_at"]),
        ]

    def __str__(self):
        target = self.chat_message_id or self.direct_message_id
        return f"Report {self.reason} on {target}"


class FAQItem(models.Model):
    question = models.CharField(max_length=300)
    answer = models.TextField()
    slug = models.SlugField(max_length=320, unique=True)
    category = models.CharField(max_length=80, blank=True, default="")
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name = "FAQ"
        verbose_name_plural = "FAQ"

    def __str__(self):
        return self.question


class UserBlock(models.Model):
    blocker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="blocks_created",
    )
    blocked = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="blocks_received",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["blocker", "blocked"],
                name="unique_user_block_pair",
            ),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.blocker_id} blocked {self.blocked_id}"


class UserMute(models.Model):
    muter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mutes_created",
    )
    muted_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mutes_received",
    )
    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="user_mutes",
        help_text="Bo'sh = barcha chatlarda mute.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["muter", "muted_user", "university"],
                name="unique_user_mute_scope",
            ),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        scope = self.university_id or "global"
        return f"{self.muter_id} muted {self.muted_user_id} ({scope})"


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


class Article(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Qoralama"
        PUBLISHED = "published", "Nashr qilingan"

    title = models.CharField(max_length=220)
    slug = models.SlugField(max_length=220, unique=True)
    excerpt = models.TextField(max_length=500, blank=True)
    body = models.TextField()
    cover_image = models.URLField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        verbose_name = "Maqola"
        verbose_name_plural = "Maqolalar"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.status == self.Status.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
