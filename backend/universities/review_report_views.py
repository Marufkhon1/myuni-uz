from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.rate_limit_utils import rate_limit_response

from .models import Review, ReviewReport
from .report_limits import check_report_submit_allowed, record_report_submit
from .report_service import notify_moderators_new_report, notify_reporter_report_received, status_label
from .review_moderation import reviews_visible_to_user
from .serializers import ReviewReportSerializer


class ReviewReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, review_id):
        review = get_object_or_404(Review, pk=review_id)
        if review.user_id == request.user.id:
            return Response(
                {"detail": "O'z sharhingiz haqida shikoyat yuborib bo'lmaydi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        visible = reviews_visible_to_user(
            Review.objects.filter(pk=review_id),
            request.user,
        ).exists()
        if not visible:
            return Response(
                {"detail": "Bu sharhni shikoyat qilish huquqingiz yo'q."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if ReviewReport.objects.filter(reporter=request.user, review=review).exists():
            return Response(
                {"detail": "Bu sharh haqida allaqachon shikoyat yuborgansiz."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        allowed, limit_message, retry_after = check_report_submit_allowed(request, request.user.id)
        if not allowed:
            return rate_limit_response(limit_message, retry_after)

        serializer = ReviewReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            report = ReviewReport.objects.create(
                reporter=request.user,
                review=review,
                reason=serializer.validated_data["reason"],
                details=serializer.validated_data.get("details", ""),
            )
        except IntegrityError:
            return Response(
                {"detail": "Bu sharh haqida allaqachon shikoyat yuborgansiz."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        record_report_submit(request, request.user.id)
        uni = review.university.short_name or review.university.name
        notify_reporter_report_received(report, target_type="review", target_label=f"{uni} sharhi")
        notify_moderators_new_report(
            report,
            target_type="sharh",
            summary=f"OTM: {uni}\nSabab: {report.get_reason_display()}\nMatn: {(review.text or '')[:120]}",
        )
        return Response(
            {
                "detail": "Shikoyat qabul qilindi. Holatni profil → Mening shikoyatlarim bo'limidan kuzatishingiz mumkin.",
                "report_id": report.id,
                "status": report.status,
                "status_label": status_label(report.status),
            },
            status=status.HTTP_201_CREATED,
        )
