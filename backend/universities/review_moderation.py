from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Q
from django.utils import timezone

from .models import Review


def moderation_enabled() -> bool:
    return getattr(settings, "REVIEW_MODERATION_ENABLED", False)


def reviews_visible_to_user(queryset, user):
    if user and user.is_authenticated and user.is_staff:
        return queryset
    if user and user.is_authenticated:
        return queryset.filter(Q(status=Review.Status.APPROVED) | Q(user=user))
    return queryset.filter(status=Review.Status.APPROVED)


def initial_review_status() -> str:
    if moderation_enabled():
        return Review.Status.PENDING
    return Review.Status.APPROVED


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
        if note:
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
    return review
