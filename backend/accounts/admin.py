from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "role",
        "university",
        "university_ref",
        "study_program",
        "created_at",
    )
    list_filter = ("role", "created_at")
    search_fields = (
        "full_name",
        "user__email",
        "university",
        "university_ref__name",
        "university_ref__short_name",
        "study_program",
    )
    raw_id_fields = ("university_ref",)
    list_select_related = ("university_ref", "user")
