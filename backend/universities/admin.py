from django.contrib import admin, messages

from .models import (
    ChatMembership,
    ChatMessage,
    DirectMessage,
    DirectThread,
    MessageReport,
    Review,
    ReviewLike,
    University,
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
    list_display = ("name", "short_name", "slug", "location")
    prepopulated_fields = {"slug": ("short_name",)}
    search_fields = ("name", "short_name", "location")


@admin.register(ReviewLike)
class ReviewLikeAdmin(admin.ModelAdmin):
    list_display = ("review", "user", "created_at")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("university", "user", "rating", "status", "created_at", "moderated_at")
    list_filter = ("status", "rating", "created_at", "university")
    search_fields = ("text", "user__email", "university__name")
    actions = [approve_reviews, reject_reviews]
    readonly_fields = ("created_at", "moderated_at")


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


@admin.register(MessageReport)
class MessageReportAdmin(admin.ModelAdmin):
    list_display = ("reason", "reporter", "chat_message", "direct_message", "created_at")
    list_filter = ("reason", "created_at")
    search_fields = ("details", "reporter__email")
