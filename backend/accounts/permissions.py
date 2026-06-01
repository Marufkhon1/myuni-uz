from rest_framework.permissions import BasePermission

from .models import Profile


class CanWriteStudentContent(BasePermission):
    message = "Sharh yozish faqat talaba profili uchun ochiq."

    def has_permission(self, request, view):
        profile = getattr(request.user, "profile", None)
        return bool(profile and profile.role == Profile.Role.STUDENT)


class IsModerator(BasePermission):
    message = "Moderator huquqi talab qilinadi."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff or user.is_superuser:
            return True
        profile = getattr(user, "profile", None)
        return bool(profile and profile.is_moderator)
