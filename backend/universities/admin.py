from django.contrib import admin, messages

from .models import (
    AdmissionCycle,
    AdmissionQuota,
    Article,
    ChatMembership,
    ChatMessage,
    DirectMessage,
    DirectThread,
    FAQItem,
    Faculty,
    MessageReport,
    Review,
    ReviewImage,
    ReviewLike,
    ReviewReply,
    ReviewReport,
    StudyDirection,
    University,
    UserBlock,
    UserMute,
)
from .review_moderation import set_review_status


@admin.action(description="Sharhlarni tasdiqlash")
def approve_reviews(modeladmin, request, queryset):
    updated = 0
    for review in queryset:
        if review.status != Review.Status.APPROVED:
            set_review_status(review, Review.Status.APPROVED)
            updated += 1
    messages.success(request, f"{updated} ta sharh tasdiqlandi va muallifga xabar yuborildi.")


@admin.action(description="Sharhlarni rad etish")
def reject_reviews(modeladmin, request, queryset):
    updated = 0
    for review in queryset:
        if review.status != Review.Status.REJECTED:
            set_review_status(review, Review.Status.REJECTED, note="Admin rad etdi.")
            updated += 1
    messages.success(request, f"{updated} ta sharh rad etildi.")


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ("name", "short_name", "slug", "city", "ownership_type", "location")
    list_filter = ("city", "ownership_type")
    prepopulated_fields = {"slug": ("short_name",)}
    search_fields = ("name", "short_name", "location", "city")


class StudyDirectionInline(admin.TabularInline):
    model = StudyDirection
    extra = 0
    fields = ("name", "slug", "degree_level", "duration_years", "sort_order")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ("name", "university", "sort_order")
    list_filter = ("university",)
    search_fields = ("name", "university__name")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [StudyDirectionInline]


class AdmissionQuotaInline(admin.TabularInline):
    model = AdmissionQuota
    extra = 0
    raw_id_fields = ("direction",)


@admin.register(StudyDirection)
class StudyDirectionAdmin(admin.ModelAdmin):
    list_display = ("name", "faculty", "degree_level", "duration_years")
    list_filter = ("degree_level", "faculty__university")
    search_fields = ("name", "faculty__name", "faculty__university__name")


@admin.register(AdmissionCycle)
class AdmissionCycleAdmin(admin.ModelAdmin):
    list_display = ("university", "academic_year", "status", "application_deadline", "published_at")
    list_filter = ("status", "academic_year", "university")
    search_fields = ("university__name", "academic_year")
    inlines = [AdmissionQuotaInline]


@admin.register(AdmissionQuota)
class AdmissionQuotaAdmin(admin.ModelAdmin):
    list_display = ("cycle", "direction", "grant_quota", "contract_quota", "min_score")
    list_filter = ("cycle__university", "cycle__academic_year")
    search_fields = ("cycle__university__name", "direction__name")


@admin.register(ReviewLike)
class ReviewLikeAdmin(admin.ModelAdmin):
    list_display = ("review", "user", "created_at")


class ReviewImageInline(admin.TabularInline):
    model = ReviewImage
    extra = 0


class ReviewReplyInline(admin.StackedInline):
    model = ReviewReply
    extra = 0
    max_num = 1


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "university",
        "user",
        "rating",
        "status",
        "created_at",
        "moderated_at",
    )
    list_filter = ("status", "rating", "created_at", "university")
    search_fields = ("text", "user__email", "university__name")
    actions = [approve_reviews, reject_reviews]
    readonly_fields = ("created_at", "updated_at", "moderated_at")
    inlines = [ReviewImageInline, ReviewReplyInline]


@admin.register(ChatMembership)
class ChatMembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "university", "joined_at")


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("university", "user", "created_at", "is_deleted")
    search_fields = ("text",)


@admin.register(DirectThread)
class DirectThreadAdmin(admin.ModelAdmin):
    list_display = ("user_one", "user_two", "updated_at")


@admin.register(DirectMessage)
class DirectMessageAdmin(admin.ModelAdmin):
    list_display = ("thread", "sender", "created_at", "is_deleted")


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "status", "published_at", "updated_at")
    list_filter = ("status",)
    search_fields = ("title", "slug", "excerpt")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")


@admin.register(MessageReport)
class MessageReportAdmin(admin.ModelAdmin):
    list_display = ("reason", "reporter", "chat_message", "direct_message", "created_at")
    list_filter = ("reason",)


@admin.register(ReviewReport)
class ReviewReportAdmin(admin.ModelAdmin):
    list_display = ("reason", "reporter", "review", "created_at")
    list_filter = ("reason", "created_at")
    search_fields = ("review__text", "details", "reporter__email")


@admin.register(FAQItem)
class FAQItemAdmin(admin.ModelAdmin):
    list_display = ("question", "category", "sort_order", "is_published", "updated_at")
    list_filter = ("is_published", "category")
    search_fields = ("question", "answer", "slug")
    prepopulated_fields = {"slug": ("question",)}
    ordering = ("sort_order", "id")


@admin.register(UserBlock)
class UserBlockAdmin(admin.ModelAdmin):
    list_display = ("blocker", "blocked", "created_at")
    search_fields = ("blocker__email", "blocked__email")


@admin.register(UserMute)
class UserMuteAdmin(admin.ModelAdmin):
    list_display = ("muter", "muted_user", "university", "created_at")
    list_filter = ("university",)
    search_fields = ("muter__email", "muted_user__email")
