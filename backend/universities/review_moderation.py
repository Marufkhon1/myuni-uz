"""
Step 5 — Review flow: create/update → filter (validation) → avto approve.

Hit: validate_review_text → 400 (moderatsiyadan o'tmadi), DB ga yozilmaydi.
Clean: status=approved, moderation_note=auto:profanity_clear, moderated_at=now.
"""

from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Q
from django.utils import timezone

from accounts.notifications_service import notify_review_status_change

from .models import Review
from .profanity_policy import PROFANITY_CLEAR_NOTE


def moderation_enabled() -> bool:
    return getattr(settings, "REVIEW_MODERATION_ENABLED", False)


def reviews_visible_to_user(queryset, user):
    if user and user.is_authenticated and user.is_staff:
        return queryset
    if user and user.is_authenticated:
        return queryset.filter(Q(status=Review.Status.APPROVED) | Q(user=user))
    return queryset.filter(status=Review.Status.APPROVED)


def initial_review_status() -> str:
    """
    Toza matn (so'kinish filtridan o'tgan) — tez tasdiqlanadi.
    Haqoratli matn validate_review_text da rad etiladi, shu yerga yetmaydi.
    """
    return Review.Status.APPROVED


def auto_approve_review_fields() -> dict:
    """
    Step 5 clean path: create/update da serializer.save(**fields).

    moderation_note = auto:profanity_clear — filter yoqilganda;
    oddiy user API da yashiriladi (serializer).
    """
    note = ""
    if getattr(settings, "PROFANITY_FILTER_ENABLED", True):
        note = PROFANITY_CLEAR_NOTE
    return {
        "status": Review.Status.APPROVED,
        "moderation_note": note,
        "moderated_at": timezone.now(),
    }


def _user_email(user) -> str:
    return (user.email or "").strip()


def notify_review_author(review: Review, *, previous_status: str) -> None:
    email = _user_email(review.user)
    if not email:
        return

    university_name = review.university.name
    if review.status == Review.Status.APPROVED:
        subject = f"MyUni.uz — sharhingiz tasdiqlandi ({university_name})"
        body = (
            f"Salom!\n\n"
            f"«{university_name}» bo'yicha sharhingiz moderator tomonidan tasdiqlandi va saytda ko'rinadi.\n\n"
            f"MyUni.uz jamoasi"
        )
    elif review.status == Review.Status.REJECTED:
        note = (review.moderation_note or "").strip()
        subject = f"MyUni.uz — sharhingiz rad etildi ({university_name})"
        body = (
            f"Salom!\n\n"
            f"«{university_name}» bo'yicha sharhingiz moderator tomonidan rad etildi.\n"
        )
        if note and not note.startswith("auto:"):
            body += f"Sabab: {note}\n"
        body += "\nKerak bo'lsa, sharhni qayta yozishingiz mumkin.\n\nMyUni.uz jamoasi"
    else:
        return

    if review.status == previous_status:
        return

    try:
        send_mail(
            subject,
            body,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=True,
        )
    except Exception:
        pass


def notify_moderators_new_review(review: Review) -> None:
    recipients = [
        address.strip()
        for address in getattr(settings, "REVIEW_MODERATOR_EMAILS", "").split(",")
        if address.strip()
    ]
    if not recipients:
        return

    profile = getattr(review.user, "profile", None)
    author = getattr(profile, "full_name", None) or review.user.email
    subject = f"MyUni.uz — yangi sharh moderatsiyada ({review.university.name})"
    body = (
        f"Yangi sharh ko'rib chiqishni kutmoqda.\n\n"
        f"Muallif: {author}\n"
        f"Universitet: {review.university.name}\n"
        f"Baho: {review.rating}/5\n\n"
        f"Matn:\n{review.text}\n\n"
        f"Django admin orqali tasdiqlang yoki rad eting."
    )
    try:
        send_mail(
            subject,
            body,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
            fail_silently=True,
        )
    except Exception:
        pass


def set_review_status(review: Review, status: str, *, note: str = "") -> Review:
    previous = review.status
    review.status = status
    review.moderation_note = (note or "").strip()[:500]
    review.moderated_at = timezone.now()
    review.save(update_fields=["status", "moderation_note", "moderated_at"])
    notify_review_author(review, previous_status=previous)
    notify_review_status_change(review, previous_status=previous)
    return review
