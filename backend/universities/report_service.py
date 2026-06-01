from django.conf import settings

from accounts.models import Notification
from accounts.notifications_service import create_notification


class ReportStatus:
    PENDING = "pending"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

    LABELS = {
        PENDING: "Ko'rib chiqish kutilmoqda",
        IN_REVIEW: "Ko'rib chiqilmoqda",
        RESOLVED: "Hal qilindi",
        DISMISSED: "Rad etildi",
    }

    CHOICES = tuple(LABELS.items())


def status_label(status):
    return ReportStatus.LABELS.get(status, status)


def notify_reporter_report_received(report, *, target_type, target_label):
    create_notification(
        user=report.reporter,
        kind=Notification.Kind.REPORT_RECEIVED,
        title="Shikoyatingiz qabul qilindi",
        body=f"{target_label} bo'yicha shikoyatingiz moderatorlar navbatiga qo'shildi.",
        link="/dashboard?section=profile&panel=reports",
        metadata={
            "report_type": target_type,
            "report_id": report.id,
            "status": report.status,
        },
    )


def notify_reporter_status_changed(report, *, target_type, target_label):
    label = status_label(report.status)
    create_notification(
        user=report.reporter,
        kind=Notification.Kind.REPORT_UPDATED,
        title="Shikoyat holati yangilandi",
        body=f"{target_label}: {label}.",
        link="/dashboard?section=profile&panel=reports",
        metadata={
            "report_type": target_type,
            "report_id": report.id,
            "status": report.status,
        },
    )


def notify_moderators_new_report(report, *, target_type, summary):
    from django.core.mail import send_mail

    for address in getattr(settings, "REVIEW_MODERATOR_EMAILS", "").split(","):
        email = address.strip()
        if not email:
            continue
        try:
            send_mail(
                subject=f"MyUni moderator: yangi {target_type} shikoyati",
                message=f"Yangi shikoyat:\n\n{summary}\n\nModerator paneliga kiring.",
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None) or "hello@myuni.uz",
                recipient_list=[email],
                fail_silently=True,
            )
        except Exception:
            pass
