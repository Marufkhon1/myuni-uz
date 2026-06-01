from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsModerator
from universities.models import MessageReport, ReviewReport
from universities.report_service import notify_reporter_status_changed, status_label

User = get_user_model()


class ModeratorReportUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[choice[0] for choice in ReviewReport.Status.choices]
    )
    moderator_notes = serializers.CharField(required=False, allow_blank=True, max_length=2000)


def _serialize_message_report(report):
    target = report.chat_message or report.direct_message
    preview = ""
    target_type = "message"
    if report.chat_message_id:
        target_type = "group_message"
        preview = (report.chat_message.text or "")[:120]
    elif report.direct_message_id:
        target_type = "direct_message"
        preview = (report.direct_message.text or "")[:120]

    return {
        "id": report.id,
        "kind": "message",
        "target_type": target_type,
        "reason": report.reason,
        "reason_label": report.get_reason_display(),
        "details": report.details,
        "status": report.status,
        "status_label": status_label(report.status),
        "moderator_notes": report.moderator_notes,
        "target_preview": preview,
        "reporter_id": report.reporter_id,
        "reporter_name": getattr(getattr(report.reporter, "profile", None), "full_name", report.reporter.email),
        "created_at": report.created_at,
        "updated_at": report.updated_at,
        "target_id": getattr(target, "id", None),
    }


def _serialize_review_report(report):
    review = report.review
    university = getattr(review, "university", None)
    return {
        "id": report.id,
        "kind": "review",
        "target_type": "review",
        "reason": report.reason,
        "reason_label": report.get_reason_display(),
        "details": report.details,
        "status": report.status,
        "status_label": status_label(report.status),
        "moderator_notes": report.moderator_notes,
        "target_preview": (review.text or "")[:120],
        "reporter_id": report.reporter_id,
        "reporter_name": getattr(getattr(report.reporter, "profile", None), "full_name", report.reporter.email),
        "university_name": getattr(university, "short_name", None) or getattr(university, "name", ""),
        "created_at": report.created_at,
        "updated_at": report.updated_at,
        "target_id": review.id,
    }


class ModeratorReportListView(APIView):
    permission_classes = [IsModerator]

    MERGE_POOL = 250
    PAGE_SIZE = 100

    def get(self, request):
        status_filter = (request.GET.get("status") or "").strip()
        kind = (request.GET.get("kind") or "").strip()

        message_qs = MessageReport.objects.select_related(
            "reporter",
            "reporter__profile",
            "chat_message",
            "direct_message",
        ).order_by("-created_at")
        review_qs = ReviewReport.objects.select_related(
            "reporter",
            "reporter__profile",
            "review",
            "review__university",
        ).order_by("-created_at")

        if status_filter:
            message_qs = message_qs.filter(status=status_filter)
            review_qs = review_qs.filter(status=status_filter)

        total_count = 0
        items = []
        if kind != "review":
            total_count += message_qs.count()
            items.extend(
                _serialize_message_report(report)
                for report in message_qs[: self.MERGE_POOL]
            )
        if kind != "message":
            total_count += review_qs.count()
            items.extend(
                _serialize_review_report(report)
                for report in review_qs[: self.MERGE_POOL]
            )

        items.sort(key=lambda item: item["created_at"], reverse=True)
        results = items[: self.PAGE_SIZE]
        pending_count = MessageReport.objects.filter(
            status__in=[MessageReport.Status.PENDING, MessageReport.Status.IN_REVIEW]
        ).count() + ReviewReport.objects.filter(
            status__in=[ReviewReport.Status.PENDING, ReviewReport.Status.IN_REVIEW]
        ).count()

        return Response(
            {
                "count": len(results),
                "total_count": total_count,
                "pending_count": pending_count,
                "results": results,
            }
        )


class ModeratorMessageReportUpdateView(APIView):
    permission_classes = [IsModerator]

    def patch(self, request, report_id):
        report = MessageReport.objects.select_related("reporter", "chat_message", "direct_message").filter(
            pk=report_id
        ).first()
        if not report:
            return Response({"detail": "Shikoyat topilmadi."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ModeratorReportUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        old_status = report.status
        report.status = serializer.validated_data["status"]
        if "moderator_notes" in serializer.validated_data:
            report.moderator_notes = serializer.validated_data["moderator_notes"]
        report.resolved_by = request.user
        report.save(update_fields=["status", "moderator_notes", "resolved_by", "updated_at"])

        if old_status != report.status:
            notify_reporter_status_changed(
                report,
                target_type="message",
                target_label="Xabar shikoyati",
            )

        return Response(_serialize_message_report(report))


class ModeratorReviewReportUpdateView(APIView):
    permission_classes = [IsModerator]

    def patch(self, request, report_id):
        report = ReviewReport.objects.select_related("reporter", "review", "review__university").filter(
            pk=report_id
        ).first()
        if not report:
            return Response({"detail": "Shikoyat topilmadi."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ModeratorReportUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        old_status = report.status
        report.status = serializer.validated_data["status"]
        if "moderator_notes" in serializer.validated_data:
            report.moderator_notes = serializer.validated_data["moderator_notes"]
        report.resolved_by = request.user
        report.save(update_fields=["status", "moderator_notes", "resolved_by", "updated_at"])

        if old_status != report.status:
            uni = report.review.university.short_name or report.review.university.name
            notify_reporter_status_changed(
                report,
                target_type="review",
                target_label=f"{uni} sharhi",
            )

        return Response(_serialize_review_report(report))
