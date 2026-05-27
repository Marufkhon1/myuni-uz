from django.contrib import admin

from .models import ChatMembership, ChatMessage, DirectMessage, DirectThread, Review, ReviewLike, University


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ("name", "short_name", "location")
    search_fields = ("name", "short_name", "location")


@admin.register(ReviewLike)
class ReviewLikeAdmin(admin.ModelAdmin):
    list_display = ("review", "user", "created_at")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("university", "user", "rating", "created_at")
    list_filter = ("rating", "created_at", "university")
    search_fields = ("text", "user__email", "university__name")


@admin.register(ChatMembership)
class ChatMembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "university", "joined_at")


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("university", "user", "created_at")
    search_fields = ("text",)


@admin.register(DirectThread)
class DirectThreadAdmin(admin.ModelAdmin):
    list_display = ("user_one", "user_two", "updated_at")


@admin.register(DirectMessage)
class DirectMessageAdmin(admin.ModelAdmin):
    list_display = ("thread", "sender", "created_at")
