from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from universities.models import MessageReport, ReviewReport
from universities.report_service import status_label


class MyReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        message_reports = (
            MessageReport.objects.filter(reporter=request.user)
            .select_related("chat_message", "direct_message")
            .order_by("-created_at")[:50]
        )
        review_reports = (
            ReviewReport.objects.filter(reporter=request.user)
            .select_related("review", "review__university")
            .order_by("-created_at")[:50]
        )

        items = []
        for report in message_reports:
            preview = ""
            if report.chat_message_id:
                preview = (report.chat_message.text or "")[:80]
                target_type = "Guruh chat xabari"
            else:
                preview = (report.direct_message.text or "")[:80]
                target_type = "Shaxsiy xabar"
            items.append(
                {
                    "id": report.id,
                    "kind": "message",
                    "target_type": target_type,
                    "reason_label": report.get_reason_display(),
                    "status": report.status,
                    "status_label": status_label(report.status),
                    "target_preview": preview,
                    "created_at": report.created_at,
                    "updated_at": report.updated_at,
                }
            )

        for report in review_reports:
            university = report.review.university
            items.append(
                {
                    "id": report.id,
                    "kind": "review",
                    "target_type": "Sharh",
                    "reason_label": report.get_reason_display(),
                    "status": report.status,
                    "status_label": status_label(report.status),
                    "target_preview": (report.review.text or "")[:80],
                    "university_name": university.short_name or university.name,
                    "created_at": report.created_at,
                    "updated_at": report.updated_at,
                }
            )

        items.sort(key=lambda item: item["created_at"], reverse=True)
        return Response({"count": len(items), "results": items})
