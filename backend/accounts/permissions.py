from rest_framework.permissions import BasePermission


class CanWriteStudentContent(BasePermission):
    message = "Sharh yozish faqat studentlar uchun."

    def has_permission(self, request, view):
        profile = getattr(request.user, "profile", None)
        return bool(request.user and request.user.is_authenticated and profile and profile.role == "student")
