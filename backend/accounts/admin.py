from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "role", "university", "study_program", "created_at")
    list_filter = ("role", "created_at")
    search_fields = ("full_name", "user__email", "university", "study_program")
