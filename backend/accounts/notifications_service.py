from django.contrib.auth import get_user_model

from django.utils import timezone
from datetime import timedelta

from .models import Notification

User = get_user_model()


def create_notification(*, user, kind, title, body, link="", metadata=None):
    if not user or not getattr(user, "is_authenticated", False):
        return None
    return Notification.objects.create(
        user=user,
        kind=kind,
        title=title,
        body=body,
        link=link or "",
        metadata=metadata or {},
    )


def notify_review_status_change(review, *, previous_status):
    from universities.models import Review

    if review.status == previous_status:
        return

    university_name = review.university.name
    role = getattr(getattr(review.user, "profile", None), "role", "applicant")
    dashboard_path = "/student/dashboard" if role == "student" else "/applicant/dashboard"
    link = f"{dashboard_path}?section=reviews&university_id={review.university_id}"

    if review.status == Review.Status.APPROVED:
        create_notification(
            user=review.user,
            kind=Notification.Kind.REVIEW_APPROVED,
            title="Sharhingiz tasdiqlandi",
            body=f"«{university_name}» bo'yicha sharhingiz moderator tomonidan tasdiqlandi va saytda ko'rinadi.",
            link=link,
            metadata={"review_id": review.id, "university_id": review.university_id},
        )
    elif review.status == Review.Status.REJECTED:
        note = (review.moderation_note or "").strip()
        body = f"«{university_name}» bo'yicha sharhingiz rad etildi."
        if note:
            body = f"{body} Sabab: {note}"
        create_notification(
            user=review.user,
            kind=Notification.Kind.REVIEW_REJECTED,
            title="Sharhingiz rad etildi",
            body=body,
            link=link,
            metadata={"review_id": review.id, "university_id": review.university_id},
        )


def notify_review_pending(review):
    university_name = review.university.name
    role = getattr(getattr(review.user, "profile", None), "role", "applicant")
    dashboard_path = "/student/dashboard" if role == "student" else "/applicant/dashboard"
    create_notification(
        user=review.user,
        kind=Notification.Kind.REVIEW_PENDING,
        title="Sharhingiz moderatsiyada",
        body=f"«{university_name}» bo'yicha sharhingiz ko'rib chiqilmoqda. Tasdiqlangach xabar beramiz.",
        link=f"{dashboard_path}?section=reviews&university_id={review.university_id}",
        metadata={"review_id": review.id, "university_id": review.university_id},
    )


def notify_review_liked(*, review, liker):
    if review.user_id == liker.id:
        return

    recent_like_notice = Notification.objects.filter(
        user=review.user,
        kind=Notification.Kind.REVIEW_LIKED,
        metadata__review_id=review.id,
        created_at__gte=timezone.now() - timedelta(hours=24),
    ).exists()
    if recent_like_notice:
        return

    profile = getattr(liker, "profile", None)
    liker_name = getattr(profile, "full_name", None) or liker.email
    university_name = review.university.short_name or review.university.name
    role = getattr(getattr(review.user, "profile", None), "role", "applicant")
    dashboard_path = "/student/dashboard" if role == "student" else "/applicant/dashboard"
    create_notification(
        user=review.user,
        kind=Notification.Kind.REVIEW_LIKED,
        title="Sharhingiz yoqdi",
        body=f"{liker_name} «{university_name}» sharhingizni yoqtirdi.",
        link=f"{dashboard_path}?section=popular",
        metadata={"review_id": review.id, "liker_id": liker.id},
    )
